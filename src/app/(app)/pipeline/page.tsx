import { Workflow } from "lucide-react"

import { EmptyState } from "@/components/empty-state"
import { PageHeader } from "@/components/page-header"

export default function PipelinePage() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader
        title="Pipeline"
        description="Suivi de gestion et de livraison — de la proposition envoyée au renouvellement."
      />
      <EmptyState
        icon={Workflow}
        title="Pipeline vide"
        description="Le tableau Kanban de tes opportunités par étape s'affichera ici."
      />
    </div>
  )
}
