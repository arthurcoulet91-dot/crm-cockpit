import {
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
  format,
} from "date-fns"
import { fr } from "date-fns/locale"

export type PeriodKey = "month" | "last_month" | "quarter" | "year"

export function resolvePeriod(key: string | undefined) {
  const now = new Date()
  const period: PeriodKey = (key as PeriodKey) ?? "month"

  let start: Date
  let end: Date
  let label: string

  switch (period) {
    case "last_month": {
      const lastMonth = subMonths(now, 1)
      start = startOfMonth(lastMonth)
      end = endOfMonth(lastMonth)
      label = format(lastMonth, "MMMM yyyy", { locale: fr })
      break
    }
    case "quarter":
      start = startOfQuarter(now)
      end = endOfQuarter(now)
      label = `T${Math.floor(now.getMonth() / 3) + 1} ${now.getFullYear()}`
      break
    case "year":
      start = startOfYear(now)
      end = endOfYear(now)
      label = `${now.getFullYear()}`
      break
    case "month":
    default:
      start = startOfMonth(now)
      end = endOfMonth(now)
      label = format(now, "MMMM yyyy", { locale: fr })
      break
  }

  return {
    key: period,
    start: format(start, "yyyy-MM-dd"),
    end: format(end, "yyyy-MM-dd"),
    label: label.charAt(0).toUpperCase() + label.slice(1),
  }
}

export const periodOptions: { value: PeriodKey; label: string }[] = [
  { value: "month", label: "Ce mois-ci" },
  { value: "last_month", label: "Mois dernier" },
  { value: "quarter", label: "Ce trimestre" },
  { value: "year", label: "Cette année" },
]
