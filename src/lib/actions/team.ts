"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"

export async function getEffectiveOwnerId(): Promise<string> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc("effective_owner_id")
  if (error) throw new Error(error.message)
  return data as string
}

export async function getMyTeamOwner() {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc("get_my_team_owner")
  if (error) throw new Error(error.message)
  const rows = (data ?? []) as { owner_id: string; email: string }[]
  return rows[0] ?? null
}

export async function listTeamMembers() {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc("list_team_members")
  if (error) throw new Error(error.message)
  return (data ?? []) as { member_id: string; email: string; joined_at: string }[]
}

export async function inviteTeamMember(formData: FormData) {
  const email = formData.get("email")
  if (typeof email !== "string" || !email.trim()) {
    throw new Error("Email requis")
  }

  const supabase = await createClient()
  const { error } = await supabase.rpc("invite_team_member", {
    target_email: email.trim(),
  })
  if (error) throw new Error(error.message)
  revalidatePath("/settings/team")
}

export async function removeTeamMember(memberId: string) {
  const supabase = await createClient()
  const { error } = await supabase.rpc("remove_team_member", {
    target_member_id: memberId,
  })
  if (error) throw new Error(error.message)
  revalidatePath("/settings/team")
}
