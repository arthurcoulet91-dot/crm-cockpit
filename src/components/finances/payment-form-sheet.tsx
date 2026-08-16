"use client"

import * as React from "react"
import { toast } from "sonner"
import { Loader2, Plus } from "lucide-react"

import { createPayment } from "@/lib/actions/payments"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
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

type PaymentKind = "contract" | "standalone"

export function PaymentFormSheet({
  contracts,
}: {
  contracts: { id: string; title: string; client_name: string | null }[]
}) {
  const [open, setOpen] = React.useState(false)
  const [pending, startTransition] = React.useTransition()
  const [kind, setKind] = React.useState<PaymentKind>("contract")

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    if (kind === "standalone") {
      formData.delete("contract_id")
    } else {
      formData.delete("label")
    }
    startTransition(async () => {
      try {
        await createPayment(formData)
        toast.success("Paiement ajouté")
        setOpen(false)
        setKind("contract")
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Une erreur est survenue")
      }
    })
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button size="sm" />}>
        <Plus />
        Nouveau paiement
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Nouveau paiement</SheetTitle>
          <SheetDescription>
            Lié à un contrat, ou ponctuel si tu n&apos;en as pas.
          </SheetDescription>
        </SheetHeader>
        <form
          id="payment-form"
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col gap-4 overflow-y-auto px-4"
        >
          <div className="grid grid-cols-2 gap-1.5 rounded-lg bg-muted p-1">
            {(
              [
                { value: "contract", label: "Lié à un contrat" },
                { value: "standalone", label: "Ponctuel" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setKind(opt.value)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  kind === opt.value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {kind === "contract" ? (
            <div className="space-y-1.5">
              <Label htmlFor="contract_id">Contrat</Label>
              <Select name="contract_id" required>
                <SelectTrigger id="contract_id" className="w-full">
                  <SelectValue placeholder="Choisir un contrat" />
                </SelectTrigger>
                <SelectContent>
                  {contracts.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.title} {c.client_name ? `— ${c.client_name}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label htmlFor="label">Description</Label>
              <Input
                id="label"
                name="label"
                required
                placeholder="Ex : Prestation ponctuelle, acompte…"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="amount">Montant (€)</Label>
              <Input id="amount" name="amount" type="number" step="0.01" min="0" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="due_date">Échéance</Label>
              <Input
                id="due_date"
                name="due_date"
                type="date"
                defaultValue={new Date().toISOString().slice(0, 10)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="status">Statut</Label>
            <Select name="status" defaultValue="pending">
              <SelectTrigger id="status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="paid">Payé</SelectItem>
                <SelectItem value="overdue">En retard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </form>
        <SheetFooter className="flex-row justify-end">
          <SheetClose render={<Button variant="outline" />}>Annuler</SheetClose>
          <Button type="submit" form="payment-form" disabled={pending}>
            {pending && <Loader2 className="animate-spin" />}
            Ajouter
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
