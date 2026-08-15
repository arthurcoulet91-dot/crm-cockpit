import { PageHeader } from "@/components/page-header"
import { ContractFormSheet } from "@/components/contracts/contract-form-sheet"
import { ContractsTable } from "@/components/contracts/contracts-table"
import { ExportCsvButton } from "@/components/export-csv-button"
import { exportContractsCSV } from "@/lib/actions/export"
import { createClient } from "@/lib/supabase/server"
import type { Database } from "@/lib/supabase/types"

type ContractWithClient = Database["public"]["Tables"]["contracts"]["Row"] & {
  clients: { id: string; name: string } | null
}

export default async function ContractsPage() {
  const supabase = await createClient()
  const [contractsRes, { data: clients }] = await Promise.all([
    supabase
      .from("contracts")
      .select("*, clients(id, name)")
      .order("created_at", { ascending: false }),
    supabase.from("clients").select("id, name").order("name"),
  ])
  const contracts = (contractsRes.data ?? []) as unknown as ContractWithClient[]

  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader
        title="Contrats"
        description="Tous les contrats en cours, à venir et terminés."
        actions={
          <>
            <ExportCsvButton action={exportContractsCSV} filename="contrats.csv" />
            <ContractFormSheet clients={clients ?? []} />
          </>
        }
      />
      <ContractsTable contracts={contracts} clients={clients ?? []} />
    </div>
  )
}
