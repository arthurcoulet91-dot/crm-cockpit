import { UsersRound } from "lucide-react"

import { PageHeader } from "@/components/page-header"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { InviteMemberForm } from "@/components/team/invite-member-form"
import { TeamMembersList } from "@/components/team/team-members-list"
import { getMyTeamOwner, listTeamMembers } from "@/lib/actions/team"

export default async function TeamPage() {
  const owner = await getMyTeamOwner()

  if (owner) {
    return (
      <div className="flex flex-1 flex-col gap-6">
        <PageHeader
          title="Équipe"
          description="Accès partagé à un cockpit."
        />
        <Card>
          <CardHeader>
            <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
              <UsersRound className="size-4" />
            </div>
            <CardTitle>Tu fais partie d&apos;une équipe</CardTitle>
            <CardDescription>
              Tu vois et gères les mêmes clients, contrats et tâches que{" "}
              <span className="font-medium text-foreground">{owner.email}</span>, le
              propriétaire de ce cockpit.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const members = await listTeamMembers()

  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader
        title="Équipe"
        description="Invite un collaborateur pour qu'il accède aux mêmes données que toi."
      />
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Inviter un collaborateur</CardTitle>
          <CardDescription>
            Il doit d&apos;abord avoir créé son propre compte sur Cockpit (onglet
            &quot;Créer un compte&quot; de l&apos;écran de connexion) avant que tu puisses
            l&apos;ajouter.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InviteMemberForm />
        </CardContent>
      </Card>
      <div className="space-y-3">
        <h2 className="text-sm font-medium">Collaborateurs</h2>
        <TeamMembersList members={members} />
      </div>
    </div>
  )
}
