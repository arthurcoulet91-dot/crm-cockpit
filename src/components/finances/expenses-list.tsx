"use client"

import { Receipt } from "lucide-react"

import { deleteExpense } from "@/lib/actions/expenses"
import { Badge } from "@/components/ui/badge"
import { DeleteConfirmButton } from "@/components/delete-confirm-button"
import { EmptyState } from "@/components/empty-state"
import { formatCurrency, formatDate } from "@/lib/format"
import type { ExpenseType } from "@/lib/supabase/types"

type Expense = {
  id: string
  label: string
  amount: number
  category: string | null
  type: ExpenseType
  date: string
}

export function ExpensesList({ expenses }: { expenses: Expense[] }) {
  if (expenses.length === 0) {
    return (
      <EmptyState
        icon={Receipt}
        title="Aucune charge sur cette période"
        description="Ajoute tes charges fixes et variables pour suivre ton bénéfice réel."
      />
    )
  }

  return (
    <div className="divide-y overflow-hidden rounded-xl border">
      {expenses.map((e) => (
        <div key={e.id} className="group flex items-center gap-3 bg-card px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{e.label}</p>
            <p className="text-xs text-muted-foreground">
              {e.category ?? "Sans catégorie"} · {formatDate(e.date)}
            </p>
          </div>
          <span className="text-sm font-medium tabular-nums">
            {formatCurrency(e.amount)}
          </span>
          <Badge variant="outline">{e.type === "fixed" ? "Fixe" : "Variable"}</Badge>
          <div className="opacity-0 transition-opacity group-hover:opacity-100">
            <DeleteConfirmButton
              itemLabel={e.label}
              onDelete={() => deleteExpense(e.id)}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
