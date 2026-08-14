"use client"

import * as React from "react"
import { toast } from "sonner"
import { Loader2, RefreshCw } from "lucide-react"

import { saveGhlConnection, syncGhlData } from "@/lib/actions/integrations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DisconnectButton } from "@/components/integrations/disconnect-button"

export function GhlConnectForm({
  connected,
  locationId,
}: {
  connected: boolean
  locationId: string | null
}) {
  const [pending, startTransition] = React.useTransition()
  const [syncing, startSync] = React.useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        await saveGhlConnection(formData)
        toast.success("GoHighLevel connecté")
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Une erreur est survenue")
      }
    })
  }

  function handleSync() {
    startSync(async () => {
      try {
        const result = await syncGhlData()
        toast.success(
          `Synchronisé : ${result.contacts} contacts, ${result.opportunities} opportunités`
        )
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Une erreur est survenue")
      }
    })
  }

  if (connected) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={handleSync} disabled={syncing}>
          {syncing ? <Loader2 className="animate-spin" /> : <RefreshCw />}
          Synchroniser maintenant
        </Button>
        <DisconnectButton provider="ghl" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="ghl-token">Private Integration Token</Label>
        <Input id="ghl-token" name="token" type="password" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="ghl-location">Location ID</Label>
        <Input id="ghl-location" name="location_id" defaultValue={locationId ?? ""} required />
      </div>
      <Button type="submit" size="sm" disabled={pending}>
        {pending && <Loader2 className="animate-spin" />}
        Connecter GoHighLevel
      </Button>
    </form>
  )
}
