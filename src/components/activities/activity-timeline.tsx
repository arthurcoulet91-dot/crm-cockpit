"use client"

import * as React from "react"
import { toast } from "sonner"
import { Loader2, MessageSquare, Phone, Mail, CheckCircle2, Send } from "lucide-react"

import { createActivity, deleteActivity } from "@/lib/actions/activities"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { DeleteConfirmButton } from "@/components/delete-confirm-button"
import { formatDateTime } from "@/lib/format"
import type { ActivityType } from "@/lib/supabase/types"

type Activity = {
  id: string
  type: ActivityType
  content: string
  occurred_at: string
}

const icons: Record<ActivityType, React.ComponentType<{ className?: string }>> = {
  note: MessageSquare,
  call: Phone,
  email: Mail,
  task_completed: CheckCircle2,
}

export function ActivityTimeline({
  clientId,
  activities,
}: {
  clientId: string
  activities: Activity[]
}) {
  const [content, setContent] = React.useState("")
  const [pending, startTransition] = React.useTransition()

  function handleAddNote(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    startTransition(async () => {
      try {
        await createActivity({ clientId, type: "note", content })
        setContent("")
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Une erreur est survenue")
      }
    })
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleAddNote} className="space-y-2">
        <Textarea
          placeholder="Ajouter une note, un compte-rendu d'appel…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={2}
        />
        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={pending || !content.trim()}>
            {pending ? <Loader2 className="animate-spin" /> : <Send />}
            Ajouter
          </Button>
        </div>
      </form>

      {activities.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Aucune activité pour l&apos;instant.
        </p>
      ) : (
        <ul className="space-y-3">
          {activities.map((activity) => {
            const Icon = icons[activity.type]
            return (
              <li key={activity.id} className="group flex gap-3">
                <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-muted">
                  <Icon className="size-3.5 text-muted-foreground" />
                </div>
                <div className="flex-1 space-y-0.5 rounded-lg border bg-card px-3 py-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm whitespace-pre-wrap">{activity.content}</p>
                    <div className="opacity-0 transition-opacity group-hover:opacity-100">
                      <DeleteConfirmButton
                        itemLabel="cette activité"
                        onDelete={() => deleteActivity(activity.id, clientId)}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(activity.occurred_at)}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
