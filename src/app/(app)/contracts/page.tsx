import { FileText } from "lucide-react"

import { EmptyState } from "@/components/empty-state"
import { PageHeader } from "@/components/page-header"

export default function ContractsPage() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader
        title="Contrats"
        description="Tous les contrats en cours, à venir et terminés."
      />
      <EmptyState
        icon={FileText}
        title="Aucun contrat pour l'instant"
        description="La liste des contrats avec statut, montant et échéances arrivera ici."
      />
    </div>
  )
}
