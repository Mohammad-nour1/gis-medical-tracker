# GIS Medical Dashboard

Real-time GIS medical resource monitoring for Syrian health sector managers.

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment:

```bash
cp .env.example .env.local
```

Set `DATABASE_URL` to your PostgreSQL/Supabase connection string with PostGIS enabled.

3. Apply schema and seed:

Run these SQL files against the database in order:

- `infrastructure/database/migrations/001_init.sql`
- `infrastructure/database/migrations/002_ambulance_location_snapshots.sql`

4. Start the application:

```bash
npm run dev
```

Open `http://localhost:3000`.

5. Run tests:

```bash
npm test
```

## Architecture

Hexagonal layout with clear boundaries:

- `core/` entities, ports, use-cases, domain errors, simulation logic
- `infrastructure/` PostgreSQL/PostGIS adapters and Socket.io broadcaster
- `interface/http/` Express routes, validation, DTOs, error middleware
- `interface/websocket-gateway/` Socket.io gateway
- `frontend/` dashboard features (`map`, `alerts`, `filters`, `time-machine`, `dispatch`)
- `packages/react-med-geo-streamer/` required stream state library `2.1.0`

`core` does not import from `infrastructure` or `interface`.

## Flowchart Compliance

Monitoring cycle is literal:

1. `CalculateAvailableBeds`
2. `EvaluateOccupancyStatus` (`occupancy > 90%`)
3. RED: set status, trigger alert, find nearest ambulance with PostGIS `ST_Distance`, assign route and dispatch
4. GREEN: set status, assign route and dispatch with no ambulance
5. Continue via monitoring/simulation loop

GREEN never returns directly to calculate. Both paths pass through `AssignRouteAndDispatch`.

## Architectural Decisions

### Vercel Serverless + Socket.io persistent connection

Socket.io requires a persistent Node process. The official runtime is custom `server.ts`:

- Express handles `/api/*`
- Socket.io attaches to the same HTTP server
- Next.js renders the dashboard

For production with true persistent TCP connections, deploy `server.ts` on a Node host that keeps the process alive. Vercel cron can still call `/api/monitoring/run`.

### react-med-geo-streamer@2.1.0

The package is not published on npm.

Local package `packages/react-med-geo-streamer@2.1.0` wraps `socket.io-client` and exposes stream hooks through `useSyncExternalStore`.

Rules enforced by implementation:

- live socket connection, events, alerts, ambulance live updates, facility live status updates use `react-med-geo-streamer` only
- UI-only state (filters, date picker, modal/select state) uses React local state
- Ably and Zustand are not used

### Express as official backend

Next API Routes are not the backend. All APIs are registered in Express (`interface/http/routes/registerRoutes.ts`).

## API

- `GET /api/facilities?type=&governorate=&status=`
- `GET /api/ambulances?status=`
- `GET /api/history?timestamp=&facilityId=`
  - with `facilityId`: closest occupancy snapshot
  - without `facilityId`: `{ occupancySnapshots, ambulanceSnapshots }`
- `GET|POST /api/monitoring/run`
- `POST /api/simulation/tick`
- `POST /api/simulation/start`
- `POST /api/simulation/stop`
- `POST /api/dispatch/manual`

## Realtime Events

- `occupancy-critical`
- `status-changed`
- `ambulance-dispatched`
- `ambulance-location`
- `simulation-tick`

## Quality Guarantees

- centralized Express error middleware
- request validation for query/body inputs
- response DTOs for stable contracts
- design tokens for UI consistency
- unit tests for occupancy logic, RED/GREEN flowchart paths, and validation
