"use client"

import * as React from "react"
import Link from "next/link"
import { CalendarDays, CheckSquare2, RefreshCw } from "lucide-react"

import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/components/empty-state"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"

export type AgendaItem = {
  id: string
  date: string
  type: "task" | "renewal" | "meeting"
  title: string
  subtitle?: string | null
  href?: string
}

export function CalendarView({ items }: { items: AgendaItem[] }) {
  const [selected, setSelected] = React.useState<Date | undefined>(undefined)

  const eventDates = React.useMemo(
    () => items.map((i) => new Date(`${i.date}T00:00:00`)),
    [items]
  )

  const selectedISO = selected ? formatISO(selected) : null
  const filtered = selectedISO ? items.filter((i) => i.date === selectedISO) : items

  const grouped = React.useMemo(() => {
    const map = new Map<string, AgendaItem[]>()
    for (const item of filtered) {
      const list = map.get(item.date) ?? []
      list.push(item)
      map.set(item.date, list)
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b))
  }, [filtered])

  return (
    <div className="grid flex-1 gap-6 lg:grid-cols-[auto_1fr]">
      <Card className="h-fit">
        <CardContent className="p-2">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={setSelected}
            modifiers={{ hasEvent: eventDates }}
            modifiersClassNames={{
              hasEvent: "after:absolute after:bottom-1 after:size-1 after:rounded-full after:bg-primary after:content-['']",
            }}
          />
          {selected && (
            <button
              onClick={() => setSelected(undefined)}
              className="mt-1 w-full text-center text-xs text-muted-foreground hover:text-foreground"
            >
              Voir tout
            </button>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        {grouped.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="Rien de prévu"
            description="Aucune tâche ni renouvellement sur cette période."
          />
        ) : (
          grouped.map(([date, dayItems]) => (
            <div key={date} className="space-y-2">
              <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {formatDate(date)}
              </h3>
              <div className="divide-y overflow-hidden rounded-xl border">
                {dayItems.map((item) => {
                  const Icon =
                    item.type === "task"
                      ? CheckSquare2
                      : item.type === "meeting"
                        ? CalendarDays
                        : RefreshCw
                  const content = (
                    <div className="flex items-center gap-3 bg-card px-4 py-3">
                      <div
                        className={cn(
                          "flex size-7 shrink-0 items-center justify-center rounded-full",
                          item.type === "task" ? "bg-warning/15" : "bg-primary/10"
                        )}
                      >
                        <Icon
                          className={cn(
                            "size-3.5",
                            item.type === "task" ? "text-warning" : "text-primary"
                          )}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{item.title}</p>
                        {item.subtitle && (
                          <p className="truncate text-xs text-muted-foreground">
                            {item.subtitle}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                  return item.href ? (
                    <Link key={item.id} href={item.href} className="block hover:bg-muted/50">
                      {content}
                    </Link>
                  ) : (
                    <div key={item.id}>{content}</div>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function formatISO(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`
}
