# Project Summary - Issues and Strengths

# Auth Flow — Strengths

## Architecture & Design

- **Dependency Injection throughout** — every service receives its repositories via constructor. `CreateUserService`, `LoginUserService`, `LogoutUserService`, and `RefreshUserAuthService` all follow this, enabling unit tests without a real database.
- **Repository abstraction via interfaces** — services depend on `UsersRepositoryInterface` and `RefreshTokensRepositoryInterface`, not concrete implementations. Swapping Prisma or using in-memory repos for tests requires zero changes to service code.
- **Dedicated domain error classes** — each failure mode has its own typed error (`InvalidCredentialsError`, `TokenExpiredError`, `TokenRevokedError`, etc.), letting HTTP handlers map errors to status codes precisely.

## Security

- **Constant-time password comparison** — `loginUserService` uses `bcrypt.compare`, resistant to timing attacks. Throwing the same `InvalidCredentialsError` for both "user not found" and "wrong password" prevents user enumeration.
- **Dual-token auth pattern implemented correctly** — access tokens are short-lived JWTs (15 min), refresh tokens are cryptographically random 32-byte hex strings stored in the DB. JWTs are stateless and fast to verify; refresh tokens are stateful and revocable.
- **Token rotation on every refresh** — `refreshUserAuthService` deletes the old token before issuing a new one. A stolen refresh token can only be used once.
- **Access token blacklisting on logout** — `logoutUserService` stores the raw JWT in Redis with a 900-second TTL (matching the 15 min access token lifetime), closing the gap between logout and token expiry.
- **Idempotent logout** — if the refresh token is already gone, `logoutUserService` still blacklists the access token and returns cleanly rather than erroring.

## Code Quality

- **`generateTokens` is a pure utility function** — no side effects, takes explicit parameters, easily unit-testable independently from services.
- **Thin service layer** — each service has a single responsibility. `createUserService` validates and hashes; `loginUserService` authenticates and issues tokens; `logoutUserService` handles invalidation. Clear boundaries throughout.

# Auth Flow — Issues

## Security

- [X] **Raise bcrypt cost factor** — currently `6` in `src/services/createUserService.ts:20`. Use `10`–`12` for production.
- [X] **Add refresh-token reuse detection** — when `refreshUserAuthService` receives an unknown/already-rotated token for a user, revoke all of that user's refresh tokens (session-wide invalidation) instead of only returning 401.
- [X] **Harden JWT claims** — `src/lib/generateTokens.ts` signs only `{ id }`. Add `sub`, `iss`, `aud` (and optionally `jti`) and enforce them in `jwt.verify` options at `src/http/routes.ts:38`.

## Correctness / dead code

- [ ] **Unused `revoked` column** — `prisma/schema.prisma:25` defines `revoked`, and `refreshUserAuthService.ts:31` checks it, but rotation deletes rows instead of flagging them. Decide: either switch rotation to set `revoked = true` (keeping audit trail) or drop the column and the check.
- [ ] **Attach decoded JWT payload to `req`** — the `preHandler` in `src/http/routes.ts:26` calls `jwt.verify` but discards the result. Store `user_id` on `req` (e.g. `req.user`) so downstream handlers don't re-parse the token.

## API / ergonomics

- [ ] **Review logout payload** — `logoutUserService` requires `refresh_token` in the body in addition to the access-token header. Confirm this is intentional; otherwise derive the refresh token server-side or make it optional.
- [ ] **Use `jti` as Redis blacklist key** — `src/services/logoutUserService.ts:15` blacklists the raw JWT string. Switch to a `jti` claim to keep keys short and uniform.
