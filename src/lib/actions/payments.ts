"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import { getEffectiveOwnerId } from "@/lib/actions/team"
import type { PaymentStatus } from "@/lib/supabase/types"

function str(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null
}

function num(formData: FormData, key: string) {
  const value = str(formData, key)
  return value ? Number(value) : 0
}

export async function createPayment(formData: FormData) {
  const supabase = await createClient()
  const ownerId = await getEffectiveOwnerId()

  const contractId = str(formData, "contract_id")
  const label = str(formData, "label")
  if (!contractId && !label) {
    throw new Error("Choisis un contrat ou décris ce paiement ponctuel")
  }
  if (contractId && label) {
    throw new Error("Choisis soit un contrat, soit une description ponctuelle — pas les deux")
  }

  const status = (str(formData, "status") ?? "pending") as PaymentStatus
  const paidDate = str(formData, "paid_date")

  const { error } = await supabase.from("contract_payments").insert({
    user_id: ownerId,
    contract_id: contractId,
    label: contractId ? null : label,
    amount: num(formData, "amount"),
    due_date: str(formData, "due_date") ?? new Date().toISOString().slice(0, 10),
    status,
    paid_date: status === "paid" ? paidDate ?? new Date().toISOString().slice(0, 10) : null,
  })

  if (error) throw new Error(error.message)
  revalidatePath("/finances")
  revalidatePath("/")
}

export async function markPaymentPaid(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("contract_payments")
    .update({ status: "paid", paid_date: new Date().toISOString().slice(0, 10) })
    .eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/finances")
  revalidatePath("/")
}

export async function deletePayment(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("contract_payments").delete().eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/finances")
  revalidatePath("/")
}
