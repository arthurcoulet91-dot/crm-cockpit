"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  FileText,
  Workflow,
  CheckSquare2,
  BellRing,
  CalendarDays,
  Wallet,
  Settings,
  UsersRound,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { OtterMark } from "@/components/brand-mark"

const navMain = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Clients", url: "/clients", icon: Users },
  { title: "Contrats", url: "/contracts", icon: FileText },
  { title: "Pipeline", url: "/pipeline", icon: Workflow },
  { title: "Tâches", url: "/tasks", icon: CheckSquare2 },
  { title: "Rappels", url: "/reminders", icon: BellRing },
  { title: "Calendrier", url: "/calendar", icon: CalendarDays },
  { title: "Finances", url: "/finances", icon: Wallet },
]

const navSettings = [
  { title: "Équipe", url: "/settings/team", icon: UsersRound },
  { title: "Intégrations", url: "/settings/integrations", icon: Settings },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/" />}>
              <div className="flex aspect-square size-7 items-center justify-center rounded-md bg-gradient-to-br from-primary to-[oklch(0.62_0.13_195)] text-primary-foreground">
                <OtterMark />
              </div>
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate font-semibold tracking-tight">Blue Otter</span>
                <span className="truncate text-xs text-muted-foreground">
                  Cockpit de gestion
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Cockpit</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navMain.map((item) => {
                const isActive =
                  item.url === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.url)
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      render={<Link href={item.url} />}
                      isActive={isActive}
                      tooltip={item.title}
                      className="data-active:border-l-2 data-active:border-primary data-active:pl-[calc(--spacing(2)-2px)] data-active:bg-primary/10 data-active:text-primary [&_svg]:data-active:text-primary"
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          {navSettings.map((item) => {
            const isActive = pathname.startsWith(item.url)
            return (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton
                  render={<Link href={item.url} />}
                  isActive={isActive}
                  tooltip={item.title}
                >
                  <item.icon />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
