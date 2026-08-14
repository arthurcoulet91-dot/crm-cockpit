import { CalendarDays } from "lucide-react"

import { EmptyState } from "@/components/empty-state"
import { PageHeader } from "@/components/page-header"

export default function CalendarPage() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader
        title="Calendrier"
        description="Tâches, renouvellements et rendez-vous Google Agenda, au même endroit."
      />
      <EmptyState
        icon={CalendarDays}
        title="Calendrier vide"
        description="Connecte Google Agenda dans Réglages → Intégrations pour voir tes rendez-vous ici."
      />
    </div>
  )
}
