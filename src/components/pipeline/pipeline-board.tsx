"use client"

import * as React from "react"
import { toast } from "sonner"
import { Pencil } from "lucide-react"

import { deleteOpportunity, updateOpportunityStage } from "@/lib/actions/opportunities"
import { Button } from "@/components/ui/button"
import { DeleteConfirmButton } from "@/components/delete-confirm-button"
import { OpportunityFormSheet } from "@/components/pipeline/opportunity-form-sheet"
import { formatCurrency, formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Database, OpportunityStage } from "@/lib/supabase/types"

type OpportunityRow = Database["public"]["Tables"]["opportunities"]["Row"] & {
  clients: { id: string; name: string } | null
}

const columns: { stage: OpportunityStage; label: string }[] = [
  { stage: "proposal_sent", label: "Proposition envoyée" },
  { stage: "negotiation", label: "Négociation" },
  { stage: "contract_signed", label: "Contrat signé" },
  { stage: "in_progress", label: "En cours" },
  { stage: "renewal", label: "Renouvellement" },
  { stage: "lost", label: "Perdu" },
]

export function PipelineBoard({
  opportunities,
  clients,
}: {
  opportunities: OpportunityRow[]
  clients: { id: string; name: string }[]
}) {
  const [items, setItems] = React.useState(opportunities)
  const [dragId, setDragId] = React.useState<string | null>(null)
  const [dragOverStage, setDragOverStage] = React.useState<OpportunityStage | null>(null)

  React.useEffect(() => setItems(opportunities), [opportunities])

  function handleDrop(stage: OpportunityStage) {
    setDragOverStage(null)
    if (!dragId) return
    const current = items.find((o) => o.id === dragId)
    if (!current || current.stage === stage) return

    setItems((prev) =>
      prev.map((o) => (o.id === dragId ? { ...o, stage } : o))
    )
    updateOpportunityStage(dragId, stage).catch((err) => {
      toast.error(err instanceof Error ? err.message : "Une erreur est survenue")
      setItems(opportunities)
    })
    setDragId(null)
  }

  return (
    <div className="flex flex-1 gap-4 overflow-x-auto pb-2">
      {columns.map((col) => {
        const colItems = items.filter((o) => o.stage === col.stage)
        const total = colItems.reduce((sum, o) => sum + o.amount, 0)
        return (
          <div
            key={col.stage}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOverStage(col.stage)
            }}
            onDragLeave={() => setDragOverStage((s) => (s === col.stage ? null : s))}
            onDrop={() => handleDrop(col.stage)}
            className={cn(
              "flex w-72 shrink-0 flex-col gap-3 rounded-xl border bg-muted/30 p-3 transition-colors",
              dragOverStage === col.stage && "border-primary/50 bg-primary/5"
            )}
          >
            <div className="flex items-center justify-between px-1">
              <div>
                <p className="text-sm font-medium">{col.label}</p>
                <p className="text-xs text-muted-foreground">
                  {colItems.length} · {formatCurrency(total)}
                </p>
              </div>
              <OpportunityFormSheet
                clients={clients}
                defaultStage={col.stage}
                trigger={
                  <Button variant="ghost" size="icon-xs" aria-label="Ajouter" />
                }
              />
            </div>

            <div className="flex flex-1 flex-col gap-2">
              {colItems.map((opp) => (
                <div
                  key={opp.id}
                  draggable
                  onDragStart={() => setDragId(opp.id)}
                  onDragEnd={() => setDragId(null)}
                  className={cn(
                    "group cursor-grab space-y-2 rounded-lg border bg-card p-3 shadow-sm active:cursor-grabbing",
                    dragId === opp.id && "opacity-50"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium">{opp.title}</p>
                    <div className="flex shrink-0 items-center opacity-0 transition-opacity group-hover:opacity-100">
                      <OpportunityFormSheet
                        opportunity={opp}
                        clients={clients}
                        trigger={
                          <Button variant="ghost" size="icon-xs" aria-label="Modifier">
                            <Pencil />
                          </Button>
                        }
                      />
                      <DeleteConfirmButton
                        itemLabel={opp.title}
                        onDelete={() => deleteOpportunity(opp.id)}
                      />
                    </div>
                  </div>
                  {opp.clients && (
                    <p className="text-xs text-muted-foreground">{opp.clients.name}</p>
                  )}
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium tabular-nums">
                      {formatCurrency(opp.amount)}
                    </span>
                    {opp.expected_close_date && (
                      <span className="text-muted-foreground">
                        {formatDate(opp.expected_close_date)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {colItems.length === 0 && (
                <p className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
                  Aucune opportunité
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
