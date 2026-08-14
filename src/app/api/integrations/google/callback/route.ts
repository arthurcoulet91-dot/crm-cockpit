import { NextRequest, NextResponse } from "next/server"

import { exchangeCodeForTokens } from "@/lib/google-calendar"
import { createClient } from "@/lib/supabase/server"
import { getEffectiveOwnerId } from "@/lib/actions/team"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const storedState = request.cookies.get("google_oauth_state")?.value

  const redirectTo = (status: "connected" | "error") =>
    NextResponse.redirect(
      new URL(`/settings/integrations?google=${status}`, request.url)
    )

  if (!code || !state || !storedState || state !== storedState) {
    return redirectTo("error")
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return redirectTo("error")

  try {
    const tokens = await exchangeCodeForTokens(code)
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString()
    const ownerId = await getEffectiveOwnerId()

    const { error } = await supabase.from("integration_connections").upsert(
      {
        user_id: ownerId,
        provider: "google_calendar",
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: expiresAt,
      },
      { onConflict: "user_id,provider" }
    )
    if (error) throw error
  } catch {
    return redirectTo("error")
  }

  const response = redirectTo("connected")
  response.cookies.delete("google_oauth_state")
  return response
}
