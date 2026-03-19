# Setup Guide - March Madness Bet Tracker

Follow these steps to get your application running.

## Step 1: Set Up Supabase Database

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click "New Project"
3. Fill in:
   - **Name**: march-madness-tracker (or any name you prefer)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to you
4. Click "Create new project" and wait ~2 minutes for setup

## Step 2: Get Database Connection Strings

1. In your Supabase project, go to **Settings** (gear icon) → **Database**
2. Scroll down to **Connection String** section
3. Select **URI** tab
4. Copy the connection string - it looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```
5. Replace `[YOUR-PASSWORD]` with the password you created in Step 1

## Step 3: Configure Environment Variables

1. Open the `.env.local` file in the project root
2. Replace both `DATABASE_URL` and `DIRECT_URL` with your connection string:

```env
DATABASE_URL="postgresql://postgres:YOUR_ACTUAL_PASSWORD@db.xxxxx.supabase.co:5432/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:YOUR_ACTUAL_PASSWORD@db.xxxxx.supabase.co:5432/postgres"
```

**Important**: 
- `DATABASE_URL` should have `?pgbouncer=true` at the end
- `DIRECT_URL` should NOT have `?pgbouncer=true`
- Replace `YOUR_ACTUAL_PASSWORD` with your real password
- Replace `xxxxx` with your actual project reference

## Step 4: Generate Prisma Client and Create Database Tables

Run these commands in order:

```bash
# Generate Prisma Client
npx prisma generate

# Push the schema to your database (creates tables)
npx prisma db push
```

You should see output like:
```
✔ Generated Prisma Client
Your database is now in sync with your Prisma schema.
```

## Step 5: Verify Database Setup (Optional)

Open Prisma Studio to view your empty database:

```bash
npx prisma studio
```

This opens a browser at `http://localhost:5555` where you can see the `persons`, `bets`, and `parlay_legs` tables.

## Step 6: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 7: Import Your First Bets

1. Navigate to [http://localhost:3000/admin](http://localhost:3000/admin)
2. Upload the `input/NCAA_Bets_Tracker.xlsx` file
3. Enter a person name (e.g., "Nick") if the spreadsheet doesn't have a "Person" column
4. Click "Import Bets"
5. Wait for confirmation
6. Go back to the home page to see the leaderboard!

## Troubleshooting

### "Error: P1001: Can't reach database server"
- Check that your `.env.local` file has the correct connection strings
- Verify your Supabase project is running (check the dashboard)
- Make sure you replaced the password placeholder

### "Error: Module not found: Can't resolve '@prisma/client'"
- Run `npx prisma generate` again
- Restart your dev server

### Import fails with "No data found in spreadsheet"
- Make sure your Excel file has data starting from row 1 (headers) and row 2 (first bet)
- Check that column names match exactly: `Type`, `Game Date/Time`, `Bet Description`, etc.

### TypeScript errors about Prisma types
- Run `npx prisma generate` to regenerate types
- Restart your IDE/editor

## Next Steps

Once you have bets imported:
- View the leaderboard at `/`
- Manage results at `/admin`
- Update bet results to Win/Loss and watch the leaderboard update
- Share the root URL with friends!

## Deployment to Vercel

When ready to deploy:

1. Push your code to GitHub (don't commit `.env.local`!)
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add environment variables in Vercel:
   - `DATABASE_URL`
   - `DIRECT_URL`
4. Deploy!

Your app will be live at `https://your-project.vercel.app`
