"use client"

import { toast } from "sonner"
import { CircleCheck, Wallet } from "lucide-react"

import { deletePayment, markPaymentPaid } from "@/lib/actions/payments"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DeleteConfirmButton } from "@/components/delete-confirm-button"
import { EmptyState } from "@/components/empty-state"
import { formatCurrency, formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { PaymentStatus } from "@/lib/supabase/types"

type Payment = {
  id: string
  amount: number
  due_date: string
  paid_date: string | null
  status: PaymentStatus
  label: string | null
}

const statusClasses: Record<PaymentStatus, string> = {
  pending: "border-border text-muted-foreground",
  paid: "border-transparent bg-success/15 text-success",
  overdue: "border-transparent bg-destructive/10 text-destructive",
}

const statusLabels: Record<PaymentStatus, string> = {
  pending: "En attente",
  paid: "Payé",
  overdue: "En retard",
}

export function PaymentsList({ payments }: { payments: Payment[] }) {
  if (payments.length === 0) {
    return (
      <EmptyState
        icon={Wallet}
        title="Aucun paiement ponctuel sur cette période"
        description="Ajoute une rentrée d'argent qui n'est pas liée à un contrat."
      />
    )
  }

  function handleMarkPaid(id: string) {
    markPaymentPaid(id).catch((err) => {
      toast.error(err instanceof Error ? err.message : "Une erreur est survenue")
    })
  }

  return (
    <div className="divide-y overflow-hidden rounded-xl border">
      {payments.map((p) => (
        <div key={p.id} className="group flex items-center gap-3 bg-card px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {p.label ?? "Paiement ponctuel"}
            </p>
            <p className="text-xs text-muted-foreground">
              Échéance {formatDate(p.due_date)}
              {p.paid_date && ` · Payé le ${formatDate(p.paid_date)}`}
            </p>
          </div>
          <span className="text-sm font-medium tabular-nums">
            {formatCurrency(p.amount)}
          </span>
          <Badge variant="outline" className={cn(statusClasses[p.status])}>
            {statusLabels[p.status]}
          </Badge>
          <div className="flex items-center opacity-0 transition-opacity group-hover:opacity-100">
            {p.status !== "paid" && (
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label="Marquer payé"
                onClick={() => handleMarkPaid(p.id)}
              >
                <CircleCheck />
              </Button>
            )}
            <DeleteConfirmButton
              itemLabel="ce paiement"
              onDelete={() => deletePayment(p.id)}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
