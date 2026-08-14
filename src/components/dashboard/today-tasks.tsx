"use client"

import { toast } from "sonner"
import Link from "next/link"
import { CheckSquare2 } from "lucide-react"

import { toggleTaskStatus } from "@/lib/actions/tasks"
import { Checkbox } from "@/components/ui/checkbox"
import { TaskPriorityBadge } from "@/components/status-badge"
import { EmptyState } from "@/components/empty-state"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Database, TaskPriority } from "@/lib/supabase/types"

type TaskRow = Pick<
  Database["public"]["Tables"]["tasks"]["Row"],
  "id" | "title" | "due_date" | "priority" | "status"
> & { isOverdue: boolean }

export function TodayTasks({ tasks }: { tasks: TaskRow[] }) {
  if (tasks.length === 0) {
    return (
      <EmptyState
        icon={CheckSquare2}
        title="Rien à faire aujourd'hui"
        description="Toutes tes tâches du jour sont terminées."
      />
    )
  }

  function handleToggle(id: string) {
    toggleTaskStatus(id, "done").catch((err) => {
      toast.error(err instanceof Error ? err.message : "Une erreur est survenue")
    })
  }

  return (
    <ul className="divide-y">
      {tasks.map((task) => (
        <li key={task.id} className="flex items-center gap-3 py-2.5">
          <Checkbox checked={false} onCheckedChange={() => handleToggle(task.id)} />
          <span className="min-w-0 flex-1 truncate text-sm">{task.title}</span>
          {task.due_date && (
            <span
              className={cn(
                "text-xs",
                task.isOverdue ? "text-destructive" : "text-muted-foreground"
              )}
            >
              {formatDate(task.due_date)}
            </span>
          )}
          <TaskPriorityBadge priority={task.priority as TaskPriority} />
        </li>
      ))}
      <li className="pt-2 text-right">
        <Link href="/tasks" className="text-xs text-muted-foreground hover:text-foreground">
          Voir toutes les tâches →
        </Link>
      </li>
    </ul>
  )
}
