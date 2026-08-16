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
import { contractRevenueForPeriod, type RevenueContract } from "@/lib/revenue"

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
  let labelFormat: string
  const perDay = range === "month"

  if (range === "month") {
    start = startOfMonth(now)
    end = endOfMonth(now)
    buckets = eachDayOfInterval({ start, end })
    labelFormat = "d MMM"
  } else if (range === "year") {
    start = startOfYear(now)
    end = endOfYear(now)
    buckets = eachMonthOfInterval({ start, end })
    labelFormat = "MMM"
  } else {
    const monthsBack = range === "6m" ? 5 : 11
    start = startOfMonth(subMonths(now, monthsBack))
    end = endOfMonth(now)
    buckets = eachMonthOfInterval({ start, end })
    labelFormat = "MMM yy"
  }

  const [{ data: contracts }, { data: standalone }] = await Promise.all([
    supabase
      .from("contracts")
      .select("id, title, amount, start_date, recurrence_months, status"),
    supabase
      .from("contract_payments")
      .select("amount, paid_date")
      .is("contract_id", null)
      .eq("status", "paid")
      .gte("paid_date", format(start, "yyyy-MM-dd"))
      .lte("paid_date", format(end, "yyyy-MM-dd")),
  ])

  const allContracts = (contracts ?? []) as RevenueContract[]

  const standaloneSums = new Map<string, number>()
  for (const p of standalone ?? []) {
    if (!p.paid_date) continue
    const key = perDay ? p.paid_date.slice(0, 10) : p.paid_date.slice(0, 7)
    standaloneSums.set(key, (standaloneSums.get(key) ?? 0) + p.amount)
  }

  return buckets.map((b) => {
    const bucketStart = format(perDay ? b : startOfMonth(b), "yyyy-MM-dd")
    const bucketEnd = format(perDay ? b : endOfMonth(b), "yyyy-MM-dd")
    const contractAmount = contractRevenueForPeriod(allContracts, bucketStart, bucketEnd)
      .total
    const key = perDay ? bucketStart : bucketStart.slice(0, 7)
    const standaloneAmount = standaloneSums.get(key) ?? 0

    return {
      label: format(b, labelFormat, { locale: fr }),
      amount: contractAmount + standaloneAmount,
    }
  })
}
