# CONTEXT.md — Lynq (AgentApp) Complete Project Reference

> This file is a living document. Update it as the project evolves.

---

## 1. Project Identity

**Name:** Lynq  
**Goal:** AI Agent App that lets users interact via chat to automate tasks (Notion, Google Calendar, etc.)  
**Current State:** Authentication flow complete. Chat/Messages system is next.  
**Package name:** `lynq` (ESM, `"type": "module"`)

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js (ESM) |
| Language | TypeScript 6 (strict, `nodenext`) |
| HTTP Framework | Fastify 5 |
| ORM | Prisma 7 (PostgreSQL adapter) |
| Database | PostgreSQL 15 |
| Cache / Blacklist | Redis 7 |
| Validation | Zod 4 |
| Password Hashing | bcryptjs |
| Auth | JWT (jsonwebtoken) + Refresh Tokens |
| Testing | Vitest + v8 coverage |
| Containerization | Docker Compose |

---

## 3. Directory Structure

```
AgentApp/
├── src/
│   ├── app.ts                          # Fastify instance + global error handler
│   ├── server.ts                       # Server bootstrap (cookie plugin, listen)
│   ├── env/
│   │   └── index.ts                    # Zod env validation (PORT, JWT_SECRET, etc.)
│   ├── http/
│   │   ├── routes.ts                   # Route registration + auth middleware
│   │   └── controllers/
│   │       ├── createUserController.ts
│   │       ├── loginUserController.ts
│   │       ├── logoutUserController.ts
│   │       ├── logoutUserFromAllDevicesController.ts
│   │       └── refreshUserAuthController.ts
│   ├── services/
│   │   ├── createUserService.ts
│   │   ├── loginUserService.ts
│   │   ├── logoutUserService.ts
│   │   ├── logoutUserFromAllDevicesService.ts
│   │   ├── refreshUserAuthService.ts
│   │   └── errors/
│   │       ├── InvalidCredentialsError.ts
│   │       ├── InvalidPasswordLengthError.ts
│   │       ├── InvalidTokenError.ts
│   │       ├── TokenExpiredError.ts
│   │       ├── TokenRevokedError.ts
│   │       ├── UnauthorizedError.ts
│   │       └── UserAlreadyExistsError.ts
│   ├── repositories/
│   │   ├── UsersRepositoryInterface.ts
│   │   ├── RefreshTokensRepositoryInterface.ts
│   │   ├── database/
│   │   │   ├── DatabaseUsersRepository.ts
│   │   │   └── DatabaseRefreshTokensRepository.ts
│   │   └── memory/
│   │       ├── MemoryUsersRepository.ts
│   │       └── MemoryRefreshTokensRepository.ts
│   ├── interfaces/
│   │   ├── CreateUser.ts
│   │   ├── CreateRefreshToken.ts
│   │   ├── GenerateTokens.ts
│   │   ├── LoginUser.ts
│   │   ├── LogoutUser.ts
│   │   ├── RefreshToken.ts
│   │   └── entities/
│   │       ├── User.ts
│   │       └── RefreshToken.ts
│   ├── schemas/
│   │   ├── createUserBodySchema.ts
│   │   ├── loginUserBodyShema.ts
│   │   ├── refreshUserAuthCookiesSchema.ts
│   │   ├── logoutUserCookiesSchema.ts
│   │   └── getAccessTokenHeaderSchema.ts
│   ├── lib/
│   │   ├── generateTokens.ts           # JWT + refresh token generation
│   │   ├── getAccessToken.ts           # Extract Bearer token from header
│   │   ├── getRefreshToken.ts          # Extract refresh token from cookies
│   │   ├── prisma.ts                   # Prisma client singleton
│   │   └── redis.ts                    # Redis client singleton
│   └── tools/
│       ├── redisClone.ts               # In-memory Redis for tests
│       └── interfaces/
│           └── RedisInterface.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── test/
│   ├── createUserService.test.ts
│   ├── loginUserService.test.ts
│   ├── refreshUserAuthService.test.ts
│   ├── logoutUserService.test.ts
│   └── logoutUserFromAllDevices.test.ts
├── docker-compose.yml
├── package.json
├── tsconfig.json
├── vite.config.ts
└── prisma.config.ts
```

