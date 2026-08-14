"use client"

import * as React from "react"
import { toast } from "sonner"
import { Pencil } from "lucide-react"

import { deleteTask, toggleTaskStatus } from "@/lib/actions/tasks"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { DeleteConfirmButton } from "@/components/delete-confirm-button"
import { TaskFormSheet } from "@/components/tasks/task-form-sheet"
import { TaskPriorityBadge } from "@/components/status-badge"
import { EmptyState } from "@/components/empty-state"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import { CheckSquare2 } from "lucide-react"
import type { Database } from "@/lib/supabase/types"

type TaskRow = Database["public"]["Tables"]["tasks"]["Row"] & {
  clients: { id: string; name: string } | null
}

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export function TasksList({
  tasks,
  clients,
}: {
  tasks: TaskRow[]
  clients: { id: string; name: string }[]
}) {
  const today = todayISO()

  const pending = tasks.filter((t) => t.status !== "done")
  const done = tasks.filter((t) => t.status === "done")

  const overdue = pending.filter((t) => t.due_date && t.due_date < today)
  const dueToday = pending.filter((t) => t.due_date === today)
  const upcoming = pending.filter((t) => t.due_date && t.due_date > today)
  const noDate = pending.filter((t) => !t.due_date)

  function handleToggle(task: TaskRow) {
    const next = task.status === "done" ? "todo" : "done"
    toggleTaskStatus(task.id, next).catch((err) => {
      toast.error(err instanceof Error ? err.message : "Une erreur est survenue")
    })
  }

  if (tasks.length === 0) {
    return (
      <EmptyState
        icon={CheckSquare2}
        title="Aucune tâche"
        description="Ajoute ta première tâche pour commencer à organiser ta journée."
      />
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <TaskGroup
        label="En retard"
        tasks={overdue}
        clients={clients}
        onToggle={handleToggle}
        tone="destructive"
      />
      <TaskGroup
        label="Aujourd'hui"
        tasks={dueToday}
        clients={clients}
        onToggle={handleToggle}
      />
      <TaskGroup
        label="À venir"
        tasks={upcoming}
        clients={clients}
        onToggle={handleToggle}
      />
      <TaskGroup
        label="Sans échéance"
        tasks={noDate}
        clients={clients}
        onToggle={handleToggle}
      />
      {done.length > 0 && (
        <TaskGroup
          label="Terminées"
          tasks={done}
          clients={clients}
          onToggle={handleToggle}
          muted
        />
      )}
    </div>
  )
}

function TaskGroup({
  label,
  tasks,
  clients,
  onToggle,
  tone,
  muted,
}: {
  label: string
  tasks: TaskRow[]
  clients: { id: string; name: string }[]
  onToggle: (task: TaskRow) => void
  tone?: "destructive"
  muted?: boolean
}) {
  if (tasks.length === 0) return null

  return (
    <div className="space-y-2">
      <h2
        className={cn(
          "text-xs font-medium tracking-wide uppercase",
          tone === "destructive" ? "text-destructive" : "text-muted-foreground"
        )}
      >
        {label} · {tasks.length}
      </h2>
      <div className="divide-y overflow-hidden rounded-xl border">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={cn(
              "group flex items-center gap-3 bg-card px-4 py-3",
              muted && "opacity-60"
            )}
          >
            <Checkbox
              checked={task.status === "done"}
              onCheckedChange={() => onToggle(task)}
            />
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "truncate text-sm",
                  task.status === "done" && "text-muted-foreground line-through"
                )}
              >
                {task.title}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {task.due_date && <span>{formatDate(task.due_date)}</span>}
                {task.clients && <span>· {task.clients.name}</span>}
              </div>
            </div>
            <TaskPriorityBadge priority={task.priority} />
            <div className="flex items-center opacity-0 transition-opacity group-hover:opacity-100">
              <TaskFormSheet
                task={task}
                clients={clients}
                trigger={
                  <Button variant="ghost" size="icon-xs" aria-label="Modifier">
                    <Pencil />
                  </Button>
                }
              />
              <DeleteConfirmButton
                itemLabel={task.title}
                onDelete={() => deleteTask(task.id)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
