import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database, Tables } from "@/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase env vars. NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required.",
  );
}

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type FormatRow = Pick<
  Tables<"formats">,
  "id" | "slug" | "display_name" | "instruction" | "is_active" | "category"
>;

type RouteContext = {
  params: Promise<{ commandId: string }>;
};

export async function GET(_req: Request, context: RouteContext) {
  const { commandId } = await context.params;

  if (!commandId || !uuidPattern.test(commandId)) {
    return NextResponse.json({ error: "Invalid command ID." }, { status: 400 });
  }

  const client = createClient<Database>(supabaseUrl, supabaseAnonKey);
  const { data, error } = await client
    .from("command_formats")
    .select(
      "format:formats(id, slug, display_name, instruction, is_active, category)",
    )
    .eq("command_id", commandId);

  if (error) {
    console.error("command_formats_select_failed", error);
    return NextResponse.json({ formats: [] }, { status: 500 });
  }

  const formats =
    (data ?? [])
      .map((row) => row.format)
      .filter(
        (fmt): fmt is FormatRow =>
          Boolean(fmt) && fmt?.is_active !== false,
      );

  return NextResponse.json({ formats });
}
