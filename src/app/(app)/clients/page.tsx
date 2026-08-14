import { Users } from "lucide-react"

import { EmptyState } from "@/components/empty-state"
import { PageHeader } from "@/components/page-header"

export default function ClientsPage() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader
        title="Clients"
        description="Tous tes clients pro et particuliers, avec leurs contrats et leur historique."
      />
      <EmptyState
        icon={Users}
        title="Aucun client pour l'instant"
        description="La liste des clients et les fiches détaillées arriveront ici."
      />
    </div>
  )
}
