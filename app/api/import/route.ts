import { NextRequest, NextResponse } from 'next/server'
import { importBetsFromFile } from '@/lib/import'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const personName = formData.get('person') as string | null

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!file.name.endsWith('.xlsx')) {
      return NextResponse.json(
        { error: 'Only .xlsx files are supported' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const result = await importBetsFromFile(buffer, personName || undefined)

    if (!result.success && result.imported === 0) {
      return NextResponse.json(
        { error: result.message, details: result.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json(
      { error: 'Failed to import file', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
