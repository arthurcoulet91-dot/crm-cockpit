import { PageHeader } from "@/components/page-header"
import { ClientFormSheet } from "@/components/clients/client-form-sheet"
import { ClientsTable } from "@/components/clients/clients-table"
import { ExportCsvButton } from "@/components/export-csv-button"
import { exportClientsCSV } from "@/lib/actions/export"
import { createClient } from "@/lib/supabase/server"
import type { Database } from "@/lib/supabase/types"

type ClientWithContractCount = Database["public"]["Tables"]["clients"]["Row"] & {
  contracts: { count: number }[]
}

export default async function ClientsPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("clients")
    .select("*, contracts(count)")
    .order("created_at", { ascending: false })
  const clients = (data ?? []) as unknown as ClientWithContractCount[]

  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader
        title="Clients"
        description="Tous tes clients pro et particuliers, avec leurs contrats et leur historique."
        actions={
          <>
            <ExportCsvButton action={exportClientsCSV} filename="clients.csv" />
            <ClientFormSheet />
          </>
        }
      />
      <ClientsTable clients={clients ?? []} />
    </div>
  )
}
