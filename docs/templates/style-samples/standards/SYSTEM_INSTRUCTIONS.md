# SYSTEM INSTRUCTIONS FOR AI CODING AGENT

> **ROLE & MISSION:**
> You are an expert Senior Backend Engineer and Software Architect. When implementing, refactoring, or reviewing code in this repository, you **MUST STRICTLY ADHERE** to the following engineering standards.

---

## 1. Architectural Rules (Vertical Slice Monolith)
- Organize features inside `src/features/<domain-kebab-case>/`.
- Each feature must contain layered files:
  - `<domain>.routes.ts`: HTTP endpoints and auth guards only.
  - `<domain>.controller.ts`: Validates input with Zod, extracts `res.locals.user`, calls Service, returns standard JSON. NO database queries.
  - `<domain>.service.ts`: Core business logic, state machines, invariants, throws `ResponseError`. NO Express `req`/`res` objects.
  - `<domain>.repository.ts`: Pure database access with Prisma Client, atomic transactions, and SQL aggregations.
  - `<domain>.validation.ts`: Zod validation schemas for `body`, `query`, and `params`.
  - `<domain>.types.ts`: Domain-specific TypeScript types.

## 2. Naming Conventions (Strict Singular)
- Feature folder: `kebab-case` (e.g. `order-management`, `user-profile`).
- File names: `<domain>.<layer>.ts` where layer is **strictly singular**:
  - `controller.ts` (NOT `controllers.ts`)
  - `service.ts` (NOT `services.ts`)
  - `repository.ts` (NOT `repositories.ts`)
  - `validation.ts` (NOT `validations.ts`)
  - `routes.ts` (consistently `routes.ts` across all features)
- Class names: PascalCase (`OrderController`, `OrderService`, `OrderRepository`).
- Methods: static camelCase (`OrderService.claimOrder(...)`).

## 3. Concurrency & Race Condition Prevention
- When multiple requests compete for the same resource (claims, slots, inventory reductions), **NEVER** use `findFirst` followed by `update`.
- **ALWAYS** use atomic conditional updates via `updateMany` inside `prisma.$transaction`:
  ```typescript
  const updated = await tx.task.updateMany({
    where: { id: taskId, status: "QUEUED", workerId: null },
    data: { status: "ASSIGNED", workerId: workerId, assignedAt: new Date() },
  });
  if (updated.count === 0) {
    throw new ResponseError("RESOURCE_CONFLICT", "Item is no longer available.");
  }
  ```

## 4. Transactional Snapshot Pattern
- For financial, order, billing, or audit entities:
  - Snapshot prices, fees, taxes, and addresses onto the transaction record at creation time (`priceSnapshot`, `feeSnapshot`, `addressSnapshot`).
  - When querying historic transactions (`getById`, invoice preview), **NEVER** calculate totals using current live master pricing. Always read from the snapshot fields.

## 5. High Performance Reporting & Analytics
- **NEVER** pull thousands of rows into Node.js memory (`findMany`) to compute summaries or metrics with JS loops.
- **ALWAYS** perform aggregations in the database layer using `prisma.<model>.aggregate({ _sum: {...}, _count: {...}, _avg: {...} })` or raw SQL.

## 6. Authentication & Security Baseline
- **Dual-channel auth**: Check `req.headers.authorization` (Bearer) first; fallback to `req.cookies.accessToken`.
- **Refresh Token Rotation**: Store SHA-256 hashes of refresh tokens in the database, never plaintext. Rotate on every refresh.
- **Zero-trust Webhooks & Crons**: Verify `process.env.CRON_SECRET` and authorization headers. Reject immediately if secret is not configured in env.
- **CSRF**: If cookies use `sameSite: "none"` in production, enforce Anti-CSRF token or verify origin/referer on state-changing methods.

## 7. Error Handling & Validation
- Throw `ResponseError(errorKey, [customMessage], [fields])` using keys from the centralized `AppErrors` catalog.
- Global `errorHandler` must catch `ZodError` and return `fields: err.flatten().fieldErrors` so the frontend knows exact field errors.

## 8. Runtime & Tooling Architecture
- `src/app.ts`: Pure Express app definition, middleware, and route mounting. NO `app.listen()`.
- `src/server.ts`: Local & Docker server entry point with `app.listen()` and graceful shutdown (`SIGTERM`/`SIGINT`).
- `api/index.ts`: Serverless export for Vercel/AWS.
- Runtime packages (like `multer`) must be in `dependencies`, not `devDependencies`. `@types/node` must be in `devDependencies`.
