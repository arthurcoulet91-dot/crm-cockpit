"use client"

import * as React from "react"
import Link from "next/link"
import { FileText, Search } from "lucide-react"

import { deleteContractRecord } from "@/lib/actions/contracts"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { EmptyState } from "@/components/empty-state"
import { ContractStatusBadge } from "@/components/status-badge"
import { ContractFormSheet } from "@/components/contracts/contract-form-sheet"
import { DeleteConfirmButton } from "@/components/delete-confirm-button"
import { formatCurrency, formatDate, formatRecurrence } from "@/lib/format"
import type { Database } from "@/lib/supabase/types"

type ContractRow = Database["public"]["Tables"]["contracts"]["Row"] & {
  clients: { id: string; name: string } | null
}

export function ContractsTable({
  contracts,
  clients,
}: {
  contracts: ContractRow[]
  clients: { id: string; name: string }[]
}) {
  const [query, setQuery] = React.useState("")

  const filtered = contracts.filter((c) => {
    const q = query.toLowerCase()
    return (
      c.title.toLowerCase().includes(q) ||
      c.clients?.name.toLowerCase().includes(q)
    )
  })

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="relative max-w-xs">
        <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher un contrat…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-8"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={contracts.length === 0 ? "Aucun contrat pour l'instant" : "Aucun résultat"}
          description={
            contracts.length === 0
              ? "Crée ton premier contrat pour commencer à suivre ton activité."
              : "Essaie une autre recherche."
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contrat</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Récurrence</TableHead>
                <TableHead>Renouvellement</TableHead>
                <TableHead className="w-1"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((contract) => (
                <TableRow key={contract.id} className="group">
                  <TableCell className="font-medium">{contract.title}</TableCell>
                  <TableCell>
                    {contract.clients ? (
                      <Link
                        href={`/clients/${contract.clients.id}`}
                        className="text-muted-foreground hover:text-foreground hover:underline"
                      >
                        {contract.clients.name}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>
                    <ContractStatusBadge status={contract.status} />
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {formatCurrency(contract.amount)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatRecurrence(contract.recurrence_months)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(contract.renewal_date)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <ContractFormSheet
                        contract={contract}
                        clients={clients}
                        variant="edit-icon"
                      />
                      <DeleteConfirmButton
                        itemLabel={contract.title}
                        onDelete={() => deleteContractRecord(contract.id)}
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
