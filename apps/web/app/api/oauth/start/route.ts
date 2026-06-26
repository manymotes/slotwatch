import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const apiUrl = process.env.API_URL || 'http://localhost:3000'

  try {
    const res = await fetch(`${apiUrl}/api/v1/oauth/authorize`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to start OAuth flow' }, { status: 502 })
    }

    const { authUrl } = await res.json()
    if (!authUrl) {
      return NextResponse.json({ error: 'No auth URL returned' }, { status: 502 })
    }

    return NextResponse.redirect(authUrl)
  } catch (err) {
    console.error('[oauth/start]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
