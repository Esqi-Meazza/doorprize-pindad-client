# Doorprize Client

React 19 + Vite frontend for the participant display, admin dashboard, and projector view.

## Setup

```powershell
Copy-Item .env.example .env
npm ci
npm run dev
```

The default dev server runs at `http://localhost:5173` and proxies `/api` to the backend at `http://localhost:3001`. Set `VITE_BACKEND_URL` when the backend is hosted elsewhere.

## Commands

```powershell
npm run dev
npm run build
npm run lint
npm run format:check
npm audit --audit-level=high --registry=https://registry.npmjs.org
```

## Application areas

- Public landing page: participant check-in and session entry.
- Doorprize display: realtime participant and winner display through Socket.IO.
- Admin panel: protected event, participant, prize, group, winner, and setting management.
- Projector display: dedicated realtime stage view for the event operator.

Routes are lazy-loaded to keep the initial bundle small. Admin and participant tokens are stored in `sessionStorage`.

## Project structure

- `src/pages/` contains public and admin screens.
- `src/components/` contains reusable UI and common controls.
- `src/context/` contains auth and session state.
- `src/routes/` contains lazy route registration and auth guards.
- `src/config/socket.js` contains Socket.IO client configuration.
