"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  FileText,
  Workflow,
  CheckSquare2,
  CalendarDays,
  Wallet,
  Settings,
  Loader2,
} from "lucide-react"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { searchEverything, type SearchResult } from "@/lib/actions/search"

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Clients", url: "/clients", icon: Users },
  { title: "Contrats", url: "/contracts", icon: FileText },
  { title: "Pipeline", url: "/pipeline", icon: Workflow },
  { title: "Tâches", url: "/tasks", icon: CheckSquare2 },
  { title: "Calendrier", url: "/calendar", icon: CalendarDays },
  { title: "Finances", url: "/finances", icon: Wallet },
  { title: "Intégrations", url: "/settings/integrations", icon: Settings },
]

const resultIcons: Record<SearchResult["type"], typeof Users> = {
  client: Users,
  contract: FileText,
  task: CheckSquare2,
}

const resultTypeLabels: Record<SearchResult["type"], string> = {
  client: "Client",
  contract: "Contrat",
  task: "Tâche",
}

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const [query, setQuery] = React.useState("")
  const [results, setResults] = React.useState<SearchResult[]>([])
  const [pending, startTransition] = React.useTransition()

  React.useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      return
    }
    const handle = setTimeout(() => {
      startTransition(async () => {
        const data = await searchEverything(query)
        setResults(data)
      })
    }, 200)
    return () => clearTimeout(handle)
  }, [query])

  React.useEffect(() => {
    if (!open) {
      setQuery("")
      setResults([])
    }
  }, [open])

  const go = (url: string) => {
    onOpenChange(false)
    router.push(url)
  }

  const isSearching = query.trim().length >= 2

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} title="Recherche rapide">
      <CommandInput
        placeholder="Rechercher un client, un contrat, une tâche…"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {isSearching ? (
          <>
            {pending && results.length === 0 ? (
              <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin" />
                Recherche…
              </div>
            ) : (
              <>
                <CommandEmpty>Aucun résultat.</CommandEmpty>
                {results.length > 0 && (
                  <CommandGroup heading="Résultats">
                    {results.map((r) => {
                      const Icon = resultIcons[r.type]
                      return (
                        <CommandItem key={`${r.type}-${r.id}`} onSelect={() => go(r.href)}>
                          <Icon />
                          <span className="flex-1 truncate">{r.title}</span>
                          <span className="text-xs text-muted-foreground">
                            {r.subtitle ?? resultTypeLabels[r.type]}
                          </span>
                        </CommandItem>
                      )
                    })}
                  </CommandGroup>
                )}
              </>
            )}
          </>
        ) : (
          <>
            <CommandEmpty>Aucun résultat.</CommandEmpty>
            <CommandGroup heading="Navigation">
              {navItems.map((item) => (
                <CommandItem key={item.url} onSelect={() => go(item.url)}>
                  <item.icon />
                  <span>{item.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  )
}
