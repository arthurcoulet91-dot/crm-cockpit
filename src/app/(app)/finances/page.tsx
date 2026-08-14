import { Wallet } from "lucide-react"

import { EmptyState } from "@/components/empty-state"
import { PageHeader } from "@/components/page-header"

export default function FinancesPage() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader
        title="Finances"
        description="Chiffre d'affaires et bénéfice par période, et suivi des charges."
      />
      <EmptyState
        icon={Wallet}
        title="Pas encore de données financières"
        description="Le détail du CA, du bénéfice et de tes charges fixes/variables s'affichera ici."
      />
    </div>
  )
}
