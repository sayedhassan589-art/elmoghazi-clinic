import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

// Server-side password verification - never exposed to client
const VALID_PASSWORD = '2137'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, role } = body

    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 })
    }

    // Verify password server-side
    if (password !== VALID_PASSWORD) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    // If email is provided, find user by email
    if (email) {
      const user = await db.user.findUnique({ where: { email } })

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      if (!user.active) {
        return NextResponse.json({ error: 'Account is deactivated' }, { status: 403 })
      }

      if (user.password !== password) {
        return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
      }

      // Return user without password
      const { password: _, ...userWithoutPassword } = user
      return NextResponse.json({ user: userWithoutPassword })
    }

    // If role is provided without email, create/find user by role
    if (role) {
      const roleEmail = role === 'doctor' ? 'doctor@elmoghazi.com' : 'secretary@elmoghazi.com'
      let user = await db.user.findUnique({ where: { email: roleEmail } })

      if (!user) {
        // Auto-create user if doesn't exist
        user = await db.user.create({
          data: {
            name: role === 'doctor' ? 'دكتور المغازى' : 'السكرتيرة',
            email: roleEmail,
            password: VALID_PASSWORD,
            role: role,
            active: true,
          },
        })
      }

      if (!user.active) {
        return NextResponse.json({ error: 'Account is deactivated' }, { status: 403 })
      }

      const { password: _, ...userWithoutPassword } = user
      return NextResponse.json({ user: userWithoutPassword })
    }

    return NextResponse.json({ error: 'Email or role is required' }, { status: 400 })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
