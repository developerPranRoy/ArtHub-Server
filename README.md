# ArtHub — Online Art Marketplace

ArtHub is a full-stack digital marketplace that connects art lovers and collectors with independent
artists. Buyers can browse, search, and purchase original artworks; artists can publish and manage
their own gallery; admins oversee users, artworks, and platform-wide transactions.

## Live URL
- Client (Vercel): `https://art-hub-client-ochre.vercel.app` — replace with your actual Vercel URL
- Server (Render): `https://arthub-server-9uit.onrender.com` — replace with your actual Render URL

## Admin Credentials
- Email: `admin@arthub.com`
- Password: `Admin@123`

(Create this account manually by registering normally, then changing the role to `admin`
directly in the database, or via the admin user-management screen once one admin exists.)

## Key Features
- JWT-based authentication (email/password), role selection (Buyer / Artist) on signup
- Role-based dashboards: User, Artist, Admin — each with its own protected routes
- Browse page with search, category filter, price range filter, sorting, and pagination
- Artwork details page with purchase flow and a comment system restricted to verified buyers
- Artist tools: add / edit / delete artworks, sales history
- Admin tools: manage users & roles, manage all artworks, view all transactions, analytics overview
- Subscription tiers (Free / Pro / Premium) controlling purchase limits
- Image uploads via imgBB
- Responsive design, skeleton loaders, custom 404 page, and a global error boundary
- "Sold" badge and automatic unpublishing after purchase
- Simulated email notifications (console log) on purchase / subscription

## Tech Stack
**Client:** Next.js (App Router) + TypeScript, Tailwind CSS, HeroUI (Button, Input, Card, Chip, Avatar, RadioGroup, Textarea, Pagination, Spinner/Skeleton), Heroicons, Recharts, Axios, react-hot-toast
**Server:** Express.js + TypeScript, MongoDB (native driver, no ORM), JWT, bcryptjs — run via `tsx`

## NPM Packages Used
- Client: `next`, `react`, `react-dom`, `typescript`, `@heroui/react`, `@heroicons/react`, `framer-motion`, `recharts`, `axios`, `react-hot-toast`, `tailwindcss`, `postcss`, `autoprefixer`
- Server: `express`, `mongodb`, `jsonwebtoken`, `bcryptjs`, `cors`, `dotenv`, `typescript`, `tsx`, `@types/*`

## Notes on HeroUI
Only the compatibility-safe HeroUI v2 component subset is used directly (`Card`, `Input`, `Textarea`,
`Button`, `Avatar`, `Chip`, `RadioGroup`/`Radio`, `Pagination`, `Spinner`, `Skeleton`). Dropdown/category
selects use plain native `<select>` styled to match, since HeroUI's `Select` has known compatibility
quirks in v3 — same pattern used in your other projects (HireLoop, MediQueue). `HeroUIProvider` wraps the
app in `app/providers.tsx`, and the theme color is wired to the same `brand` purple used across the app
via `tailwind.config.js`.

Admin analytics charts (category breakdown bar + pie) are built with `recharts` in
`app/dashboard/admin/page.tsx`.

## Project Structure
```
arthub/
├── client/        Next.js + TypeScript frontend
│   ├── app/       App router pages (routes match the URL structure)
│   ├── components/
│   ├── context/   AuthContext (JWT session handling)
│   └── lib/       axios instance, imgBB upload helper, shared types
└── server/        Express + TypeScript backend (module pattern)
    └── src/
        ├── types.ts        Shared types (UserDoc, ArtworkDoc, AuthRequest, etc.)
        ├── config/          DB connection
        ├── middleware/      auth guard, role guard, error handler
        └── modules/
            ├── auth/        register, login
            ├── users/       profile, admin user management
            ├── artworks/    CRUD, browse/search/filter, featured, top artists
            ├── comments/    purchase-gated comments
            └── transactions/ purchases, subscriptions, analytics
```

## Running Locally

### Server
```bash
cd server
cp .env.example .env   # fill in your MongoDB URI and JWT secret
npm install
npm run dev      # runs src/server.ts directly via tsx, with auto-reload
```
`npm run build && npm start` also works (compiles to `dist/` with `tsc`, then runs with plain Node).

### Client
```bash
cd client
cp .env.local.example .env.local   # fill in your API URL and imgBB key
npm install
npm run dev
```

## Notes on Payments
The purchase and subscription endpoints are written to be the **post-payment** step
(e.g. what a Stripe webhook calls after a successful checkout). To go fully live with Stripe:
1. Create a Stripe Checkout Session on the server when "Buy Now" / "Upgrade" is clicked.
2. Redirect the user to Stripe's hosted checkout page.
3. Add a webhook endpoint (`/api/webhooks/stripe`) that verifies the event and then calls
   `recordPurchase()` / `recordSubscriptionPayment()` from `transactions.service.js`.

## Deploying on Vercel

**Client (recommended path):** Vercel is built for Next.js — deploy `client/` as its own
Vercel project. Set Root Directory to `client`, framework auto-detects as Next.js, and add
`NEXT_PUBLIC_API_URL` + `NEXT_PUBLIC_IMGBB_API_KEY` as environment variables.

**Server — two options:**

1. **Render / Railway (recommended):** Express + a persistent MongoDB connection behaves
   more predictably on a traditional Node host than on serverless. Root Directory `server`,
   build command `npm install && npm run build`, start command `npm start`. Set
   `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLIENT_URL` (your Vercel URL) as env vars.

2. **Vercel serverless (if you want everything on Vercel):** `server/api/index.ts` wraps the
   Express app as a serverless function, and `server/vercel.json` routes all requests to it.
   Deploy `server/` as its own Vercel project (Root Directory `server`), set the same env
   vars there. Note: serverless functions are stateless per cold start — the DB connection is
   cached at module scope so it's reused while the function instance stays warm, but expect
   occasional cold-start latency on the first request after idle time.

Either way, **CORS matters**: whatever `CLIENT_URL` you set on the server must exactly match
the deployed frontend's URL, or the browser will block requests.

## Deployment Checklist
- Set all environment variables on your hosting platform (never commit `.env` files)
- Confirm CORS `CLIENT_URL` on the server matches your deployed frontend URL exactly
- Test every private route after a hard page reload while logged in
- Test direct navigation to nested routes (e.g. `/dashboard/artist/add`) to confirm no 404s
