/**
 * Un contrat génère du chiffre d'affaires automatiquement, sans qu'il soit
 * nécessaire d'ajouter un paiement à chaque échéance : un contrat de 300€
 * avec une récurrence de 4 mois (3 passages/an) compte pour 900€ sur une
 * période d'un an, calculé depuis sa date de début.
 */

export type RevenueContract = {
  id: string
  title: string
  amount: number
  start_date: string | null
  recurrence_months: number | null
  status: string
}

const MAX_OCCURRENCE_ITERATIONS = 1000

export function contractOccurrencesInPeriod(
  contract: Pick<RevenueContract, "start_date" | "recurrence_months">,
  periodStart: string,
  periodEnd: string
): number {
  if (!contract.start_date) return 0

  const start = new Date(periodStart)
  const end = new Date(periodEnd)
  const contractStart = new Date(contract.start_date)

  if (contractStart > end) return 0

  if (!contract.recurrence_months) {
    return contractStart >= start && contractStart <= end ? 1 : 0
  }

  let count = 0
  const cursor = new Date(contractStart)
  let iterations = 0
  while (cursor <= end && iterations < MAX_OCCURRENCE_ITERATIONS) {
    if (cursor >= start) count++
    cursor.setMonth(cursor.getMonth() + contract.recurrence_months)
    iterations++
  }
  return count
}

export type RevenueBreakdownItem<T extends RevenueContract = RevenueContract> = {
  contract: T
  occurrences: number
  subtotal: number
}

export function contractRevenueForPeriod<T extends RevenueContract>(
  contracts: T[],
  periodStart: string,
  periodEnd: string
) {
  const eligible = contracts.filter(
    (c) => c.status === "active" || c.status === "completed"
  )

  const breakdown: RevenueBreakdownItem<T>[] = eligible
    .map((contract) => ({
      contract,
      occurrences: contractOccurrencesInPeriod(contract, periodStart, periodEnd),
      subtotal: 0,
    }))
    .map((item) => ({ ...item, subtotal: item.occurrences * item.contract.amount }))
    .filter((item) => item.occurrences > 0)

  const total = breakdown.reduce((sum, item) => sum + item.subtotal, 0)

  return { total, breakdown }
}
