# Flowboard

A real-time collaborative task board. Teams create workspaces, organize work across boards with lists and cards, and see each other's changes live without refreshing.

## Stack

- **Frontend:** Angular 17+, Signals, TailwindCSS
- **Backend:** NestJS, WebSockets, PostgreSQL, Redis
- **Infra:** Docker Compose (local), Railway + Vercel (production)

## Dev setup

```bash
pnpm install
pnpm db:up
pnpm dev:api   # http://localhost:3000
pnpm dev:web   # http://localhost:4200
```
