# Somnium Frontend

Real-time ECMO patient survivability prediction system - Next.js frontend with tRPC, Zustand, and Server-Sent Events.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **API**: tRPC (type-safe API calls to FastAPI backend)
- **State Management**: Zustand (with persist & devtools middleware)
- **Data Fetching**: TanStack Query (via tRPC)
- **Real-time**: Server-Sent Events (SSE)
- **Validation**: Zod
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Icons**: Lucide React

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/login/            # Auth route group
│   ├── (dashboard)/             # Dashboard route group
│   │   ├── patients/            # Patient management
│   │   └── nurse-station/       # Nurse station view
│   ├── api/trpc/[trpc]/         # tRPC API handler
│   ├── layout.tsx               # Root layout with TRPCProvider
│   ├── page.tsx                 # Home page
│   └── globals.css              # Global styles
├── components/
│   ├── ui/                      # shadcn/ui components
│   ├── auth/                    # Authentication components
│   ├── patients/                # Patient-related components
│   ├── vitals/                  # Vital signs components
│   ├── labs/                    # Lab results components
│   ├── alerts/                  # Alert components
│   └── predictions/             # Prediction display components
├── lib/
│   ├── trpc/
│   │   ├── client.ts            # tRPC React client
│   │   └── provider.tsx         # tRPC + TanStack Query provider
│   ├── validations/             # Zod schemas (shared with backend)
│   │   ├── auth.ts
│   │   ├── patient.ts
│   │   ├── vitals.ts
│   │   ├── labs.ts
│   │   ├── alerts.ts
│   │   └── predictions.ts
│   └── utils.ts                 # Utility functions (cn, etc.)
├── server/
│   ├── trpc.ts                  # tRPC initialization & procedures
│   ├── context.ts               # Request context (user, token)
│   └── routers/
│       ├── _app.ts              # Root router
│       └── auth.ts              # Auth router (login, me, refresh)
├── stores/
│   ├── auth-store.ts            # Zustand auth state (JWT, user)
│   ├── ui-store.ts              # UI state (sidebar, toasts, theme)
│   └── sse-store.ts             # Real-time data from SSE
├── hooks/
│   └── use-sse.ts               # SSE hooks for real-time updates
└── types/
    └── index.ts                 # Shared TypeScript types
```

## Key Features

### 1. Type-Safe API with tRPC

```typescript
// server/routers/auth.ts
export const authRouter = createTRPCRouter({
  login: publicProcedure
    .input(loginSchema)
    .mutation(async ({ input }) => {
      // Calls FastAPI backend
      const res = await fetch(`${API_URL}/auth/token`, { ... })
      return { tokens, user }
    }),
})

// Client usage
const loginMutation = trpc.auth.login.useMutation()
loginMutation.mutate({ email, password })
```

### 2. JWT Authentication with FastAPI Backend

- **Login**: `POST /api/v1/auth/token` (OAuth2 password flow)
- **Refresh**: `POST /api/v1/auth/refresh`
- **Profile**: `GET /api/v1/auth/me` (with Bearer token)

Token stored in Zustand with persistence:

```typescript
const { user, token, refreshToken, setAuth, logout } = useAuthStore()
```

### 3. Role-Based Access Control (RBAC)

```typescript
// Check scope
const canViewPredictions = useHasScope('read:predictions')

// Roles: nurse, physician, ecmo_specialist, admin
// Scopes: read:patients, write:vitals, read:predictions, etc.
```

### 4. Real-Time Updates via SSE

```typescript
// Hook for patient vitals
const { data, isConnected } = usePatientVitals(patientId)

// Hook for system alerts
const { data: alerts } = useAlerts()
```

### 5. Zod Validation Schemas

All data is validated with Zod schemas shared between client and server:

```typescript
// Type inference from schemas
export const patientSchema = z.object({ ... })
export type Patient = z.infer<typeof patientSchema>
```

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- FastAPI backend running at `http://localhost:8000`

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your backend URL

# Install shadcn/ui components (optional)
npx shadcn@latest add button card form input dialog toast select tabs table badge
```

### Development

```bash
# Start dev server
npm run dev

# Open http://localhost:3000
```

### Build for Production

```bash
npm run build
npm start
```

## Environment Variables

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_SSE_URL=http://localhost:8000/api/v1
```

## API Integration

### FastAPI Backend Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/token` | POST | Login (OAuth2 password flow) |
| `/auth/me` | GET | Get current user |
| `/auth/refresh` | POST | Refresh access token |
| `/patients` | GET/POST | List/create patients |
| `/patients/{id}` | GET/PUT | Get/update patient |
| `/patients/{id}/vitals` | GET/POST | Vitals for patient |
| `/patients/{id}/vitals/stream` | GET (SSE) | Real-time vitals |
| `/patients/{id}/labs` | GET/POST | Lab results |
| `/alerts` | GET | List alerts |
| `/alerts/stream` | GET (SSE) | Real-time alerts |
| `/predictions` | POST | Request prediction |
| `/predictions/{patient_id}` | GET | Get latest predictions |

### tRPC Routers

Currently implemented:
- `auth` - Login, logout, refresh token, get current user

To be implemented:
- `patient` - CRUD operations for patients
- `vitals` - Query and create vital signs
- `labs` - Query and create lab results
- `alerts` - Query, acknowledge, resolve alerts
- `predictions` - Request and view predictions
- `dashboard` - Dashboard statistics and overviews

## Adding shadcn/ui Components

```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add form
npx shadcn@latest add input
npx shadcn@latest add dialog
npx shadcn@latest add toast
npx shadcn@latest add select
npx shadcn@latest add tabs
npx shadcn@latest add table
npx shadcn@latest add badge
```

## Next Steps

### Immediate Priorities

1. **Create remaining tRPC routers**:
   - Patient router (CRUD)
   - Vitals router (query, create, stream)
   - Labs router (query, create)
   - Alerts router (query, acknowledge, resolve)
   - Predictions router (request, view)
   - Dashboard router (statistics)

2. **Build UI components**:
   - Login form with React Hook Form
   - Patient list and detail views
   - Vital signs charts (Recharts)
   - Lab results table
   - Alert notification system
   - Prediction dashboard with SHAP explanations

3. **Implement route guards**:
   - Auth guard for protected routes
   - Role-based component visibility

4. **Add error handling**:
   - Global error boundary
   - Toast notifications for mutations
   - SSE reconnection logic

5. **Testing**:
   - Unit tests for Zod schemas
   - Integration tests for tRPC routers
   - E2E tests for critical flows

## Architecture Decisions

### Why tRPC?

- **End-to-end type safety**: No code generation, types inferred automatically
- **Better DX**: Autocomplete, inline errors, refactoring support
- **Smaller bundle**: No GraphQL or REST client overhead
- **Perfect for monorepo**: Shared types between Next.js and FastAPI proxy layer

### Why Zustand over Redux?

- **Simpler API**: No boilerplate, actions, or reducers
- **Better performance**: Fine-grained reactivity with selectors
- **Middleware**: Built-in persist, devtools, immer
- **Smaller bundle**: ~1KB vs Redux's ~3KB + middleware

### Why SSE over WebSockets?

- **Simpler protocol**: HTTP-based, works with existing infrastructure
- **Auto-reconnect**: Built into EventSource API
- **Unidirectional**: Perfect for server → client updates (vitals, alerts)
- **FastAPI support**: Native SSE support via `StreamingResponse`

## License

MIT
