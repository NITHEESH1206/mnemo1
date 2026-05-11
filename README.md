# Mnemo

> Your AI memory layer. Everywhere you work.

A premium SaaS landing page and WhatsApp reminder bot for **Mnemo** — a calm, intelligent AI memory layer that captures reminders, ideas, and tasks across WhatsApp, Telegram, Email, and the web.

Built with Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion, and **Twilio Programmable Messaging** for the WhatsApp bot.

---

## ✨ What's in the box

### Marketing site
- **Landing** (`/`) — floating pill nav, bold hero with star rating + mascot orbs, integration marquee, horizontal mascot-card feature carousel, 3-step storyboard, animated stat band, big white testimonial cards, pricing with Origin / Supernova / Big Bang tiers, finale CTA, footer.
- **Pricing** (`/pricing`) — pricing + FAQ in isolation.
- **Mock dashboard** (`/dashboard`) — sidebar, top bar with greeting, quick-add, today's reminders, weekly calendar, channels, activity, completion ring + streak.
- **Design system** — warm cream + flame-orange + black palette, Apple-style glass buttons (`.btn-primary`, `.btn-glass`, `.btn-glass-dark`, `.btn-ink`), mascot SVGs, grain, gradient-bordered pricing card.

### WhatsApp bot
- **Every "Try for Free" CTA** opens WhatsApp via `wa.me` with a prefilled message.
- **`POST /api/whatsapp/webhook`** — Twilio's inbound webhook. Validates the request signature, parses natural language ("Remind me to call James tomorrow at 3pm"), stores the reminder, and replies via TwiML.
- **`GET /api/cron/dispatch`** — Authed cron endpoint that sends every due reminder via Twilio and advances recurring ones to their next occurrence.
- **Storage** — File-based JSON store at `.data/reminders.json` (good for dev + VPS / Docker). Swap in Postgres / Redis / KV by replacing the body of the functions in `lib/store.ts`.

---

## 🚀 Quick start (marketing site only, no Twilio)

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. CTAs will deep-link to the Twilio public WhatsApp sandbox (`+1 415 523 8886`) until you configure your own number.

---

## 📱 Wiring up the WhatsApp bot

### 1. Create a Twilio account & enable WhatsApp

