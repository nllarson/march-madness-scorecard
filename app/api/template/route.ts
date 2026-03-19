import { NextResponse } from 'next/server'
import * as XLSX from 'xlsx'

export async function GET() {
  try {
    // Create sample data for the template
    const templateData = [
      {
        '#': 1,
        'Type': 'Straight',
        'Game Date/Time': '3/21/2026 7:00 PM',
        'Bet Description': 'Duke -5.5',
        'Matchup': 'Duke vs UNC',
        'Bet Type': 'Game Spread',
        'Odds': '-110',
        'Wager': 100,
        'Potential Payout': 190.91,
        'Result': 'Pending',
        'Profit/Loss': 0,
        'Person': 'Nick'
      },
      {
        '#': 2,
        'Type': 'Straight',
        'Game Date/Time': '3/21/2026 9:30 PM',
        'Bet Description': 'Kansas Moneyline',
        'Matchup': 'Kansas vs Kentucky',
        'Bet Type': 'Moneyline',
        'Odds': '+150',
        'Wager': 50,
        'Potential Payout': 125,
        'Result': 'Pending',
        'Profit/Loss': 0,
        'Person': 'Nick'
      },
      {
        '#': 3,
        'Type': 'Parlay',
        'Game Date/Time': '3/22/2026 12:00 PM',
        'Bet Description': '3-Leg Parlay: Gonzaga -3, Villanova ML, Arizona Over 145.5',
        'Matchup': 'Multiple Games',
        'Bet Type': 'Parlay',
        'Odds': '+600',
        'Wager': 25,
        'Potential Payout': 175,
        'Result': 'Pending',
        'Profit/Loss': 0,
        'Person': 'Nick'
      }
    ]

    // Create a new workbook and worksheet
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(templateData)

    // Set column widths for better readability
    ws['!cols'] = [
      { wch: 5 },  // #
      { wch: 10 }, // Type
      { wch: 18 }, // Game Date/Time
      { wch: 40 }, // Bet Description
      { wch: 20 }, // Matchup
      { wch: 15 }, // Bet Type
      { wch: 8 },  // Odds
      { wch: 10 }, // Wager
      { wch: 15 }, // Potential Payout
      { wch: 10 }, // Result
      { wch: 12 }, // Profit/Loss
      { wch: 12 }  // Person
    ]

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Bets')

    // Generate buffer
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

    // Return the file
    return new NextResponse(buf, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="bet_tracker_template.xlsx"'
      }
    })
  } catch (error) {
    console.error('Template generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate template' },
      { status: 500 }
    )
  }
}
