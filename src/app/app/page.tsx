import { createClient } from "@supabase/supabase-js";
import type { Database, Tables } from "@/types/database";
import PromptWizardClient, {
  CommandOption,
  FormatOption,
  RoleOption,
} from "./prompt-wizard-client";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase env vars. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
  );
}

type RoleRow = Pick<
  Tables<"roles">,
  | "id"
  | "slug"
  | "display_name"
  | "category"
  | "meta_prompt"
  | "context_placeholder"
>;

type CommandRow = Tables<"commands"> & {
  role_commands: { role_id: string }[] | null;
};

type FormatRow = Pick<
  Tables<"formats">,
  "id" | "slug" | "display_name" | "instruction" | "is_active"
>;

async function fetchRoles(): Promise<RoleOption[]> {
  const client = createClient<Database>(supabaseUrl, supabaseAnonKey);
  const { data, error } = await client
    .from("roles")
    .select("id, slug, display_name, category, meta_prompt, context_placeholder")
    .eq("is_active", true)
    .order("category", { ascending: true })
    .order("display_name", { ascending: true });

  if (error) {
    console.error("Failed to fetch roles:", error);
    throw new Error("Unable to load roles for the wizard.");
  }

  return (data ?? []) as RoleRow[];
}

async function fetchCommands(): Promise<CommandOption[]> {
  const client = createClient<Database>(supabaseUrl, supabaseAnonKey);
  const { data, error } = await client
    .from("commands")
    .select("id, display_text, template_text, is_global, role_commands(role_id)")
    .order("display_text", { ascending: true });

  if (error) {
    console.error("Failed to fetch commands:", error);
    throw new Error("Unable to load commands for the wizard.");
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    display_text: row.display_text,
    template_text: row.template_text,
    is_global: row.is_global,
    role_ids: row.role_commands?.map((rc) => rc.role_id) ?? [],
  }));
}

async function fetchFormats(): Promise<FormatOption[]> {
  const client = createClient<Database>(supabaseUrl, supabaseAnonKey);
  const { data, error } = await client
    .from("formats")
    .select("id, slug, display_name, instruction, is_active")
    .eq("is_active", true)
    .order("display_name", { ascending: true });

  if (error) {
    console.error("Failed to fetch formats:", error);
    throw new Error("Unable to load formats for the wizard.");
  }

  return (data ?? []) as FormatRow[];
}

export default async function PromptBuilderRoute() {
  const roles = await fetchRoles();
  const commands = await fetchCommands();
  const formats = await fetchFormats();
  return (
    <PromptWizardClient roles={roles} commands={commands} formats={formats} />
  );
}
