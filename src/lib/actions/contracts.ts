"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import { getEffectiveOwnerId } from "@/lib/actions/team"
import type { ContractStatus } from "@/lib/supabase/types"

function str(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null
}

function num(formData: FormData, key: string) {
  const value = str(formData, key)
  return value ? Number(value) : 0
}

function recurrenceMonths(formData: FormData) {
  const value = str(formData, "recurrence_months")
  if (!value) return null
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? Math.round(n) : null
}

export async function createContractRecord(formData: FormData) {
  const supabase = await createClient()
  const ownerId = await getEffectiveOwnerId()

  const clientId = str(formData, "client_id")
  if (!clientId) throw new Error("Client requis")

  const { error } = await supabase.from("contracts").insert({
    user_id: ownerId,
    client_id: clientId,
    title: str(formData, "title") ?? "",
    amount: num(formData, "amount"),
    status: (str(formData, "status") ?? "draft") as ContractStatus,
    recurrence_months: recurrenceMonths(formData),
    start_date: str(formData, "start_date"),
    end_date: str(formData, "end_date"),
    renewal_date: str(formData, "renewal_date"),
    notes: str(formData, "notes"),
  })

  if (error) throw new Error(error.message)
  revalidatePath("/contracts")
  revalidatePath("/clients")
}

export async function updateContractRecord(id: string, formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("contracts")
    .update({
      title: str(formData, "title") ?? "",
      amount: num(formData, "amount"),
      status: (str(formData, "status") ?? "draft") as ContractStatus,
      recurrence_months: recurrenceMonths(formData),
      start_date: str(formData, "start_date"),
      end_date: str(formData, "end_date"),
      renewal_date: str(formData, "renewal_date"),
      notes: str(formData, "notes"),
    })
    .eq("id", id)

  if (error) throw new Error(error.message)
  revalidatePath("/contracts")
  revalidatePath("/clients")
}

export async function deleteContractRecord(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("contracts").delete().eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/contracts")
  revalidatePath("/clients")
}
