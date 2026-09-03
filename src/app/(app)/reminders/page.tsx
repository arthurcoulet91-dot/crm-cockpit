import { PageHeader } from "@/components/page-header"
import { ReminderFormSheet } from "@/components/reminders/reminder-form-sheet"
import { RemindersList } from "@/components/reminders/reminders-list"
import { createClient } from "@/lib/supabase/server"
import type { Database } from "@/lib/supabase/types"

type ReminderWithClient = Database["public"]["Tables"]["reminders"]["Row"] & {
  clients: { id: string; name: string } | null
}

export default async function RemindersPage() {
  const supabase = await createClient()
  const [remindersRes, { data: clients }] = await Promise.all([
    supabase
      .from("reminders")
      .select("*, clients(id, name)")
      .order("remind_date", { ascending: true })
      .order("remind_time", { ascending: true, nullsFirst: false }),
    supabase.from("clients").select("id, name").order("name"),
  ])
  const reminders = (remindersRes.data ?? []) as unknown as ReminderWithClient[]

  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader
        title="Rappels"
        description="Tâches du jour et appels à passer — avec un email à 7h et un email à l'heure de chaque appel."
        actions={<ReminderFormSheet clients={clients ?? []} />}
      />
      <RemindersList reminders={reminders} clients={clients ?? []} />
    </div>
  )
}
