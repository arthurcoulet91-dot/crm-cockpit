import { differenceInCalendarMonths, differenceInCalendarYears, isAfter } from "date-fns"

import type { ExpenseFrequency } from "@/lib/supabase/types"

export type RecurringExpenseLike = {
  date: string
  frequency: ExpenseFrequency
  amount: number
}

/** Whether this expense (recurring or not) is relevant at all to a given period. */
export function isActiveInPeriod(
  expense: Pick<RecurringExpenseLike, "date" | "frequency">,
  periodStart: string,
  periodEnd: string
) {
  if (expense.date > periodEnd) return false
  if (expense.frequency === "one_off") return expense.date >= periodStart
  return true
}

/**
 * Number of times a (possibly recurring) expense occurs within [periodStart, periodEnd].
 * A "monthly" or "annual" expense counts once per calendar month/year it's active for,
 * starting from its date — so a single row set up once keeps applying automatically.
 */
export function occurrencesInPeriod(
  expense: RecurringExpenseLike,
  periodStart: string,
  periodEnd: string
): number {
  const expenseDate = new Date(expense.date)
  const start = new Date(periodStart)
  const end = new Date(periodEnd)

  if (isAfter(expenseDate, end)) return 0

  if (expense.frequency === "one_off") {
    return expenseDate >= start && expenseDate <= end ? 1 : 0
  }

  const effectiveStart = isAfter(expenseDate, start) ? expenseDate : start
  if (isAfter(effectiveStart, end)) return 0

  if (expense.frequency === "monthly") {
    return differenceInCalendarMonths(end, effectiveStart) + 1
  }

  if (expense.frequency === "annual") {
    return differenceInCalendarYears(end, effectiveStart) + 1
  }

  return 0
}

export function totalExpensesForPeriod(
  expenses: RecurringExpenseLike[],
  periodStart: string,
  periodEnd: string
) {
  return expenses.reduce(
    (sum, e) => sum + e.amount * occurrencesInPeriod(e, periodStart, periodEnd),
    0
  )
}
