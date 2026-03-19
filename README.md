# March Madness Bet Tracker

A full-stack web application for tracking March Madness bets with friends. Import bets from spreadsheets, view a live leaderboard, and manage results in real-time.

## Features

- 📊 **Spreadsheet Import**: Upload `.xlsx` files to import bets
- 🏆 **Live Leaderboard**: Ranked by profit with detailed stats
- 🔍 **Search & Filter**: Find bets by person, type, or result
- ⚡ **Real-time Updates**: Instant profit/loss calculations
- 📱 **Responsive Design**: Works on desktop and mobile
- 🔒 **Simple Admin**: Manage results at `/admin` route

## Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **UI**: Tailwind CSS + shadcn/ui
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Hosting**: Vercel

## Setup Instructions

### 1. Clone and Install

```bash
npm install
```

### 2. Set Up Supabase Database

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to **Settings** → **Database**
4. Copy the **Connection String** (use the "Direct connection" option)
5. Create a `.env.local` file in the project root:

```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
```

### 3. Set Up Database Schema

```bash
npx prisma generate
npx prisma db push
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Usage

### Importing Bets

1. Navigate to `/admin`
2. Upload an `.xlsx` file with the following columns:
   - `#` (optional)
   - `Type` (Straight or Parlay)
   - `Game Date/Time`
   - `Bet Description`
   - `Matchup`
   - `Bet Type`
   - `Odds`
   - `Wager`
   - `Potential Payout`
   - `Result` (Pending/Win/Loss)
   - `Profit/Loss` (optional)
   - `Person` (optional - can be set via form field)

3. If the spreadsheet doesn't have a "Person" column, enter the person's name in the form field
4. Click "Import" and wait for confirmation

### Managing Results

1. Go to `/admin`
2. Select bets using checkboxes
3. Use "Mark as Win" or "Mark as Loss" buttons for bulk updates
4. Or update individual bets using the dropdown in each row

### Viewing the Leaderboard

- The public leaderboard is at the root URL (`/`)
- No login required - share the link with friends
- Shows rankings, stats, and all bets

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the repository in [Vercel](https://vercel.com)
3. Add environment variables:
   - `DATABASE_URL`
   - `DIRECT_URL`
4. Deploy!

## Project Structure

```
├── app/
│   ├── page.tsx              # Public leaderboard
│   ├── admin/
│   │   └── page.tsx          # Admin interface
│   └── api/
│       ├── import/           # Spreadsheet import endpoint
│       └── bets/             # Bet management endpoints
├── components/
│   └── ui/                   # shadcn/ui components
├── lib/
│   ├── db.ts                 # Prisma client
│   ├── queries.ts            # Database queries
│   ├── import.ts             # Import logic
│   └── validations.ts        # Zod schemas
├── prisma/
│   └── schema.prisma         # Database schema
└── input/
    └── NCAA_Bets_Tracker.xlsx # Sample spreadsheet
```

## License

MIT
