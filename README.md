# Frank Solutions — Pricing Tool

A personal pricing dashboard to research market rates and generate quotes for clients.

## Features

- **Dashboard** — stats overview, recent quotes at a glance
- **New Quote Wizard** — 4-step flow: pick client → describe service → AI market research → set final price
- **AI Market Research** — uses Anthropic Claude to research current market rates for your service type in the client's location, factoring in their tech level and urgency
- **My Rates** — your own baseline rate table, editable per service
- **Client Manager** — full client history, repeat client pricing context
- **CSV Import** — bulk import existing clients from a spreadsheet
- **Quote History** — full log of all quotes with AI recommendation vs. final price

## Tech Stack

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** — clean dark-sidebar design
- **Prisma** + SQLite (local) or PostgreSQL (production)
- **Anthropic Claude API** — for market research

---

## Local Setup

### 1. Clone and install

```bash
git clone https://github.com/fcobuilds/pricing-tool.git
cd pricing-tool
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` and add your Anthropic API key:

```
ANTHROPIC_API_KEY=sk-ant-...
DATABASE_URL="file:./dev.db"
```

Get your key at: https://console.anthropic.com

### 3. Set up the database

```bash
npx prisma db push
```

This creates the local SQLite database. Your service rates will be seeded automatically on first load.

### 4. Run the app

```bash
npm run dev
```

Open http://localhost:3000

---

## Deploying to Vercel (so you can access it at pricing.frank-solutions.com)

### Step 1: Create a free PostgreSQL database

1. Go to https://neon.tech and create a free account
2. Create a new project (e.g. "pricing-tool")
3. Copy the connection string — it looks like:
   `postgresql://user:pass@host/dbname?sslmode=require`

### Step 2: Switch the database provider

In `prisma/schema.prisma`, change:
```prisma
datasource db {
  provider = "sqlite"      # change this to...
  provider = "postgresql"  # ...this
  url      = env("DATABASE_URL")
}
```

### Step 3: Deploy to Vercel

1. Go to https://vercel.com and import this GitHub repo
2. Add these environment variables in the Vercel dashboard:
   - `ANTHROPIC_API_KEY` = your Anthropic key
   - `DATABASE_URL` = your Neon PostgreSQL connection string
3. Deploy

### Step 4: Point your domain

In your domain registrar (GoDaddy, Namecheap, etc.), add a DNS record:

| Type  | Name    | Value                    |
|-------|---------|-------------------------|
| CNAME | pricing | cname.vercel-dns.com     |

This makes `pricing.frank-solutions.com` point to your Vercel app.

Then in Vercel → your project → Settings → Domains, add `pricing.frank-solutions.com`.

---

## CSV Import Format

To import existing clients, create a CSV with these columns:

```
name,location,email,phone,techLevel,clientType,notes
John Smith,Miami FL,john@email.com,305-555-1234,beginner,residential,Regular customer
ABC Company,Miami FL,contact@abc.com,,intermediate,smb,System migration client
```

- **Required:** `name`, `location`
- `techLevel`: `beginner` / `intermediate` / `advanced`
- `clientType`: `residential` / `smb`

---

## Service Types

| Key | Label |
|-----|-------|
| `it-support` | IT Support / Tech Help |
| `social-media` | Social Media Management |
| `consulting` | Tech Consulting / Advisory |
| `web-dev` | Web Development |
| `system-migration` | System Migration |
| `lead-generation` | Lead Generation |
| `workshop` | Workshop / Training |
