"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import { getEffectiveOwnerId } from "@/lib/actions/team"
import type { ActivityType } from "@/lib/supabase/types"

export async function createActivity(input: {
  clientId?: string | null
  contractId?: string | null
  type?: ActivityType
  content: string
}) {
  const supabase = await createClient()
  const ownerId = await getEffectiveOwnerId()

  const { error } = await supabase.from("activities").insert({
    user_id: ownerId,
    client_id: input.clientId ?? null,
    contract_id: input.contractId ?? null,
    type: input.type ?? "note",
    content: input.content,
  })

  if (error) throw new Error(error.message)
  if (input.clientId) revalidatePath(`/clients/${input.clientId}`)
}

export async function deleteActivity(id: string, clientId?: string | null) {
  const supabase = await createClient()
  const { error } = await supabase.from("activities").delete().eq("id", id)
  if (error) throw new Error(error.message)
  if (clientId) revalidatePath(`/clients/${clientId}`)
}
