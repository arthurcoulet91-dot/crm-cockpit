import { TrendingUp, TrendingDown, Wallet, Receipt, FileText } from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PeriodSelect } from "@/components/finances/period-select"
import { PaymentFormSheet } from "@/components/finances/payment-form-sheet"
import { PaymentsList } from "@/components/finances/payments-list"
import { ExpenseFormSheet } from "@/components/finances/expense-form-sheet"
import { ExpensesList } from "@/components/finances/expenses-list"
import { EmptyState } from "@/components/empty-state"
import { createClient } from "@/lib/supabase/server"
import { resolvePeriod, type PeriodKey } from "@/lib/period"
import { formatCurrency } from "@/lib/format"
import { isActiveInPeriod, totalExpensesForPeriod } from "@/lib/expenses"
import { contractRevenueForPeriod, type RevenueContract } from "@/lib/revenue"
import type { PaymentStatus } from "@/lib/supabase/types"

type PaymentStandalone = {
  id: string
  amount: number
  due_date: string
  paid_date: string | null
  status: PaymentStatus
  label: string | null
}

type RevenueContractWithClient = RevenueContract & {
  clients: { name: string } | null
}

export default async function FinancesPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>
}) {
  const { period: periodParam } = await searchParams
  const period = resolvePeriod(periodParam)

  const supabase = await createClient()

  const [standalonePaymentsRes, expensesRes, contractsRes] = await Promise.all([
    supabase
      .from("contract_payments")
      .select("*")
      .is("contract_id", null)
      .gte("due_date", period.start)
      .lte("due_date", period.end)
      .order("due_date", { ascending: false }),
    supabase
      .from("expenses")
      .select("*")
      .lte("date", period.end)
      .order("date", { ascending: false }),
    supabase
      .from("contracts")
      .select("id, title, amount, start_date, recurrence_months, status, clients(name)")
      .order("title"),
  ])

  const standalonePayments = (standalonePaymentsRes.data ?? []) as PaymentStandalone[]
  const expenses = (expensesRes.data ?? []).filter((e) =>
    isActiveInPeriod(e, period.start, period.end)
  )
  const contracts = (contractsRes.data ?? []) as unknown as RevenueContractWithClient[]

  const standaloneRevenue = standalonePayments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0)

  const { total: contractRevenue, breakdown } = contractRevenueForPeriod(
    contracts,
    period.start,
    period.end
  )

  const revenue = contractRevenue + standaloneRevenue
  const totalExpenses = totalExpensesForPeriod(expenses, period.start, period.end)
  const profit = revenue - totalExpenses

  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader
        title="Finances"
        description="Chiffre d'affaires et bénéfice par période, et suivi des charges."
        actions={<PeriodSelect current={period.key as PeriodKey} />}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase">
              <TrendingUp className="size-3.5" />
              CA — {period.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums">
              {formatCurrency(revenue)}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(contractRevenue)} contrats · {formatCurrency(standaloneRevenue)} ponctuel
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase">
              <Receipt className="size-3.5" />
              Charges — {period.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums">
              {formatCurrency(totalExpenses)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase">
              {profit >= 0 ? (
                <TrendingUp className="size-3.5" />
              ) : (
                <TrendingDown className="size-3.5" />
              )}
              Bénéfice — {period.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={
                "text-2xl font-semibold tabular-nums " +
                (profit >= 0 ? "text-success" : "text-destructive")
              }
            >
              {formatCurrency(profit)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <h2 className="flex items-center gap-1.5 text-sm font-medium">
          <FileText className="size-4" />
          Revenus des contrats — {period.label}
        </h2>
        {breakdown.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Aucun contrat actif sur cette période"
            description="Les contrats actifs ou terminés avec un montant génèrent leur CA automatiquement ici, selon leur récurrence."
          />
        ) : (
          <div className="divide-y overflow-hidden rounded-xl border">
            {breakdown.map(({ contract, occurrences, subtotal }) => (
              <div
                key={contract.id}
                className="flex items-center justify-between gap-3 bg-card px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{contract.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {contract.clients?.name ?? "—"} · {formatCurrency(contract.amount)} ×{" "}
                    {occurrences} {occurrences > 1 ? "passages" : "passage"}
                  </p>
                </div>
                <span className="text-sm font-medium tabular-nums">
                  {formatCurrency(subtotal)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 text-sm font-medium">
              <Wallet className="size-4" />
              Paiements ponctuels
            </h2>
            <PaymentFormSheet />
          </div>
          <PaymentsList payments={standalonePayments} />
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 text-sm font-medium">
              <Receipt className="size-4" />
              Charges
            </h2>
            <ExpenseFormSheet />
          </div>
          <ExpensesList expenses={expenses} />
        </div>
      </div>
    </div>
  )
}