---

## 4. Environment Variables

Validated at startup via Zod in `src/env/index.ts`. App crashes if any are missing.

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=<random secret>
COOKIES_SECRET=<random secret>
DATABASE_URL=postgresql://docker:docker@localhost:5432/lynq-db
```

---

## 5. Database Schema (Prisma + PostgreSQL)

```prisma
model User {
  id             String         @id @default(uuid())
  email          String         @unique
  name           String?
  password_hash  String
  refresh_tokens RefreshToken[]
}

model RefreshToken {
  id         String   @id @default(uuid())
  token      String   @unique
  created_at DateTime @default(now())
  expires_at DateTime
  revoked    Boolean  @default(false)
  user_id    String
  user       User     @relation(fields: [user_id], references: [id], onDelete: Cascade)
}
```

**Migration history:**
1. `20260407010816` — Create users table
2. `20260411154411` — Create refresh_tokens table
3. `20260411183054` — Rename `deleted` → `revoked`
4. `20260412164925` — Change cascade to `CASCADE` (was `RESTRICT`)

---

## 6. API Routes

### Public (no auth required)

| Method | Path | Controller | Description |
|---|---|---|---|
| GET | `/api` | inline | Health check |
| POST | `/api/v1/auth/register` | createUserController | Create account |
| POST | `/api/v1/auth/login` | loginUserController | Login, get tokens |
| POST | `/api/v1/auth/refresh` | refreshUserAuthController | Rotate refresh token |

### Private (requires `Authorization: Bearer <jwt>`)

| Method | Path | Controller | Description |
|---|---|---|---|
| POST | `/api/v1/auth/logout` | logoutUserController | Logout current device |
| POST | `/api/v1/auth/logout-all` | logoutUserFromAllDevicesController | Logout all devices |
| GET | `/api/v1/chats` | — | **Placeholder — not implemented yet** |

---

## 7. Authentication Flow

### Registration (`POST /api/v1/auth/register`)
1. Validate body with `createUserBodySchema`
2. `CreateUserService`: validate password ≥ 8 chars, hash with bcrypt, check unique email, save user
3. Return `201`

### Login (`POST /api/v1/auth/login`)
1. Validate body with `loginUserBodySchema`
2. `LoginUserService`: find user by email, compare password hash, generate tokens
3. Set `refresh_token` in httpOnly/secure/sameSite=strict cookie
4. Return `200 { access_token }`

### Token Refresh (`POST /api/v1/auth/refresh`)
1. Read `refresh_token` from cookies
2. `RefreshUserAuthService`: find token in DB, check expiry & revocation, revoke old token, generate new pair
3. Set new cookie, return `200 { access_token }`

### Logout (`POST /api/v1/auth/logout`)
1. Auth middleware validates JWT
2. `LogoutUserService`: blacklist access token in Redis (TTL = 900s), revoke refresh token in DB
3. Clear cookie, return `200`

### Logout All Devices (`POST /api/v1/auth/logout-all`)
1. Auth middleware validates JWT
2. `LogoutUserFromAllDevicesService`: blacklist access token, revoke ALL user refresh tokens
3. Clear cookie, return `200`

### Auth Middleware (in `routes.ts`)
1. Extract Bearer token from `Authorization` header
2. Check Redis blacklist → 401 if found
3. `jwt.verify(token, JWT_SECRET)` → 401 on failure
4. Proceed to handler

### Token Details
- **Access token:** JWT, HS256, 15-minute expiry, payload: `{ sub: user_id, jti: uuid }`
- **Refresh token:** 32 random bytes as hex (64 chars), stored in DB, 30-day expiry
- **Rotation:** each refresh revokes old token and issues a new one

---

## 8. Services

Each service receives its dependencies via constructor (dependency injection).

| Service | Dependencies | Responsibility |
|---|---|---|
| `CreateUserService` | `UsersRepository` | Register user |
| `LoginUserService` | `UsersRepository`, `RefreshTokensRepository` | Authenticate + issue tokens |
| `RefreshUserAuthService` | `UsersRepository`, `RefreshTokensRepository` | Rotate tokens |
| `LogoutUserService` | `RefreshTokensRepository`, `redis` | Revoke session |
| `LogoutUserFromAllDevicesService` | `RefreshTokensRepository`, `redis` | Revoke all sessions |

---

## 9. Repository Interfaces

### `UsersRepositoryInterface`
```typescript
create(data: CreateUserInput): Promise<User>
findByEmail(email: string): Promise<User | null>
findById(id: string): Promise<User | null>
```

### `RefreshTokensRepositoryInterface`
```typescript
create(data: CreateRefreshTokenInput): Promise<RefreshToken>
delete(token_id: string): Promise<void>
deleteAll(user_id: string): Promise<void>
revoke(token_id: string): Promise<void>
revokeAll(user_id: string): Promise<void>
findByToken(token: string): Promise<RefreshToken | null>
setExpiresAt(token_id: string, expires_at: Date): Promise<void>
```

---

## 10. Domain Errors

All extend `Error` with a message set in the constructor.

| Class | Message | HTTP |
|---|---|---|
| `InvalidCredentialsError` | "Invalid Credentials." | 400 |
| `InvalidPasswordLengthError` | "Password Must Contain at Least 8 Characters." | 400 |
| `UserAlreadyExistsError` | "Email Already Exists." | 409 |
| `InvalidTokenError` | "Invalid Token." | 401 |
| `TokenExpiredError` | "Expired Token." | 401 |
| `TokenRevokedError` | "Revoked Token." | 401 |
| `UnauthorizedError` | "Invalid Refresh Token." | 401 |

---

## 11. Validation Schemas (Zod)

| Schema | Used in | Validates |
|---|---|---|
| `createUserBodySchema` | createUserController | `{ email, name, password }` |
| `loginUserBodySchema` | loginUserController | `{ email, password }` |
| `refreshUserAuthCookiesSchema` | refreshUserAuthController | `{ token }` from cookies |
| `logoutUserCookiesSchema` | logout controllers | `{ refresh_token }` from cookies |
| `getAccessTokenHeaderSchema` | middleware + logout | `Authorization: Bearer <token>` → extracts token |

---

## 12. Redis Usage

**Real client:** `src/lib/redis.ts` — connects on startup  
**Test clone:** `src/tools/redisClone.ts` — in-memory, auto-expiry on `get`

**Current usage — access token blacklist:**
```typescript
// Set on logout
redis.set(access_token, "true", { expiration: { type: "EX", value: 900 } })

