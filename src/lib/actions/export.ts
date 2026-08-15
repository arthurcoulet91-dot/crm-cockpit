"use server"

import { createClient } from "@/lib/supabase/server"
import { formatRecurrence } from "@/lib/format"

function toCSV(rows: Record<string, unknown>[], headers: { key: string; label: string }[]) {
  const escape = (value: unknown) => {
    const s = value === null || value === undefined ? "" : String(value)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const lines = [
    headers.map((h) => escape(h.label)).join(","),
    ...rows.map((row) => headers.map((h) => escape(row[h.key])).join(",")),
  ]
  return lines.join("\n")
}

const clientTypeLabels: Record<string, string> = {
  pro: "Professionnel",
  particulier: "Particulier",
}

const contractStatusLabels: Record<string, string> = {
  draft: "Brouillon",
  active: "Actif",
  completed: "Terminé",
  cancelled: "Annulé",
}

export async function exportClientsCSV(): Promise<string> {
  const supabase = await createClient()
  const { data, error } = await supabase.from("clients").select("*").order("name")
  if (error) throw new Error(error.message)

  const rows = (data ?? []).map((c) => ({
    ...c,
    type: clientTypeLabels[c.type] ?? c.type,
  }))

  return toCSV(rows, [
    { key: "name", label: "Nom" },
    { key: "type", label: "Type" },
    { key: "company", label: "Société" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Téléphone" },
    { key: "address", label: "Adresse" },
    { key: "notes", label: "Notes" },
    { key: "created_at", label: "Créé le" },
  ])
}

export async function exportContractsCSV(): Promise<string> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("contracts")
    .select("*, clients(name)")
    .order("created_at", { ascending: false })
  if (error) throw new Error(error.message)

  const rows = (
    (data ?? []) as unknown as Array<{
      title: string
      clients: { name: string } | null
      status: string
      amount: number
      recurrence_months: number | null
      start_date: string | null
      end_date: string | null
      renewal_date: string | null
    }>
  ).map((c) => ({
    title: c.title,
    client_name: c.clients?.name ?? "",
    status: contractStatusLabels[c.status] ?? c.status,
    amount: c.amount,
    recurrence: formatRecurrence(c.recurrence_months),
    start_date: c.start_date ?? "",
    end_date: c.end_date ?? "",
    renewal_date: c.renewal_date ?? "",
  }))

  return toCSV(rows, [
    { key: "title", label: "Titre" },
    { key: "client_name", label: "Client" },
    { key: "status", label: "Statut" },
    { key: "amount", label: "Montant" },
    { key: "recurrence", label: "Récurrence" },
    { key: "start_date", label: "Début" },
    { key: "end_date", label: "Fin" },
    { key: "renewal_date", label: "Renouvellement" },
  ])
}
