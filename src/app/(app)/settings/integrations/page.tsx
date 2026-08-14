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
import { DisconnectButton } from "@/components/integrations/disconnect-button"
import { GhlConnectForm } from "@/components/integrations/ghl-connect-form"
import { createClient } from "@/lib/supabase/server"

export default async function IntegrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ google?: string }>
}) {
  const { google: googleStatus } = await searchParams
  const supabase = await createClient()
  const { data: connections } = await supabase
    .from("integration_connections")
    .select("provider, external_account_id")

  const google = connections?.find((c) => c.provider === "google_calendar")
  const ghl = connections?.find((c) => c.provider === "ghl")

  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader
        title="Intégrations"
        description="Connecte Google Agenda et GoHighLevel à ton cockpit."
      />

      {googleStatus === "error" && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          La connexion à Google Agenda a échoué. Vérifie tes identifiants OAuth et réessaie.
        </p>
      )}
      {googleStatus === "connected" && (
        <p className="rounded-lg border border-success/30 bg-success/10 px-4 py-2 text-sm text-success">
          Google Agenda est connecté.
        </p>
      )}

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
              <Badge variant={google ? "default" : "outline"}>
                {google ? "Connecté" : "Non connecté"}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardContent>
            {google ? (
              <DisconnectButton provider="google_calendar" />
            ) : (
              <Button render={<a href="/api/integrations/google/authorize" />}>
                Connecter Google Agenda
              </Button>
            )}
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
              <Badge variant={ghl ? "default" : "outline"}>
                {ghl ? "Connecté" : "Non connecté"}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardContent>
            <GhlConnectForm
              connected={Boolean(ghl)}
              locationId={ghl?.external_account_id ?? null}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
