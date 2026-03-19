import { NextRequest, NextResponse } from 'next/server'
import { bulkUpdateBetResults } from '@/lib/queries'
import { bulkUpdateResultSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = bulkUpdateResultSchema.parse(body)

    const count = await bulkUpdateBetResults(validated.betIds, validated.result)

    return NextResponse.json({ count, message: `Updated ${count} bets` })
  } catch (error) {
    console.error('Bulk update error:', error)
    return NextResponse.json(
      { error: 'Failed to bulk update bets', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
