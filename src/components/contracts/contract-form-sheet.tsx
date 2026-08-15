"use client"

import * as React from "react"
import { toast } from "sonner"
import { Loader2, Plus } from "lucide-react"

import { createContractRecord, updateContractRecord } from "@/lib/actions/contracts"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import type { Database } from "@/lib/supabase/types"

type ContractRow = Database["public"]["Tables"]["contracts"]["Row"]

export function ContractFormSheet({
  contract,
  clients,
  fixedClientId,
  variant = "default",
}: {
  contract?: ContractRow
  clients?: { id: string; name: string }[]
  fixedClientId?: string
  variant?: "default" | "edit-icon"
}) {
  const [open, setOpen] = React.useState(false)
  const [pending, startTransition] = React.useTransition()
  const [recurrenceMonths, setRecurrenceMonths] = React.useState(
    contract?.recurrence_months ? String(contract.recurrence_months) : ""
  )
  const isEdit = Boolean(contract)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    if (fixedClientId) formData.set("client_id", fixedClientId)

    startTransition(async () => {
      try {
        if (contract) {
          await updateContractRecord(contract.id, formData)
          toast.success("Contrat mis à jour")
        } else {
          await createContractRecord(formData)
          toast.success("Contrat créé")
        }
        setOpen(false)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Une erreur est survenue")
      }
    })
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          variant === "edit-icon" ? (
            <Button variant="ghost" size="icon-sm" aria-label="Modifier" />
          ) : (
            <Button size="sm" />
          )
        }
      >
        {variant === "default" && <Plus />}
        {variant === "default" ? "Nouveau contrat" : "Modifier"}
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>{isEdit ? "Modifier le contrat" : "Nouveau contrat"}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Mets à jour les détails de ce contrat."
              : "Renseigne les détails du contrat."}
          </SheetDescription>
        </SheetHeader>
        <form
          id={`contract-form-${contract?.id ?? "new"}`}
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col gap-4 overflow-y-auto px-4"
        >
          {!fixedClientId && clients && (
            <div className="space-y-1.5">
              <Label htmlFor="client_id">Client</Label>
              <Select name="client_id" defaultValue={contract?.client_id}>
                <SelectTrigger id="client_id" className="w-full">
                  <SelectValue placeholder="Choisir un client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="title">Titre</Label>
            <Input id="title" name="title" required defaultValue={contract?.title} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="amount">Montant (€)</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0"
                defaultValue={contract?.amount ?? 0}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="status">Statut</Label>
              <Select name="status" defaultValue={contract?.status ?? "draft"}>
                <SelectTrigger id="status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Brouillon</SelectItem>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="completed">Terminé</SelectItem>
                  <SelectItem value="cancelled">Annulé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="recurrence_months">Récurrence</Label>
            <Input
              id="recurrence_months"
              name="recurrence_months"
              type="number"
              min="1"
              step="1"
              placeholder="Laisser vide si ponctuel"
              value={recurrenceMonths}
              onChange={(e) => setRecurrenceMonths(e.target.value)}
            />
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {[
                { label: "Ponctuel", value: "" },
                { label: "Tous les mois", value: "1" },
                { label: "Tous les 2 mois", value: "2" },
                { label: "Tous les 3 mois", value: "3" },
                { label: "Tous les 6 mois", value: "6" },
                { label: "Tous les ans", value: "12" },
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setRecurrenceMonths(preset.value)}
                  className="rounded-full border border-input px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground data-[active=true]:border-primary data-[active=true]:bg-accent data-[active=true]:text-accent-foreground"
                  data-active={recurrenceMonths === preset.value}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="start_date">Début</Label>
              <Input
                id="start_date"
                name="start_date"
                type="date"
                defaultValue={contract?.start_date ?? ""}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="end_date">Fin</Label>
              <Input
                id="end_date"
                name="end_date"
                type="date"
                defaultValue={contract?.end_date ?? ""}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="renewal_date">Renouvellement</Label>
              <Input
                id="renewal_date"
                name="renewal_date"
                type="date"
                defaultValue={contract?.renewal_date ?? ""}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" rows={3} defaultValue={contract?.notes ?? ""} />
          </div>
        </form>
        <SheetFooter className="flex-row justify-end">
          <SheetClose render={<Button variant="outline" />}>Annuler</SheetClose>
          <Button type="submit" form={`contract-form-${contract?.id ?? "new"}`} disabled={pending}>
            {pending && <Loader2 className="animate-spin" />}
            {isEdit ? "Enregistrer" : "Créer le contrat"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
