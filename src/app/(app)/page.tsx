import { LayoutDashboard } from "lucide-react"

import { EmptyState } from "@/components/empty-state"
import { PageHeader } from "@/components/page-header"

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader
        title="Dashboard"
        description="Vue d'ensemble de ton activité — CA, bénéfice, contrats et tâches du jour."
      />
      <EmptyState
        icon={LayoutDashboard}
        title="Le dashboard arrive"
        description="Les indicateurs clés (CA, bénéfice, contrats à renouveler, opportunités par étape) s'afficheront ici une fois les données connectées."
      />
    </div>
  )
}
