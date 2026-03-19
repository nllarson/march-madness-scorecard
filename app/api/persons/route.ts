import { NextRequest, NextResponse } from 'next/server'
import { getOrCreatePerson } from '@/lib/queries'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name } = body

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Person name is required' },
        { status: 400 }
      )
    }

    const person = await getOrCreatePerson(name.trim())

    return NextResponse.json({ 
      success: true, 
      message: 'Person created successfully',
      person 
    })
  } catch (error) {
    console.error('Create person error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create person', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