// Check in auth middleware
if (await redis.get(access_token)) → 401
```

---

## 13. Test Suite

**Framework:** Vitest  
**Pattern:** All tests use Memory repositories + `redisClone`. No real DB or Redis needed.

| File | Tests |
|---|---|
| `createUserService.test.ts` | password validation, hashing, duplicate email, success |
| `loginUserService.test.ts` | bad email, bad password, token generation |
| `refreshUserAuthService.test.ts` | missing token, expired, revoked, rotation, new tokens |
| `logoutUserService.test.ts` | blacklist TTL, idempotent logout, response |
| `logoutUserFromAllDevices.test.ts` | blacklist TTL, missing token error, invalid token error, revoke all |

**Run:**
```bash
npm run test           # once
npm run test:coverage  # with coverage report
```

---

## 14. Architecture Patterns

1. **Repository Pattern** — data access behind interfaces; swap DB ↔ memory freely
2. **Dependency Injection** — services receive repos via constructor, never import directly
3. **Domain Errors** — typed exceptions per failure, caught in controllers and mapped to HTTP codes
4. **Dual-Token Auth** — short-lived JWT (stateless) + long-lived refresh token (revocable)
5. **Token Rotation** — refresh always invalidates old token, prevents reuse
6. **Blacklist via Redis** — revoke access tokens before expiry on logout
7. **Schema-first validation** — Zod at every boundary (env, HTTP body, cookies, headers)
8. **In-memory test doubles** — MemoryRepository + RedisClone keep tests fast and hermetic

---

## 15. Docker Infrastructure

```yaml
# docker-compose.yml
postgres:
  image: postgres:15-alpine
  port: 5432
  credentials: docker/docker
  database: lynq-db

