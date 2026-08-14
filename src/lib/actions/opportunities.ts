"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import type { OpportunityStage } from "@/lib/supabase/types"

function str(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null
}

function num(formData: FormData, key: string) {
  const value = str(formData, key)
  return value ? Number(value) : 0
}

export async function createOpportunity(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Non authentifié")

  const { error } = await supabase.from("opportunities").insert({
    user_id: user.id,
    client_id: str(formData, "client_id"),
    title: str(formData, "title") ?? "",
    amount: num(formData, "amount"),
    stage: (str(formData, "stage") ?? "proposal_sent") as OpportunityStage,
    expected_close_date: str(formData, "expected_close_date"),
    notes: str(formData, "notes"),
  })

  if (error) throw new Error(error.message)
  revalidatePath("/pipeline")
}

export async function updateOpportunity(id: string, formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("opportunities")
    .update({
      client_id: str(formData, "client_id"),
      title: str(formData, "title") ?? "",
      amount: num(formData, "amount"),
      stage: (str(formData, "stage") ?? "proposal_sent") as OpportunityStage,
      expected_close_date: str(formData, "expected_close_date"),
      notes: str(formData, "notes"),
    })
    .eq("id", id)

  if (error) throw new Error(error.message)
  revalidatePath("/pipeline")
}

export async function updateOpportunityStage(id: string, stage: OpportunityStage) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("opportunities")
    .update({ stage })
    .eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/pipeline")
}

export async function deleteOpportunity(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("opportunities").delete().eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/pipeline")
}
