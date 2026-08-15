"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import { getEffectiveOwnerId } from "@/lib/actions/team"
import type { ClientType } from "@/lib/supabase/types"

function str(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null
}

export async function createClientRecord(formData: FormData) {
  const supabase = await createClient()
  const ownerId = await getEffectiveOwnerId()

  const { error } = await supabase.from("clients").insert({
    user_id: ownerId,
    name: str(formData, "name") ?? "",
    type: (str(formData, "type") ?? "pro") as ClientType,
    company: str(formData, "company"),
    email: str(formData, "email"),
    phone: str(formData, "phone"),
    address: str(formData, "address"),
    notes: str(formData, "notes"),
  })

  if (error) throw new Error(error.message)
  revalidatePath("/clients")
}

export async function createQuickClient(formData: FormData): Promise<{ id: string; name: string }> {
  const supabase = await createClient()
  const ownerId = await getEffectiveOwnerId()

  const name = str(formData, "name")
  if (!name) throw new Error("Nom requis")

  const { data, error } = await supabase
    .from("clients")
    .insert({
      user_id: ownerId,
      name,
      type: (str(formData, "type") ?? "particulier") as ClientType,
      email: str(formData, "email"),
      phone: str(formData, "phone"),
    })
    .select("id, name")
    .single()

  if (error) throw new Error(error.message)
  revalidatePath("/clients")
  return data
}

export async function updateClientRecord(id: string, formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("clients")
    .update({
      name: str(formData, "name") ?? "",
      type: (str(formData, "type") ?? "pro") as ClientType,
      company: str(formData, "company"),
      email: str(formData, "email"),
      phone: str(formData, "phone"),
      address: str(formData, "address"),
      notes: str(formData, "notes"),
    })
    .eq("id", id)

  if (error) throw new Error(error.message)
  revalidatePath("/clients")
  revalidatePath(`/clients/${id}`)
}

export async function deleteClientRecord(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("clients").delete().eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/clients")
}
