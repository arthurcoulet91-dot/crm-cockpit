import { NextRequest } from "next/server"

export function isAuthorizedCronRequest(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) return false

  const header = request.headers.get("authorization")
  if (header === `Bearer ${secret}`) return true

  const query = request.nextUrl.searchParams.get("secret")
  return query === secret
}
