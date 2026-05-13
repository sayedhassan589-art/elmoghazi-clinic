import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const user = await db.user.findUnique({ where: { id: userId } })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (!user.active) {
      return NextResponse.json({ error: 'Account is deactivated' }, { status: 403 })
    }

    const { password: _, ...userWithoutPassword } = user
    return NextResponse.json({ user: userWithoutPassword })
  } catch (error) {
    console.error('Auth me error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
