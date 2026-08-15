// Hand-written to match supabase/migrations/0001_init.sql.
// Once the Supabase project is live, regenerate with:
//   npx supabase gen types typescript --project-id <ref> > src/lib/supabase/types.ts

export type ClientType = "pro" | "particulier"
export type RecordSource = "manual" | "ghl"
export type ContractStatus = "draft" | "active" | "completed" | "cancelled"
export type PaymentStatus = "pending" | "paid" | "overdue"
export type OpportunityStage =
  | "proposal_sent"
  | "negotiation"
  | "contract_signed"
  | "in_progress"
  | "renewal"
  | "lost"
export type ActivityType = "note" | "call" | "email" | "task_completed"
export type TaskStatus = "todo" | "in_progress" | "done"
export type TaskPriority = "low" | "medium" | "high"
export type ExpenseType = "fixed" | "variable"
export type ExpenseFrequency = "monthly" | "annual" | "one_off"
export type IntegrationProvider = "google_calendar" | "ghl"

export interface Database {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string
          user_id: string
          type: ClientType
          name: string
          company: string | null
          email: string | null
          phone: string | null
          address: string | null
          notes: string | null
          source: RecordSource
          ghl_contact_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database["public"]["Tables"]["clients"]["Row"]> & {
          user_id: string
          name: string
        }
        Update: Partial<Database["public"]["Tables"]["clients"]["Row"]>
        Relationships: []
      }
      contracts: {
        Row: {
          id: string
          user_id: string
          client_id: string
          title: string
          amount: number
          status: ContractStatus
          start_date: string | null
          end_date: string | null
          renewal_date: string | null
          recurrence_months: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database["public"]["Tables"]["contracts"]["Row"]> & {
          user_id: string
          client_id: string
          title: string
        }
        Update: Partial<Database["public"]["Tables"]["contracts"]["Row"]>
        Relationships: []
      }
      contract_payments: {
        Row: {
          id: string
          user_id: string
          contract_id: string
          amount: number
          due_date: string
          paid_date: string | null
          status: PaymentStatus
          created_at: string
        }
        Insert: Partial<
          Database["public"]["Tables"]["contract_payments"]["Row"]
        > & {
          user_id: string
          contract_id: string
          due_date: string
        }
        Update: Partial<Database["public"]["Tables"]["contract_payments"]["Row"]>
        Relationships: []
      }
      opportunities: {
        Row: {
          id: string
          user_id: string
          client_id: string | null
          title: string
          stage: OpportunityStage
          amount: number
          expected_close_date: string | null
          source: RecordSource
          ghl_opportunity_id: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database["public"]["Tables"]["opportunities"]["Row"]> & {
          user_id: string
          title: string
        }
        Update: Partial<Database["public"]["Tables"]["opportunities"]["Row"]>
        Relationships: []
      }
      activities: {
        Row: {
          id: string
          user_id: string
          client_id: string | null
          contract_id: string | null
          type: ActivityType
          content: string
          occurred_at: string
          created_at: string
        }
        Insert: Partial<Database["public"]["Tables"]["activities"]["Row"]> & {
          user_id: string
          content: string
        }
        Update: Partial<Database["public"]["Tables"]["activities"]["Row"]>
        Relationships: []
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          due_date: string | null
          status: TaskStatus
          priority: TaskPriority
          client_id: string | null
          contract_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database["public"]["Tables"]["tasks"]["Row"]> & {
          user_id: string
          title: string
        }
        Update: Partial<Database["public"]["Tables"]["tasks"]["Row"]>
        Relationships: []
      }
      expenses: {
        Row: {
          id: string
          user_id: string
          label: string
          amount: number
          category: string | null
          type: ExpenseType
          frequency: ExpenseFrequency
          date: string
          created_at: string
        }
        Insert: Partial<Database["public"]["Tables"]["expenses"]["Row"]> & {
          user_id: string
          label: string
        }
        Update: Partial<Database["public"]["Tables"]["expenses"]["Row"]>
        Relationships: []
      }
      calendar_events_cache: {
        Row: {
          id: string
          user_id: string
          google_event_id: string
          title: string
          start_time: string
          end_time: string | null
          description: string | null
          location: string | null
          is_all_day: boolean
          synced_at: string
        }
        Insert: Partial<
          Database["public"]["Tables"]["calendar_events_cache"]["Row"]
        > & {
          user_id: string
          google_event_id: string
          title: string
          start_time: string
        }
        Update: Partial<
          Database["public"]["Tables"]["calendar_events_cache"]["Row"]
        >
        Relationships: []
      }
      integration_connections: {
        Row: {
          id: string
          user_id: string
          provider: IntegrationProvider
          access_token: string | null
          refresh_token: string | null
          expires_at: string | null
          external_account_id: string | null
          metadata: Record<string, unknown>
          connected_at: string
        }
        Insert: Partial<
          Database["public"]["Tables"]["integration_connections"]["Row"]
        > & {
          user_id: string
          provider: IntegrationProvider
        }
        Update: Partial<
          Database["public"]["Tables"]["integration_connections"]["Row"]
        >
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      effective_owner_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      has_data_access: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      invite_team_member: {
        Args: { target_email: string }
        Returns: undefined
      }
      remove_team_member: {
        Args: { target_member_id: string }
        Returns: undefined
      }
      list_team_members: {
        Args: Record<PropertyKey, never>
        Returns: { member_id: string; email: string; joined_at: string }[]
      }
      get_my_team_owner: {
        Args: Record<PropertyKey, never>
        Returns: { owner_id: string; email: string }[]
      }
    }
  }
}
