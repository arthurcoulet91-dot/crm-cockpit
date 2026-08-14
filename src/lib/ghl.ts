const GHL_BASE_URL = "https://services.leadconnectorhq.com"
const GHL_VERSION = "2021-07-28"

export type GhlContact = {
  id: string
  contactName?: string
  firstName?: string
  lastName?: string
  companyName?: string
  email?: string
  phone?: string
  address1?: string
}

export type GhlOpportunity = {
  id: string
  name: string
  monetaryValue?: number
  status?: string
  contactId?: string
}

export async function fetchGhlContacts(token: string, locationId: string) {
  const res = await fetch(
    `${GHL_BASE_URL}/contacts/?locationId=${encodeURIComponent(locationId)}&limit=100`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Version: GHL_VERSION,
      },
    }
  )
  if (!res.ok) {
    throw new Error(`Échec de récupération des contacts GoHighLevel (${res.status})`)
  }
  const data = await res.json()
  return (data.contacts ?? []) as GhlContact[]
}

export async function fetchGhlOpportunities(token: string, locationId: string) {
  const res = await fetch(
    `${GHL_BASE_URL}/opportunities/search?location_id=${encodeURIComponent(locationId)}&limit=100`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Version: GHL_VERSION,
      },
    }
  )
  if (!res.ok) {
    throw new Error(`Échec de récupération des opportunités GoHighLevel (${res.status})`)
  }
  const data = await res.json()
  return (data.opportunities ?? []) as GhlOpportunity[]
}
