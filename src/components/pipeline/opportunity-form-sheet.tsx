"use client"

import * as React from "react"
import { toast } from "sonner"
import { Loader2, Plus } from "lucide-react"

import { createOpportunity, updateOpportunity } from "@/lib/actions/opportunities"
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

type OpportunityRow = Database["public"]["Tables"]["opportunities"]["Row"]

const stages: { value: OpportunityRow["stage"]; label: string }[] = [
  { value: "proposal_sent", label: "Proposition envoyée" },
  { value: "negotiation", label: "Négociation" },
  { value: "contract_signed", label: "Contrat signé" },
  { value: "in_progress", label: "En cours" },
  { value: "renewal", label: "Renouvellement" },
  { value: "lost", label: "Perdu" },
]

export function OpportunityFormSheet({
  opportunity,
  clients,
  defaultStage,
  trigger,
}: {
  opportunity?: OpportunityRow
  clients: { id: string; name: string }[]
  defaultStage?: OpportunityRow["stage"]
  trigger?: React.ReactElement
}) {
  const [open, setOpen] = React.useState(false)
  const [pending, startTransition] = React.useTransition()
  const isEdit = Boolean(opportunity)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        if (opportunity) {
          await updateOpportunity(opportunity.id, formData)
          toast.success("Opportunité mise à jour")
        } else {
          await createOpportunity(formData)
          toast.success("Opportunité créée")
        }
        setOpen(false)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Une erreur est survenue")
      }
    })
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={trigger ?? <Button size="sm" />}>
        {!trigger && (
          <>
            <Plus />
            Nouvelle opportunité
          </>
        )}
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>{isEdit ? "Modifier l'opportunité" : "Nouvelle opportunité"}</SheetTitle>
          <SheetDescription>
            Suivi de gestion — de la proposition envoyée au renouvellement.
          </SheetDescription>
        </SheetHeader>
        <form
          id={`opportunity-form-${opportunity?.id ?? "new"}`}
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col gap-4 overflow-y-auto px-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="title">Titre</Label>
            <Input id="title" name="title" required defaultValue={opportunity?.title} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="client_id">Client</Label>
            <Select name="client_id" defaultValue={opportunity?.client_id ?? undefined}>
              <SelectTrigger id="client_id" className="w-full">
                <SelectValue placeholder="Aucun client lié" />
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="amount">Montant (€)</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0"
                defaultValue={opportunity?.amount ?? 0}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="expected_close_date">Clôture prévue</Label>
              <Input
                id="expected_close_date"
                name="expected_close_date"
                type="date"
                defaultValue={opportunity?.expected_close_date ?? ""}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="stage">Étape</Label>
            <Select
              name="stage"
              defaultValue={opportunity?.stage ?? defaultStage ?? "proposal_sent"}
            >
              <SelectTrigger id="stage" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {stages.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" rows={4} defaultValue={opportunity?.notes ?? ""} />
          </div>
        </form>
        <SheetFooter className="flex-row justify-end">
          <SheetClose render={<Button variant="outline" />}>Annuler</SheetClose>
          <Button
            type="submit"
            form={`opportunity-form-${opportunity?.id ?? "new"}`}
            disabled={pending}
          >
            {pending && <Loader2 className="animate-spin" />}
            {isEdit ? "Enregistrer" : "Créer"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
