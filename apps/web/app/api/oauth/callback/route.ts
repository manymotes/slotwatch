import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { callbackUrl } = body

    if (typeof callbackUrl !== 'string' || !callbackUrl.startsWith('tesla://')) {
      return NextResponse.json(
        { error: 'Invalid callback URL — must start with tesla://' },
        { status: 400 }
      )
    }

    // Forward to the backend API which handles the Tesla token exchange
    const apiUrl = process.env.API_URL || 'http://localhost:3000'
    const res = await fetch(`${apiUrl}/api/v1/oauth/callback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ callbackUrl }),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      return NextResponse.json(
        { error: data.error ?? 'Token exchange failed' },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    console.error('[oauth/callback]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