1. Sign up at [twilio.com](https://www.twilio.com).
2. Console → **Messaging → Try it out → Send a WhatsApp message**. This gives you the **sandbox number** (`+1 415 523 8886`) and a **join code** (e.g. `join purple-elephant`).
3. For production, request a real WhatsApp Business Sender (Console → Senders → WhatsApp).
4. Copy your **Account SID** and **Auth Token** from the Twilio Console dashboard.

### 2. Create `.env.local`

Copy `.env.example` → `.env.local` and fill in:

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886   # sandbox, or your business number

# Frontend deep link (rebuild after changing these)
NEXT_PUBLIC_WHATSAPP_NUMBER=+14155238886
NEXT_PUBLIC_WHATSAPP_JOIN_CODE=purple-elephant   # only on sandbox

# Random string used to auth the cron endpoint
CRON_SECRET=replace-with-a-random-string

# Only true for local dev w/ ngrok — never in production
TWILIO_SKIP_VALIDATION=false
```

> `NEXT_PUBLIC_*` values are baked at build time. Restart `npm run dev` (or rebuild) after changing them.

### 3. Expose your local webhook

Run the app:

```bash
npm run dev
```

In a second terminal, expose it to the internet so Twilio can reach it:

```bash
# Install once: https://ngrok.com/download
ngrok http 3000
```

Copy the `https://xxxx.ngrok-free.app` URL.

### 4. Point Twilio at your webhook

Twilio Console → **Messaging → Try it out → Send a WhatsApp message → Sandbox settings**:

- **WHEN A MESSAGE COMES IN:** `https://xxxx.ngrok-free.app/api/whatsapp/webhook` (method: `HTTP POST`).
- Save.

For production senders, set the same webhook on your WhatsApp sender configuration page.

### 5. Try it

Open a phone, send `join <your-code>` to the Twilio number (or just click any **"Try for Free"** button on the landing page — it prefills the join message for you).

Then talk naturally:

| You say                                              | What happens                          |
| ---------------------------------------------------- | ------------------------------------- |
| `Remind me to call James tomorrow at 3pm`            | Schedules a one-off reminder          |
| `Standup prep every Friday at 9am`                   | Schedules a weekly recurrence         |
| `Pick up dry cleaning in 2 hours`                    | Schedules in 2h                       |
| `Drink water every day at 8am`                       | Daily recurrence                      |
| `list`                                               | Shows your pending reminders          |
| `cancel 2`                                           | Cancels reminder #2 from the list     |
| `help`                                               | Command guide                         |

### 6. Schedule the dispatcher

Reminders fire when **something** calls `GET /api/cron/dispatch`. Wire it up however you like:

**Vercel** — `vercel.json` is already included; it runs the dispatcher every minute. Set `CRON_SECRET` in Vercel env vars; Vercel signs cron calls automatically when the secret is set.

**A box you control** — add a crontab:

```cron
* * * * * curl -s -H "Authorization: Bearer $CRON_SECRET" https://your-domain.com/api/cron/dispatch > /dev/null
```

**External cron service** (cron-job.org, EasyCron…) — point it at `https://your-domain.com/api/cron/dispatch` with the `Authorization` header.

To test manually:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/dispatch
```

You'll get back `{ checkedAt, due, sent, errors }`.

---

## 🗂️ Project structure

```
app/
  layout.tsx
  page.tsx                      # Landing
  globals.css
  dashboard/page.tsx
  pricing/page.tsx
  api/
    whatsapp/webhook/route.ts   # Twilio inbound (POST)
    cron/dispatch/route.ts      # Reminder dispatcher (GET, authed)
components/
  landing/                      # Navbar, Hero, ..., Footer
  dashboard/                    # Sidebar, TopBar, cards
  ui/                           # GradientButton, GlowCard, Mascot,
                                # VideoBackground, FAQAccordion, ...
lib/
  whatsapp.ts                   # wa.me URL builder (frontend)
  twilio.ts                     # Twilio REST client + signature validation
  parser.ts                     # "remind me to X at Y" → ParsedReminder
  store.ts                      # File-backed reminder DB (swappable)
  messages.ts                   # Bot reply templates
  scheduler.ts                  # nextOccurrence() for recurrence
  constants.ts                  # All marketing copy
  utils.ts                      # cn() + greeting helper
public/
  videos/                       # Drop mp4s here (optional)
  icons/
.data/                          # Reminder JSON db (auto-created, gitignored)
.env.example                    # Twilio + WhatsApp config template
vercel.json                     # Cron schedule (every minute)
```

---

## 🔌 Swapping the storage layer

`lib/store.ts` is the only file that talks to disk. Every other file uses these four functions:

```ts
createReminder({ userPhone, task, fireAt, recurrence, weekday }) → Reminder
listForUser(userPhone) → Reminder[]
findDue(now?) → Reminder[]
markSentOrReschedule(id, nextFireAt | null)
cancelReminderForUser(userPhone, indexOneBased) → Reminder | null
```

Replace the file I/O inside those with your DB of choice:

- **Postgres / Supabase / Neon** — `pg` or Prisma. One `reminders` table.
- **Redis / Upstash** — sorted set keyed by `fireAt` for fast `findDue`.
- **Vercel KV** — same pattern as Redis.

The bot logic doesn't need to change.

---

## 🛡️ Production checklist

- [ ] `TWILIO_SKIP_VALIDATION` is `false` (the webhook validates every Twilio request).
- [ ] `CRON_SECRET` is set and your cron caller passes `Authorization: Bearer ...`.
- [ ] Swap `lib/store.ts` for a real database (file-backed storage doesn't survive serverless cold restarts).
- [ ] Set `NEXT_PUBLIC_WHATSAPP_NUMBER` to your **production** WhatsApp number and clear `NEXT_PUBLIC_WHATSAPP_JOIN_CODE`.
- [ ] Configure the production webhook URL on your Twilio sender.
- [ ] Test failure paths (Twilio down, bad input, etc.) — the webhook always replies with a friendly TwiML so the user never sees a 500.

---

## 🎨 Design tokens

| Token            | Value                                                     |
| ---------------- | --------------------------------------------------------- |
| `--bg-base`      | `#fff8f0` (warm cream)                                    |
| `--bg-tint`      | `#fef3e6`                                                 |
| `--bg-surface`   | `#ffffff`                                                 |
| `--text-primary` | `#0c0a09` (near black)                                    |
| `--text-muted`   | `#6b6660`                                                 |
| Flame palette    | `#fff7ed` → `#9a3412` (50 → 800)                          |
| Primary gradient | `linear-gradient(135deg, #fbbf24, #fb923c, #f97316, #ea580c)` |

---

## 📦 Tech

- Next.js 14.2 (App Router) · TypeScript 5
- Tailwind CSS 3.4 · Framer Motion 11 · lucide-react
- **twilio 5.x** (REST client + TwiML + signature validation)

---

## 🛣️ Routes

| Route                       | Method | Purpose                                  |
| --------------------------- | ------ | ---------------------------------------- |
| `/`                         | GET    | Marketing landing                        |
| `/pricing`                  | GET    | Standalone pricing + FAQ                 |
| `/dashboard`                | GET    | Mock authenticated dashboard             |
| `/api/whatsapp/webhook`     | POST   | Twilio inbound — parses + stores         |
| `/api/whatsapp/webhook`     | GET    | Liveness ping                            |
| `/api/cron/dispatch`        | GET    | Send all due reminders (Bearer auth)     |

---

## 📜 License

Sample content for demonstration. Replace the marketing copy before shipping.
