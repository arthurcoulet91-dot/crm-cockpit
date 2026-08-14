"use client"

import * as React from "react"
import Link from "next/link"
import { Search, Users } from "lucide-react"

import { deleteClientRecord } from "@/lib/actions/clients"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { EmptyState } from "@/components/empty-state"
import { ClientFormSheet } from "@/components/clients/client-form-sheet"
import { DeleteConfirmButton } from "@/components/delete-confirm-button"
import type { Database } from "@/lib/supabase/types"

type ClientRow = Database["public"]["Tables"]["clients"]["Row"] & {
  contracts: { count: number }[]
}

export function ClientsTable({ clients }: { clients: ClientRow[] }) {
  const [query, setQuery] = React.useState("")

  const filtered = clients.filter((c) => {
    const q = query.toLowerCase()
    return (
      c.name.toLowerCase().includes(q) ||
      c.company?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="relative max-w-xs">
        <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher un client…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-8"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title={clients.length === 0 ? "Aucun client pour l'instant" : "Aucun résultat"}
          description={
            clients.length === 0
              ? "Ajoute ton premier client pour commencer à suivre tes contrats."
              : "Essaie une autre recherche."
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Contrats</TableHead>
                <TableHead className="w-1"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((client) => (
                <TableRow key={client.id} className="group">
                  <TableCell>
                    <Link
                      href={`/clients/${client.id}`}
                      className="font-medium hover:underline"
                    >
                      {client.name}
                    </Link>
                    {client.company && (
                      <p className="text-xs text-muted-foreground">
                        {client.company}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {client.type === "pro" ? "Professionnel" : "Particulier"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {client.email || client.phone || "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {client.contracts?.[0]?.count ?? 0}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <ClientFormSheet client={client} />
                      <DeleteConfirmButton
                        itemLabel={client.name}
                        onDelete={() => deleteClientRecord(client.id)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
