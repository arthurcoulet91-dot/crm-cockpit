"use client"

import * as React from "react"
import { toast } from "sonner"
import { Pencil, Phone, BellRing } from "lucide-react"

import { deleteReminder, toggleReminderStatus } from "@/lib/actions/reminders"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DeleteConfirmButton } from "@/components/delete-confirm-button"
import { ReminderFormSheet } from "@/components/reminders/reminder-form-sheet"
import { EmptyState } from "@/components/empty-state"
import { formatDate, todayISO } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Database } from "@/lib/supabase/types"

type ReminderRow = Database["public"]["Tables"]["reminders"]["Row"] & {
  clients: { id: string; name: string } | null
}

export function RemindersList({
  reminders,
  clients,
}: {
  reminders: ReminderRow[]
  clients: { id: string; name: string }[]
}) {
  const today = todayISO()

  const pending = reminders.filter((r) => r.status !== "done")
  const done = reminders.filter((r) => r.status === "done")

  const overdue = pending.filter((r) => r.remind_date < today)
  const dueToday = pending.filter((r) => r.remind_date === today)
  const upcoming = pending.filter((r) => r.remind_date > today)

  function handleToggle(reminder: ReminderRow) {
    const next = reminder.status === "done" ? "pending" : "done"
    toggleReminderStatus(reminder.id, next).catch((err) => {
      toast.error(err instanceof Error ? err.message : "Une erreur est survenue")
    })
  }

  if (reminders.length === 0) {
    return (
      <EmptyState
        icon={BellRing}
        title="Aucun rappel"
        description="Ajoute une tâche du jour ou un appel à passer pour commencer."
      />
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <ReminderGroup
        label="En retard"
        reminders={overdue}
        clients={clients}
        onToggle={handleToggle}
        tone="destructive"
      />
      <ReminderGroup
        label="Aujourd'hui"
        reminders={dueToday}
        clients={clients}
        onToggle={handleToggle}
      />
      <ReminderGroup
        label="À venir"
        reminders={upcoming}
        clients={clients}
        onToggle={handleToggle}
      />
      {done.length > 0 && (
        <ReminderGroup
          label="Terminés"
          reminders={done}
          clients={clients}
          onToggle={handleToggle}
          muted
        />
      )}
    </div>
  )
}

function ReminderGroup({
  label,
  reminders,
  clients,
  onToggle,
  tone,
  muted,
}: {
  label: string
  reminders: ReminderRow[]
  clients: { id: string; name: string }[]
  onToggle: (reminder: ReminderRow) => void
  tone?: "destructive"
  muted?: boolean
}) {
  if (reminders.length === 0) return null

  return (
    <div className="space-y-2">
      <h2
        className={cn(
          "text-xs font-medium tracking-wide uppercase",
          tone === "destructive" ? "text-destructive" : "text-muted-foreground"
        )}
      >
        {label} · {reminders.length}
      </h2>
      <div className="divide-y overflow-hidden rounded-xl border">
        {reminders.map((reminder) => (
          <div
            key={reminder.id}
            className={cn(
              "group flex items-center gap-3 bg-card px-4 py-3",
              muted && "opacity-60"
            )}
          >
            <Checkbox
              checked={reminder.status === "done"}
              onCheckedChange={() => onToggle(reminder)}
            />
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "truncate text-sm",
                  reminder.status === "done" && "text-muted-foreground line-through"
                )}
              >
                {reminder.title}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{formatDate(reminder.remind_date)}</span>
                {reminder.clients && <span>· {reminder.clients.name}</span>}
              </div>
            </div>
            {reminder.remind_time && (
              <Badge variant="outline" className="gap-1">
                <Phone className="size-3" />
                {reminder.remind_time.slice(0, 5)}
              </Badge>
            )}
            <div className="flex items-center opacity-0 transition-opacity group-hover:opacity-100">
              <ReminderFormSheet
                reminder={reminder}
                clients={clients}
                trigger={
                  <Button variant="ghost" size="icon-xs" aria-label="Modifier">
                    <Pencil />
                  </Button>
                }
              />
              <DeleteConfirmButton
                itemLabel={reminder.title}
                onDelete={() => deleteReminder(reminder.id)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
