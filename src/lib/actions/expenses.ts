"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import type { ExpenseFrequency, ExpenseType } from "@/lib/supabase/types"

function str(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null
}

function num(formData: FormData, key: string) {
  const value = str(formData, key)
  return value ? Number(value) : 0
}

export async function createExpense(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Non authentifié")

  const { error } = await supabase.from("expenses").insert({
    user_id: user.id,
    label: str(formData, "label") ?? "",
    amount: num(formData, "amount"),
    category: str(formData, "category"),
    type: (str(formData, "type") ?? "variable") as ExpenseType,
    frequency: (str(formData, "frequency") ?? "one_off") as ExpenseFrequency,
    date: str(formData, "date") ?? new Date().toISOString().slice(0, 10),
  })

  if (error) throw new Error(error.message)
  revalidatePath("/finances")
  revalidatePath("/")
}

export async function deleteExpense(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("expenses").delete().eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/finances")
  revalidatePath("/")
}
