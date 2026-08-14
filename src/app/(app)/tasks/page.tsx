import { PageHeader } from "@/components/page-header"
import { TaskFormSheet } from "@/components/tasks/task-form-sheet"
import { TasksList } from "@/components/tasks/tasks-list"
import { createClient } from "@/lib/supabase/server"
import type { Database } from "@/lib/supabase/types"

type TaskWithClient = Database["public"]["Tables"]["tasks"]["Row"] & {
  clients: { id: string; name: string } | null
}

export default async function TasksPage() {
  const supabase = await createClient()
  const [tasksRes, { data: clients }] = await Promise.all([
    supabase
      .from("tasks")
      .select("*, clients(id, name)")
      .order("due_date", { ascending: true, nullsFirst: false }),
    supabase.from("clients").select("id, name").order("name"),
  ])
  const tasks = (tasksRes.data ?? []) as unknown as TaskWithClient[]

  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader
        title="Tâches"
        description="Ce qu'il y a à faire aujourd'hui et cette semaine."
        actions={<TaskFormSheet clients={clients ?? []} />}
      />
      <TasksList tasks={tasks} clients={clients ?? []} />
    </div>
  )
}
