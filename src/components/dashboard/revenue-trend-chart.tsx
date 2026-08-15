"use client"

import * as React from "react"
import { AreaChart, Area, XAxis, CartesianGrid } from "recharts"

import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getRevenueTrend, type RevenueTrendRange } from "@/lib/actions/analytics"

const chartConfig = {
  amount: { label: "CA", color: "var(--chart-1)" },
} satisfies ChartConfig

const rangeOptions: { value: RevenueTrendRange; label: string }[] = [
  { value: "6m", label: "6 derniers mois" },
  { value: "12m", label: "12 derniers mois" },
  { value: "month", label: "Mois en cours" },
  { value: "year", label: "Cette année" },
]

export function RevenueTrendChart() {
  const [range, setRange] = React.useState<RevenueTrendRange>("6m")
  const [data, setData] = React.useState<{ label: string; amount: number }[]>([])
  const [, startTransition] = React.useTransition()

  React.useEffect(() => {
    startTransition(async () => {
      const result = await getRevenueTrend(range)
      setData(result)
    })
  }, [range])

  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        <Select value={range} onValueChange={(v) => setRange(v as RevenueTrendRange)}>
          <SelectTrigger size="sm" className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {rangeOptions.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <ChartContainer config={chartConfig} className="h-48 w-full">
        <AreaChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.35} />
              <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            fontSize={11}
            interval="preserveStartEnd"
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Area
            dataKey="amount"
            type="monotone"
            stroke="var(--chart-1)"
            fill="url(#fillRevenue)"
            strokeWidth={2}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  )
}
