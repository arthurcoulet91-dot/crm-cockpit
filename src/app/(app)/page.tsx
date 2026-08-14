import Link from "next/link"
import {
  TrendingUp,
  TrendingDown,
  FileText,
  RefreshCw,
  Workflow,
  CalendarDays,
  Minus,
} from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/empty-state"
import { TodayTasks } from "@/components/dashboard/today-tasks"
import { createClient } from "@/lib/supabase/server"
import { resolvePeriod, type PeriodKey } from "@/lib/period"
import { formatCurrency, formatDate, todayISO, daysFromNowISO } from "@/lib/format"
import { stageLabel } from "@/components/status-badge"
import { fetchUpcomingGoogleEvents, getValidGoogleAccessToken } from "@/lib/google-calendar"
import { cn } from "@/lib/utils"
import type { OpportunityStage } from "@/lib/supabase/types"

const stageOrder: OpportunityStage[] = [
  "proposal_sent",
  "negotiation",
  "contract_signed",
  "in_progress",
  "renewal",
]

export default async function DashboardPage() {
  const supabase = await createClient()

  const thisMonth = resolvePeriod("month" satisfies PeriodKey)
  const lastMonth = resolvePeriod("last_month" satisfies PeriodKey)
  const today = todayISO()
  const in60Days = daysFromNowISO(60)

  const [
    thisMonthPaymentsRes,
    lastMonthPaymentsRes,
    thisMonthExpensesRes,
    activeContractsRes,
    renewalsRes,
    opportunitiesRes,
    tasksRes,
  ] = await Promise.all([
    supabase
      .from("contract_payments")
      .select("amount")
      .eq("status", "paid")
      .gte("paid_date", thisMonth.start)
      .lte("paid_date", thisMonth.end),
    supabase
      .from("contract_payments")
      .select("amount")
      .eq("status", "paid")
      .gte("paid_date", lastMonth.start)
      .lte("paid_date", lastMonth.end),
    supabase
      .from("expenses")
      .select("amount")
      .gte("date", thisMonth.start)
      .lte("date", thisMonth.end),
    supabase.from("contracts").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase
      .from("contracts")
      .select("id, title, renewal_date, clients(name)")
      .eq("status", "active")
      .gte("renewal_date", today)
      .lte("renewal_date", in60Days)
      .order("renewal_date", { ascending: true })
      .limit(6),
    supabase
      .from("opportunities")
      .select("stage, amount")
      .neq("stage", "lost"),
    supabase
      .from("tasks")
      .select("id, title, due_date, priority, status")
      .neq("status", "done")
      .lte("due_date", today)
      .not("due_date", "is", null)
      .order("due_date", { ascending: true })
      .limit(8),
  ])

  const revenue = (thisMonthPaymentsRes.data ?? []).reduce((s, p) => s + p.amount, 0)
  const lastRevenue = (lastMonthPaymentsRes.data ?? []).reduce((s, p) => s + p.amount, 0)
  const expenses = (thisMonthExpensesRes.data ?? []).reduce((s, e) => s + e.amount, 0)
  const profit = revenue - expenses

  const revenueDelta = lastRevenue === 0 ? null : ((revenue - lastRevenue) / lastRevenue) * 100

  const activeContracts = activeContractsRes.count ?? 0

  const renewals = (renewalsRes.data ?? []) as unknown as {
    id: string
    title: string
    renewal_date: string
    clients: { name: string } | null
  }[]

  const opportunities = (opportunitiesRes.data ?? []) as {
    stage: OpportunityStage
    amount: number
  }[]
  const stageStats = stageOrder.map((stage) => {
    const items = opportunities.filter((o) => o.stage === stage)
    return {
      stage,
      count: items.length,
      amount: items.reduce((s, o) => s + o.amount, 0),
    }
  })
  const maxStageAmount = Math.max(1, ...stageStats.map((s) => s.amount))

  const tasks = (tasksRes.data ?? []).map((t) => ({
    ...t,
    isOverdue: Boolean(t.due_date && t.due_date < today),
  }))

  let upcomingEvents: { id: string; title: string; when: string; location?: string }[] = []
  try {
    const accessToken = await getValidGoogleAccessToken()
    if (accessToken) {
      const events = await fetchUpcomingGoogleEvents(accessToken, 5)
      upcomingEvents = events.map((e) => ({
        id: e.id,
        title: e.summary ?? "Événement",
        when: e.start.dateTime
          ? new Date(e.start.dateTime).toLocaleString("fr-FR", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })
          : formatDate(e.start.date),
        location: e.location,
      }))
    }
  } catch {
    // Google Agenda indisponible — la carte affichera l'état vide.
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader
        title="Dashboard"
        description="Vue d'ensemble de ton activité — CA, bénéfice, contrats et tâches du jour."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase">
              CA — {thisMonth.label}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-2xl font-semibold tabular-nums">{formatCurrency(revenue)}</p>
            <p
              className={cn(
                "flex items-center gap-1 text-xs",
                revenueDelta === null
                  ? "text-muted-foreground"
                  : revenueDelta >= 0
                    ? "text-success"
                    : "text-destructive"
              )}
            >
              {revenueDelta === null ? (
                <Minus className="size-3" />
              ) : revenueDelta >= 0 ? (
                <TrendingUp className="size-3" />
              ) : (
                <TrendingDown className="size-3" />
              )}
              {revenueDelta === null
                ? "Pas de données le mois dernier"
                : `${revenueDelta >= 0 ? "+" : ""}${revenueDelta.toFixed(0)}% vs mois dernier`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase">
              Bénéfice — {thisMonth.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={cn(
                "text-2xl font-semibold tabular-nums",
                profit >= 0 ? "text-success" : "text-destructive"
              )}
            >
              {formatCurrency(profit)}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(expenses)} de charges
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase">
              <FileText className="size-3.5" />
              Contrats actifs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums">{activeContracts}</p>
            <Link href="/contracts" className="text-xs text-muted-foreground hover:text-foreground">
              Voir les contrats →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase">
              <RefreshCw className="size-3.5" />
              Renouvellements &lt; 60j
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums">{renewals.length}</p>
            <Link href="/contracts" className="text-xs text-muted-foreground hover:text-foreground">
              Voir les contrats →
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5 text-sm">
              <Workflow className="size-4" />
              Pipeline — opportunités par étape
            </CardTitle>
          </CardHeader>
          <CardContent>
            {opportunities.length === 0 ? (
              <EmptyState
                icon={Workflow}
                title="Pipeline vide"
                description="Ajoute des opportunités pour suivre ta gestion."
              />
            ) : (
              <div className="space-y-3">
                {stageStats.map((s) => (
                  <div key={s.stage} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium">{stageLabel(s.stage)}</span>
                      <span className="text-muted-foreground">
                        {s.count} · {formatCurrency(s.amount)}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${(s.amount / maxStageAmount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
                <Link
                  href="/pipeline"
                  className="block pt-1 text-right text-xs text-muted-foreground hover:text-foreground"
                >
                  Voir le pipeline →
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Tâches du jour</CardTitle>
          </CardHeader>
          <CardContent>
            <TodayTasks tasks={tasks} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5 text-sm">
              <RefreshCw className="size-4" />
              Contrats à renouveler
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renewals.length === 0 ? (
              <EmptyState
                icon={RefreshCw}
                title="Aucun renouvellement à venir"
                description="Rien à renouveler dans les 60 prochains jours."
              />
            ) : (
              <ul className="divide-y">
                {renewals.map((c) => (
                  <li key={c.id} className="flex items-center justify-between py-2.5 text-sm">
                    <div>
                      <Link href={`/contracts`} className="font-medium hover:underline">
                        {c.title}
                      </Link>
                      <p className="text-xs text-muted-foreground">{c.clients?.name}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(c.renewal_date)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5 text-sm">
              <CalendarDays className="size-4" />
              Prochains rendez-vous
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length === 0 ? (
              <EmptyState
                icon={CalendarDays}
                title="Aucun rendez-vous à venir"
                description="Connecte Google Agenda dans Réglages → Intégrations pour voir tes rendez-vous ici."
              />
            ) : (
              <ul className="divide-y">
                {upcomingEvents.map((e) => (
                  <li key={e.id} className="flex items-center justify-between py-2.5 text-sm">
                    <div>
                      <p className="font-medium">{e.title}</p>
                      {e.location && (
                        <p className="text-xs text-muted-foreground">{e.location}</p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{e.when}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
