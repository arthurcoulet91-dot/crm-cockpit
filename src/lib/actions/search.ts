"use server"

import { createClient } from "@/lib/supabase/server"

export type SearchResult = {
  id: string
  type: "client" | "contract" | "task"
  title: string
  subtitle?: string | null
  href: string
}

export async function searchEverything(query: string): Promise<SearchResult[]> {
  const q = query.trim()
  if (q.length < 2) return []

  const supabase = await createClient()

  const [clientsRes, contractsRes, tasksRes] = await Promise.all([
    supabase
      .from("clients")
      .select("id, name, company")
      .ilike("name", `%${q}%`)
      .limit(5),
    supabase
      .from("contracts")
      .select("id, title, clients(name)")
      .ilike("title", `%${q}%`)
      .limit(5),
    supabase
      .from("tasks")
      .select("id, title")
      .ilike("title", `%${q}%`)
      .limit(5),
  ])

  const contracts = (contractsRes.data ?? []) as unknown as {
    id: string
    title: string
    clients: { name: string } | null
  }[]

  const results: SearchResult[] = [
    ...(clientsRes.data ?? []).map((c) => ({
      id: c.id,
      type: "client" as const,
      title: c.name,
      subtitle: c.company,
      href: `/clients/${c.id}`,
    })),
    ...contracts.map((c) => ({
      id: c.id,
      type: "contract" as const,
      title: c.title,
      subtitle: c.clients?.name,
      href: `/contracts`,
    })),
    ...(tasksRes.data ?? []).map((t) => ({
      id: t.id,
      type: "task" as const,
      title: t.title,
      href: `/tasks`,
    })),
  ]

  return results
}
