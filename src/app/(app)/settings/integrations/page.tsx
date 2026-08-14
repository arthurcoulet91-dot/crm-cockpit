import { CalendarDays, Link2 } from "lucide-react"

import { PageHeader } from "@/components/page-header"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function IntegrationsPage() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader
        title="Intégrations"
        description="Connecte Google Agenda et GoHighLevel à ton cockpit."
      />
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
              <CalendarDays className="size-4" />
            </div>
            <CardTitle>Google Agenda</CardTitle>
            <CardDescription>
              Synchronise tes rendez-vous et événements dans la vue calendrier.
            </CardDescription>
            <CardAction>
              <Badge variant="outline">Non connecté</Badge>
            </CardAction>
          </CardHeader>
          <CardContent>
            <Button disabled>Connecter Google Agenda</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
              <Link2 className="size-4" />
            </div>
            <CardTitle>GoHighLevel</CardTitle>
            <CardDescription>
              Importe tes contacts et opportunités commerciales depuis GHL, en lecture seule.
            </CardDescription>
            <CardAction>
              <Badge variant="outline">Non connecté</Badge>
            </CardAction>
          </CardHeader>
          <CardContent>
            <Button disabled>Connecter GoHighLevel</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
