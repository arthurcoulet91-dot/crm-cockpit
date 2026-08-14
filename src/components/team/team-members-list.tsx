"use client"

import { toast } from "sonner"

import { removeTeamMember } from "@/lib/actions/team"
import { DeleteConfirmButton } from "@/components/delete-confirm-button"
import { EmptyState } from "@/components/empty-state"
import { formatDate } from "@/lib/format"
import { UsersRound } from "lucide-react"

type Member = { member_id: string; email: string; joined_at: string }

export function TeamMembersList({ members }: { members: Member[] }) {
  if (members.length === 0) {
    return (
      <EmptyState
        icon={UsersRound}
        title="Aucun collaborateur pour l'instant"
        description="Invite un collaborateur pour qu'il accède aux mêmes clients, contrats et tâches que toi."
      />
    )
  }

  return (
    <div className="divide-y overflow-hidden rounded-xl border">
      {members.map((m) => (
        <div key={m.member_id} className="flex items-center justify-between gap-3 bg-card px-4 py-3">
          <div>
            <p className="text-sm font-medium">{m.email}</p>
            <p className="text-xs text-muted-foreground">
              Rejoint le {formatDate(m.joined_at)}
            </p>
          </div>
          <DeleteConfirmButton
            itemLabel={m.email}
            onDelete={async () => {
              try {
                await removeTeamMember(m.member_id)
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Une erreur est survenue")
                throw err
              }
            }}
          />
        </div>
      ))}
    </div>
  )
}
