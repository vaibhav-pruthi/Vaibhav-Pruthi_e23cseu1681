# Customer Resolution Agent

Airline disruption support assistant.

The app helps passengers with cancelled or delayed flights: it looks up a booking, applies airline policy, and walks the customer through rebooking, refunds, delay care, or supervisor escalation.

## What it does

- Booking lookup by PNR (passenger name record)
- Policy-aware chat for cancellations and delays
- Loyalty-tier handling (Silver, Gold, Platinum)
- Confirmation flow before rebooking or refund
- Escalation when a request needs a supervisor (fare waivers, legal threats, and similar cases)
- In-app policy inspector for the rules the agent follows

## Tech stack

| Layer | Tools |
| --- | --- |
| Client | React 18, TypeScript, Vite, Tailwind CSS |
| Server | Express, TypeScript (`tsx`) |
| Data | In-memory store (seeded demo customers and flights) |
| Tests | Policy and dialog checks via `npm run test:policy` |

## Project layout

```
├── src/                 # React UI
│   ├── components/      # Chat, dashboard, modals, landing
│   └── types/
├── server/
│   ├── db/              # Seeded customers, bookings, policies
│   ├── routes/          # REST API
│   ├── services/        # Dialog engine + policy engine
│   └── tests/
├── index.html
├── package.json
└── vite.config.ts       # Dev server on :3000, proxies /api to :5000
```

## Getting started

**Requirements:** Node.js 18 or later.

```bash
npm install
npm run dev
```

This starts:

- API server at [http://localhost:5000](http://localhost:5000)
- UI at [http://localhost:3000](http://localhost:3000)

Other scripts:

```bash
npm run test:policy   # policy / dialog checks
npm run build         # production client build
```

## Demo bookings

Use these PNRs on the landing screen (exercise date: **Wednesday, 23 September 2026**).

| Passenger | PNR | Situation |
| --- | --- | --- |
| Priya Nair (Gold) | `SK4821X` | SK-204 Delhi → Goa cancelled |
| Arvind Kulkarni (Silver) | `TR1190B` | SK-118 Mumbai → Bengaluru delayed ~3.5 hours |
| Meher Kaur (Platinum) | `WL7742` | SK-901 Delhi → London delayed overnight |

## Policy highlights

- **Airline-caused cancellation:** free rebooking on the next available flight within 24 hours, or a full refund to the original payment method within 7 business days. Gold and Platinum get rebooking priority.
- **Delay care:** meal voucher, lounge access, and hotel stay depend on delay length and overnight disruption.
- **Escalation:** extra cash compensation, complimentary cabin upgrades, fare-difference waivers, and legal threats are not auto-resolved.

Exact amounts and eligibility live in `server/services/policyEngine.ts` and the seeded policies in `server/db/database.ts`.

## API (local)

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Server health |
| `GET` | `/api/customers` | Demo customer list |
| `POST` | `/api/auth/lookup` | Look up booking by `{ pnr }` |
| `GET` | `/api/policies` | Active policy text |
| `POST` | `/api/chat/initial` | First agent message |
| `POST` | `/api/chat` | Next chat turn |

## Notes

- This is a demo: data is in memory and resets when the server restarts.
- Do not commit `.env` files, `node_modules`, or build output.
