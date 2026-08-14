import { CheckSquare2 } from "lucide-react"

import { EmptyState } from "@/components/empty-state"
import { PageHeader } from "@/components/page-header"

export default function TasksPage() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader
        title="Tâches"
        description="Ce qu'il y a à faire aujourd'hui et cette semaine."
      />
      <EmptyState
        icon={CheckSquare2}
        title="Aucune tâche"
        description="Tes tâches à venir et en retard s'afficheront ici."
      />
    </div>
  )
}
