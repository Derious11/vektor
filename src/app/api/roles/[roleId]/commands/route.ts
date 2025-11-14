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

type CommandRow = Pick<
  Tables<"commands">,
  "id" | "display_text" | "template_text" | "is_global"
>;

type RouteContext = {
  params: Promise<{ roleId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { roleId } = await context.params;

  if (!roleId || !uuidPattern.test(roleId)) {
    return NextResponse.json(
      { error: "Invalid role_id format." },
      { status: 400 },
    );
  }

  const client = createClient<Database>(supabaseUrl, supabaseAnonKey);
  const { data, error } = await client
    .from("role_commands")
    .select("command:commands(id, display_text, template_text, is_global)")
    .eq("role_id", roleId);

  if (error) {
    console.error("role_commands_select_failed", error);
    return NextResponse.json(
      { error: "Unable to load suggested commands." },
      { status: 500 },
    );
  }

  const commands =
    (data ?? [])
      .map((row) => row.command)
      .filter((cmd): cmd is CommandRow => Boolean(cmd))
      .sort((a, b) => a.display_text.localeCompare(b.display_text));

  return NextResponse.json({ commands });
}
