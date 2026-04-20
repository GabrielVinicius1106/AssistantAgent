# Auth Flow — Issues TODO

## Security

- [ ] **Raise bcrypt cost factor** — currently `6` in `src/services/createUserService.ts:20`. Use `10`–`12` for production.
- [ ] **Add refresh-token reuse detection** — when `refreshUserAuthService` receives an unknown/already-rotated token for a user, revoke all of that user's refresh tokens (session-wide invalidation) instead of only returning 401.
- [ ] **Harden JWT claims** — `src/lib/generateTokens.ts` signs only `{ id }`. Add `sub`, `iss`, `aud` (and optionally `jti`) and enforce them in `jwt.verify` options at `src/http/routes.ts:38`.

## Correctness / dead code

- [ ] **Unused `revoked` column** — `prisma/schema.prisma:25` defines `revoked`, and `refreshUserAuthService.ts:31` checks it, but rotation deletes rows instead of flagging them. Decide: either switch rotation to set `revoked = true` (keeping audit trail) or drop the column and the check.
- [ ] **Attach decoded JWT payload to `req`** — the `preHandler` in `src/http/routes.ts:26` calls `jwt.verify` but discards the result. Store `user_id` on `req` (e.g. `req.user`) so downstream handlers don't re-parse the token.

## API / ergonomics

- [ ] **Review logout payload** — `logoutUserService` requires `refresh_token` in the body in addition to the access-token header. Confirm this is intentional; otherwise derive the refresh token server-side or make it optional.
- [ ] **Use `jti` as Redis blacklist key** — `src/services/logoutUserService.ts:15` blacklists the raw JWT string. Switch to a `jti` claim to keep keys short and uniform.
