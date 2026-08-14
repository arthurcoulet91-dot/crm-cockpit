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
  UserPlus,
  FilePlus2,
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

const quickActions = [
  { title: "Nouveau client", url: "/clients/new", icon: UserPlus },
  { title: "Nouveau contrat", url: "/contracts/new", icon: FilePlus2 },
]

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()

  const go = (url: string) => {
    onOpenChange(false)
    router.push(url)
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} title="Recherche rapide">
      <CommandInput placeholder="Rechercher une page, un client, une action…" />
      <CommandList>
        <CommandEmpty>Aucun résultat.</CommandEmpty>
        <CommandGroup heading="Actions rapides">
          {quickActions.map((item) => (
            <CommandItem key={item.url} onSelect={() => go(item.url)}>
              <item.icon />
              <span>{item.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Navigation">
          {navItems.map((item) => (
            <CommandItem key={item.url} onSelect={() => go(item.url)}>
              <item.icon />
              <span>{item.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
