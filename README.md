# Issue Management — Multi-tenant API (NestJS)

A small, focused NestJS backend implementing a **multi-tenant** Issue Management API for an internal tool. It intentionally omits authentication (mocked user context is used) so the exercise concentrates on **tenant isolation**, **role-based authorization**, and **audit logging**.

---

## Quick start

1. Copy environment example:

   cp .env.example .env

2. Install deps:

   npm install

3. Generate Prisma client:

   npm run prisma:generate

4. Push schema to local SQLite (creates `dev.db`):

   npx prisma db push --url file:./dev.db

5. (Optional) Seed sample orgs & users:

   node prisma/seed.js

6. Build and start:

   npm run build
   node dist/src/main.js

The server listens on port 3000 by default (use `PORT` env to change).

---

##  How to use (quick examples)

All requests must include headers to mock the current user context:

- `x-user-id`: the user's id (e.g., `admin-1`)
- `x-organization-id`: the tenant id (e.g., `org-1`)
- `x-role`: `ADMIN` or `MEMBER`

Example: create an issue (curl):

```bash
curl -X POST http://localhost:3000/issues \
  -H 'Content-Type: application/json' \
  -H 'x-user-id: admin-1' \
  -H 'x-organization-id: org-1' \
  -H 'x-role: ADMIN' \
  -d '{"title":"Bug in signup","description":"Steps to reproduce..."}'
```

PowerShell example (POST):

```powershell
$h=@{'Content-Type'='application/json';'x-user-id'='admin-1';'x-organization-id'='org-1';'x-role'='ADMIN'}
Invoke-RestMethod -Uri http://localhost:3000/issues -Method POST -Headers $h -Body '{"title":"Bug","description":"..."}'
```

Available endpoints:

- POST /issues
- GET /issues
- GET /issues/:id
- PATCH /issues/:id
- DELETE /issues/:id

> Note: Only **ADMIN** users can change issue status, assign issues, or delete issues. Status/assignee changes create an `ActivityLog` record.

---

##  Architecture & Decisions (short answers)

1) **How did you implement multi-tenancy in NestJS?**

All domain models include an `organizationId` column and every service method filters or asserts by `organizationId` using the mocked user context (`req.user.organizationId`). This enforces tenant scoping at the service layer (row-level isolation).

2) **Where does authorization logic live (Guard vs Service) and why?**

Coarse-grained role checks (route-level restrictions like "only ADMIN can DELETE") are done with a `RolesGuard` + `@Roles()` decorator. Fine-grained checks that depend on object state (e.g., only ADMIN can change status/assignee and we must compare previous values) are enforced inside the **service** so we have access to the entity prior to mutation.

3) **How would you prevent cross-organization leaks in production?**

Recommendations: add DB-level protections (row-level security or separate databases per tenant), enforce tenant filters at the query layer and in services, add integration tests for tenant isolation, and consider policy enforcement tools or middleware that injects tenant filters automatically.

4) **What would need redesign at scale (100k orgs)?**

Single shared DB with a billion+ rows will break. At scale you should: introduce tenant sharding/partitioning, consider per-tenant databases or data stores, add index strategies on `organizationId`, and migrate long-running tasks to background workers. Also add horizontal scaling for the API and robust caching strategies.

5) **What features were intentionally skipped?**

Auth (JWT/OAuth), background jobs, full testing suite, observability (metrics/tracing) and deployment automation were skipped to keep scope focused and deliver the core multi-tenant behavior.

---

## 📁 Notable files

- `prisma/schema.prisma` — data model (Organization, User, Issue, ActivityLog)
- `src/common/middleware/mock-auth.middleware.ts` — attaches `req.user` from headers
- `src/common/guards/roles.guard.ts` — route-level role guard
- `src/issues/*` — controller, service, DTOs for issue CRUD + activity logging
- `prisma/seed.js` — simple script to seed sample orgs/users

---

## ⚠️ Tips & gotchas

- The implementation uses Prisma v7 and a driver adapter for SQLite (dev only). For production use choose Postgres and a robust adapter/driver.
- Always pass `x-organization-id` header to simulate requests from different tenants during testing.


License: MIT

