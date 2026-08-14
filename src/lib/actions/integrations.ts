"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import { fetchGhlContacts, fetchGhlOpportunities } from "@/lib/ghl"
import type { IntegrationProvider } from "@/lib/supabase/types"

export async function disconnectIntegration(provider: IntegrationProvider) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("integration_connections")
    .delete()
    .eq("provider", provider)
  if (error) throw new Error(error.message)
  revalidatePath("/settings/integrations")
}

export async function saveGhlConnection(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Non authentifié")

  const token = formData.get("token")
  const locationId = formData.get("location_id")

  if (typeof token !== "string" || !token.trim()) {
    throw new Error("Le token est requis")
  }

  const { error } = await supabase.from("integration_connections").upsert(
    {
      user_id: user.id,
      provider: "ghl",
      access_token: token.trim(),
      external_account_id: typeof locationId === "string" ? locationId.trim() : null,
    },
    { onConflict: "user_id,provider" }
  )
  if (error) throw new Error(error.message)
  revalidatePath("/settings/integrations")
}

export async function syncGhlData(): Promise<{ contacts: number; opportunities: number }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Non authentifié")

  const { data: connection } = await supabase
    .from("integration_connections")
    .select("*")
    .eq("provider", "ghl")
    .single()

  if (!connection?.access_token || !connection.external_account_id) {
    throw new Error("GoHighLevel n'est pas connecté")
  }

  const contacts = await fetchGhlContacts(
    connection.access_token,
    connection.external_account_id
  )

  for (const contact of contacts) {
    const name =
      contact.contactName ||
      [contact.firstName, contact.lastName].filter(Boolean).join(" ") ||
      contact.email ||
      "Contact GoHighLevel"

    const { error } = await supabase.from("clients").upsert(
      {
        user_id: user.id,
        source: "ghl",
        ghl_contact_id: contact.id,
        name,
        company: contact.companyName ?? null,
        email: contact.email ?? null,
        phone: contact.phone ?? null,
        address: contact.address1 ?? null,
      },
      { onConflict: "user_id,ghl_contact_id" }
    )
    if (error) throw new Error(error.message)
  }

  const opportunities = await fetchGhlOpportunities(
    connection.access_token,
    connection.external_account_id
  )

  const { data: localClients } = await supabase
    .from("clients")
    .select("id, ghl_contact_id")
    .eq("source", "ghl")

  const clientIdByGhlContact = new Map(
    (localClients ?? [])
      .filter((c) => c.ghl_contact_id)
      .map((c) => [c.ghl_contact_id as string, c.id])
  )

  for (const opp of opportunities) {
    const { error } = await supabase.from("opportunities").upsert(
      {
        user_id: user.id,
        source: "ghl",
        ghl_opportunity_id: opp.id,
        title: opp.name,
        amount: opp.monetaryValue ?? 0,
        client_id: opp.contactId ? clientIdByGhlContact.get(opp.contactId) ?? null : null,
      },
      { onConflict: "user_id,ghl_opportunity_id" }
    )
    if (error) throw new Error(error.message)
  }

  revalidatePath("/clients")
  revalidatePath("/pipeline")
  revalidatePath("/settings/integrations")

  return { contacts: contacts.length, opportunities: opportunities.length }
}
