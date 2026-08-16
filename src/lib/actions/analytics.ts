"use server"

import {
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfYear,
  endOfYear,
  eachMonthOfInterval,
  eachDayOfInterval,
  format,
} from "date-fns"
import { fr } from "date-fns/locale"

import { createClient } from "@/lib/supabase/server"

export type RevenueTrendRange = "6m" | "12m" | "month" | "year"

export type RevenueTrendPoint = { label: string; amount: number }

export async function getRevenueTrend(
  range: RevenueTrendRange
): Promise<RevenueTrendPoint[]> {
  const supabase = await createClient()
  const now = new Date()

  let start: Date
  let end: Date
  let buckets: Date[]
  let bucketKeyFormat: string
  let labelFormat: string

  if (range === "month") {
    start = startOfMonth(now)
    end = endOfMonth(now)
    buckets = eachDayOfInterval({ start, end })
    bucketKeyFormat = "yyyy-MM-dd"
    labelFormat = "d MMM"
  } else if (range === "year") {
    start = startOfYear(now)
    end = endOfYear(now)
    buckets = eachMonthOfInterval({ start, end })
    bucketKeyFormat = "yyyy-MM"
    labelFormat = "MMM"
  } else {
    const monthsBack = range === "6m" ? 5 : 11
    start = startOfMonth(subMonths(now, monthsBack))
    end = endOfMonth(now)
    buckets = eachMonthOfInterval({ start, end })
    bucketKeyFormat = "yyyy-MM"
    labelFormat = "MMM yy"
  }

  const { data } = await supabase
    .from("contract_payments")
    .select("amount, paid_date")
    .eq("status", "paid")
    .gte("paid_date", format(start, "yyyy-MM-dd"))
    .lte("paid_date", format(end, "yyyy-MM-dd"))

  const sums = new Map<string, number>()
  for (const p of data ?? []) {
    if (!p.paid_date) continue
    const key =
      range === "month" ? p.paid_date.slice(0, 10) : p.paid_date.slice(0, 7)
    sums.set(key, (sums.get(key) ?? 0) + p.amount)
  }

  return buckets.map((b) => ({
    label: format(b, labelFormat, { locale: fr }),
    amount: sums.get(format(b, bucketKeyFormat)) ?? 0,
  }))
}