redis:
  image: redis:7-alpine
  port: 6379
```

**Commands:**
```bash
npm run docker-compose   # start fresh
npm run docker-start     # start existing containers
npm run migrations       # run Prisma migrations
npm run generation       # regenerate Prisma client
```

---

## 16. Known Issues / TODOs (from SUMMARY.md)

- [ ] Raise bcrypt cost factor from `6` → `10-12` for production
- [ ] Add refresh token reuse detection (reuse of revoked token = invalidate all sessions)
- [ ] Harden JWT: add `iss`, `aud` claims and validate in middleware
- [ ] Use `jti` (JWT ID) as Redis blacklist key instead of full token string
- [ ] Store decoded JWT payload on request object in middleware so controllers can read `user_id`
- [ ] Decide policy: permanently delete revoked refresh tokens or keep for audit trail
- [ ] Production error monitoring (Sentry, etc.) in global error handler

---

## 17. Path Aliases

Configured in `tsconfig.json` and `vite.config.ts`:

```
@/* → ./src/*
```

Example: `import { env } from "@/env/index.js"`

---

## 18. Scripts Reference

```bash
npm run server           # dev server with hot reload (tsx watch)
npm run test             # run all tests
npm run test:coverage    # tests + v8 coverage report
npm run docker-compose   # start Docker services
npm run migrations       # prisma migrate dev
npm run generation       # prisma generate
npm run secret           # generate random secret key
```

---

## 19. What's Been Built (Complete)

- [x] User registration with password hashing
- [x] Login with JWT + refresh token issuance
- [x] Refresh token rotation
- [x] Logout (single device, blacklist via Redis)
- [x] Logout all devices
- [x] Auth middleware (JWT verification + blacklist check)
- [x] Global error handler (Zod + domain errors + 500)
- [x] Full test coverage for all services
- [x] Docker infrastructure (PostgreSQL + Redis)
- [x] Environment validation
- [x] Repository pattern with memory doubles for tests

---

## 20. What Comes Next

### Immediate Next Step: Chat & Messages System

The `/api/v1/chats` route is already registered as a placeholder. The natural extension is:

**New DB Models needed:**
```prisma
model Chat {
  id         String    @id @default(uuid())
  created_at DateTime  @default(now())
  user_id    String
  user       User      @relation(...)
  messages   Message[]
}

model Message {
  id         String   @id @default(uuid())
  content    String
  role       String   // "user" | "assistant"
  created_at DateTime @default(now())
  chat_id    String
  chat       Chat     @relation(...)
}
```

**New routes to add:**
- `POST /api/v1/chats` — create a new chat session
- `GET /api/v1/chats` — list user's chats
- `GET /api/v1/chats/:id` — get chat with messages
- `POST /api/v1/chats/:id/messages` — send a message (triggers AI response)
- `DELETE /api/v1/chats/:id` — delete a chat

**Pattern to follow (same as auth):**
1. Interface (`CreateChat.ts`, `CreateMessage.ts`, etc.)
2. Repository interface + Database + Memory implementations
3. Service with DI (receives repos via constructor)
4. Domain errors (`ChatNotFoundError`, etc.)
5. Zod schemas for request validation
6. Controller wires it all together
7. Tests using memory repositories

**After Chat/Messages:**
- Claude API integration (send message → get AI response)
- Tool use / agent actions (Notion, Google Calendar)
- pgvector for memory/context retrieval
- OAuth 2.0 for third-party integrations
