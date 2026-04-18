import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function getAuthedContext() {
  const user = await requireUser();
  const supabase = createSupabaseAdminClient();
  return { user, supabase };
}

export function json(data, init = {}) {
  return NextResponse.json(data, init);
}