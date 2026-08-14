import { PageHeader } from "@/components/page-header"
import { TaskFormSheet } from "@/components/tasks/task-form-sheet"
import { TasksList } from "@/components/tasks/tasks-list"
import { createClient } from "@/lib/supabase/server"

export default async function TasksPage() {
  const supabase = await createClient()
  const [{ data: tasks }, { data: clients }] = await Promise.all([
    supabase
      .from("tasks")
      .select("*, clients(id, name)")
      .order("due_date", { ascending: true, nullsFirst: false }),
    supabase.from("clients").select("id, name").order("name"),
  ])

  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader
        title="Tâches"
        description="Ce qu'il y a à faire aujourd'hui et cette semaine."
        actions={<TaskFormSheet clients={clients ?? []} />}
      />
      <TasksList tasks={tasks ?? []} clients={clients ?? []} />
    </div>
  )
}
