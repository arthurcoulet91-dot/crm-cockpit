"use client"

import * as React from "react"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

import { disconnectIntegration } from "@/lib/actions/integrations"
import { Button } from "@/components/ui/button"
import type { IntegrationProvider } from "@/lib/supabase/types"

export function DisconnectButton({ provider }: { provider: IntegrationProvider }) {
  const [pending, startTransition] = React.useTransition()

  function handleClick() {
    startTransition(async () => {
      try {
        await disconnectIntegration(provider)
        toast.success("Déconnecté")
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Une erreur est survenue")
      }
    })
  }

  return (
    <Button variant="outline" size="sm" onClick={handleClick} disabled={pending}>
      {pending && <Loader2 className="animate-spin" />}
      Déconnecter
    </Button>
  )
}
