import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Mail, Phone, MapPin, Building2, FileText } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ClientFormSheet } from "@/components/clients/client-form-sheet"
import { DeleteConfirmButton } from "@/components/delete-confirm-button"
import { ContractFormSheet } from "@/components/contracts/contract-form-sheet"
import { ContractStatusBadge } from "@/components/status-badge"
import { ActivityTimeline } from "@/components/activities/activity-timeline"
import { EmptyState } from "@/components/empty-state"
import { deleteClientRecord } from "@/lib/actions/clients"
import { formatCurrency, formatDate } from "@/lib/format"

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: client }, { data: contracts }, { data: activities }] =
    await Promise.all([
      supabase.from("clients").select("*").eq("id", id).single(),
      supabase
        .from("contracts")
        .select("*")
        .eq("client_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("activities")
        .select("*")
        .eq("client_id", id)
        .order("occurred_at", { ascending: false }),
    ])

  if (!client) notFound()

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <Link
          href="/clients"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Clients
        </Link>
      </div>
      <PageHeader
        title={client.name}
        description={client.company ?? undefined}
        actions={
          <>
            <ClientFormSheet client={client} />
            <DeleteConfirmButton
              itemLabel={client.name}
              onDelete={() => deleteClientRecord(client.id)}
              redirectTo="/clients"
            />
          </>
        }
      />

      <div className="grid flex-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-sm">
                Informations
                <Badge variant="outline">
                  {client.type === "pro" ? "Professionnel" : "Particulier"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {client.company && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="size-3.5 shrink-0" />
                  {client.company}
                </div>
              )}
              {client.email && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="size-3.5 shrink-0" />
                  <a href={`mailto:${client.email}`} className="hover:text-foreground">
                    {client.email}
                  </a>
                </div>
              )}
              {client.phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="size-3.5 shrink-0" />
                  <a href={`tel:${client.phone}`} className="hover:text-foreground">
                    {client.phone}
                  </a>
                </div>
              )}
              {client.address && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="size-3.5 shrink-0" />
                  {client.address}
                </div>
              )}
              {client.notes && (
                <p className="border-t pt-3 whitespace-pre-wrap text-muted-foreground">
                  {client.notes}
                </p>
              )}
              {!client.email && !client.phone && !client.address && !client.notes && (
                <p className="text-muted-foreground">Aucune information supplémentaire.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-sm">Contrats</CardTitle>
              <ContractFormSheet fixedClientId={client.id} />
            </CardHeader>
            <CardContent>
              {!contracts || contracts.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="Aucun contrat"
                  description="Ajoute un contrat pour ce client."
                />
              ) : (
                <ul className="divide-y">
                  {contracts.map((contract) => (
                    <li
                      key={contract.id}
                      className="flex items-center justify-between gap-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-medium">{contract.title}</p>
                        <p className="text-xs text-muted-foreground">
                          Renouvellement : {formatDate(contract.renewal_date)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm tabular-nums">
                          {formatCurrency(contract.amount)}
                        </span>
                        <ContractStatusBadge status={contract.status} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Activité</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityTimeline clientId={client.id} activities={activities ?? []} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
