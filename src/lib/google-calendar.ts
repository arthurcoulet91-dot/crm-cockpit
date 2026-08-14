import { createClient } from "@/lib/supabase/server"

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
const CALENDAR_EVENTS_URL =
  "https://www.googleapis.com/calendar/v3/calendars/primary/events"

export type GoogleCalendarEvent = {
  id: string
  summary?: string
  description?: string
  location?: string
  start: { date?: string; dateTime?: string }
  end: { date?: string; dateTime?: string }
}

export function getGoogleAuthUrl(state: string) {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID ?? "",
    redirect_uri: process.env.GOOGLE_REDIRECT_URI ?? "",
    response_type: "code",
    scope: "https://www.googleapis.com/auth/calendar.readonly",
    access_type: "offline",
    prompt: "consent",
    state,
  })
  return `${GOOGLE_AUTH_URL}?${params.toString()}`
}

export async function exchangeCodeForTokens(code: string) {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      redirect_uri: process.env.GOOGLE_REDIRECT_URI ?? "",
      grant_type: "authorization_code",
    }),
  })
  if (!res.ok) {
    throw new Error(`Échec de l'échange du code Google (${res.status})`)
  }
  return res.json() as Promise<{
    access_token: string
    refresh_token?: string
    expires_in: number
  }>
}

async function refreshAccessToken(refreshToken: string) {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: process.env.GOOGLE_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      grant_type: "refresh_token",
    }),
  })
  if (!res.ok) {
    throw new Error(`Échec du rafraîchissement du token Google (${res.status})`)
  }
  return res.json() as Promise<{ access_token: string; expires_in: number }>
}

/**
 * Returns a valid Google access token for the current user, refreshing it
 * via the stored refresh_token if it has expired. Returns null if Google
 * Calendar isn't connected for this user.
 */
export async function getValidGoogleAccessToken(): Promise<string | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: connection } = await supabase
    .from("integration_connections")
    .select("*")
    .eq("provider", "google_calendar")
    .single()

  if (!connection?.access_token) return null

  const expiresAt = connection.expires_at ? new Date(connection.expires_at) : null
  const isExpired = !expiresAt || expiresAt.getTime() < Date.now() + 60_000

  if (!isExpired) return connection.access_token

  if (!connection.refresh_token) return null

  const refreshed = await refreshAccessToken(connection.refresh_token)
  const newExpiresAt = new Date(Date.now() + refreshed.expires_in * 1000).toISOString()

  await supabase
    .from("integration_connections")
    .update({ access_token: refreshed.access_token, expires_at: newExpiresAt })
    .eq("provider", "google_calendar")

  return refreshed.access_token
}

export async function fetchUpcomingGoogleEvents(
  accessToken: string,
  maxResults = 10
) {
  const params = new URLSearchParams({
    timeMin: new Date().toISOString(),
    maxResults: String(maxResults),
    singleEvents: "true",
    orderBy: "startTime",
  })
  const res = await fetch(`${CALENDAR_EVENTS_URL}?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) {
    throw new Error(`Échec de récupération des événements Google (${res.status})`)
  }
  const data = await res.json()
  return (data.items ?? []) as GoogleCalendarEvent[]
}
