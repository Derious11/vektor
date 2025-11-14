type JsonPrimitive = string | number | boolean | null;

type FilterValue = JsonPrimitive;

type PostgrestError = {
  message: string;
  status?: number;
  details?: string;
};

type PostgrestResponse<T> = {
  data: T | null;
  error: PostgrestError | null;
};

type Fetcher = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

type ClientOptions = {
  global?: {
    headers?: Record<string, string>;
  };
  fetch?: Fetcher;
};

class PostgrestQueryBuilder<TData> implements PromiseLike<PostgrestResponse<TData>> {
  private filters: Record<string, string> = {};
  private orderClauses: string[] = [];
  private limitValue?: number;
  private singleRecord = false;

  constructor(
    private readonly config: {
      table: string;
      select: string;
      baseUrl: string;
      apiKey: string;
      fetcher: Fetcher;
      headers: Record<string, string>;
    },
  ) {}

  eq(column: string, value: FilterValue) {
    const encoded =
      value === null
        ? "is.null"
        : `eq.${typeof value === "boolean" ? String(value) : value}`;
    this.filters[column] = encoded;
    return this;
  }

  order(column: string, opts?: { ascending?: boolean }) {
    const direction = opts?.ascending === false ? "desc" : "asc";
    this.orderClauses.push(`${column}.${direction}`);
    return this;
  }

  limit(count: number) {
    this.limitValue = count;
    return this;
  }

  single() {
    this.singleRecord = true;
    return this;
  }

  private async execute(): Promise<PostgrestResponse<TData>> {
    const url = new URL(`/rest/v1/${this.config.table}`, this.config.baseUrl);
    url.searchParams.set("select", this.config.select);

    Object.entries(this.filters).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });

    if (this.orderClauses.length > 0) {
      url.searchParams.set("order", this.orderClauses.join(","));
    }

    if (typeof this.limitValue === "number") {
      url.searchParams.set("limit", String(this.limitValue));
    }

    const headers: Record<string, string> = {
      apikey: this.config.apiKey,
      Authorization: `Bearer ${this.config.apiKey}`,
      ...this.config.headers,
    };

    const response = await this.config.fetcher(url.toString(), {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (!response.ok) {
      const message = await response.text();
      return {
        data: null,
        error: {
          message: message || response.statusText,
          status: response.status,
        },
      };
    }

    let payload: unknown = await response.json();
    if (this.singleRecord && Array.isArray(payload)) {
      payload = payload[0] ?? null;
    }

    return {
      data: payload as TData,
      error: null,
    };
  }

  then<TResult1 = PostgrestResponse<TData>, TResult2 = never>(
    onfulfilled?:
      | ((value: PostgrestResponse<TData>) => TResult1 | PromiseLike<TResult1>)
      | undefined
      | null,
    onrejected?:
      | ((reason: unknown) => TResult2 | PromiseLike<TResult2>)
      | undefined
      | null,
  ) {
    return this.execute().then(onfulfilled, onrejected);
  }

  catch<TResult = never>(
    onrejected?:
      | ((reason: unknown) => TResult | PromiseLike<TResult>)
      | undefined
      | null,
  ) {
    return this.execute().catch(onrejected);
  }

  finally(onfinally?: (() => void) | undefined | null) {
    return this.execute().finally(onfinally ?? undefined);
  }
}

type InferRow<
  Database,
  TableName extends string,
> = Database extends {
  public: { Tables: Record<TableName, { Row: infer R }> }
}
  ? R
  : unknown;

type SupabaseClientShim<Database> = {
  from<TableName extends string>(
    table: TableName,
  ): {
    select<T = InferRow<Database, TableName>>(columns: string): PostgrestQueryBuilder<T>;
  };
};

export function createClient<Database = unknown>(
  url: string,
  anonKey: string,
  options?: ClientOptions,
): SupabaseClientShim<Database> {
  if (!url) {
    throw new Error("Supabase URL is required for createClient.");
  }

  if (!anonKey) {
    throw new Error("Supabase anon key is required for createClient.");
  }

  const normalizedUrl = url.replace(/\/$/, "");
  const fetcher = options?.fetch ?? fetch.bind(globalThis);
  const baseHeaders = options?.global?.headers ?? {};

  return {
    from<TableName extends string>(table: TableName) {
      return {
        select<T = InferRow<Database, TableName>>(columns: string) {
          return new PostgrestQueryBuilder<T>({
            table,
            select: columns,
            baseUrl: normalizedUrl,
            apiKey: anonKey,
            fetcher,
            headers: baseHeaders,
          });
        },
      };
    },
  };
}
