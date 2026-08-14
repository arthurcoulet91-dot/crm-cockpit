import { PageHeader } from "@/components/page-header"
import { CalendarView, type AgendaItem } from "@/components/calendar/calendar-view"
import { createClient } from "@/lib/supabase/server"

export default async function CalendarPage() {
  const supabase = await createClient()

  const in90Days = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10)
  const from90DaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10)

  const [tasksRes, contractsRes] = await Promise.all([
    supabase
      .from("tasks")
      .select("id, title, due_date, status")
      .neq("status", "done")
      .not("due_date", "is", null)
      .gte("due_date", from90DaysAgo)
      .lte("due_date", in90Days)
      .order("due_date"),
    supabase
      .from("contracts")
      .select("id, title, renewal_date, clients(name)")
      .eq("status", "active")
      .not("renewal_date", "is", null)
      .gte("renewal_date", from90DaysAgo)
      .lte("renewal_date", in90Days)
      .order("renewal_date"),
  ])

  const contracts = (contractsRes.data ?? []) as unknown as {
    id: string
    title: string
    renewal_date: string
    clients: { name: string } | null
  }[]

  const items: AgendaItem[] = [
    ...(tasksRes.data ?? []).map((t) => ({
      id: `task-${t.id}`,
      date: t.due_date as string,
      type: "task" as const,
      title: t.title,
      href: "/tasks",
    })),
    ...contracts.map((c) => ({
      id: `renewal-${c.id}`,
      date: c.renewal_date,
      type: "renewal" as const,
      title: `Renouvellement — ${c.title}`,
      subtitle: c.clients?.name,
      href: "/contracts",
    })),
  ].sort((a, b) => a.date.localeCompare(b.date))

  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader
        title="Calendrier"
        description="Tâches, renouvellements et rendez-vous Google Agenda, au même endroit."
      />
      <CalendarView items={items} />
    </div>
  )
}
