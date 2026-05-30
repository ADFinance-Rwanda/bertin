# AI Usage

## 1. Which AI tools did you use?

- **Claude (claude-sonnet-4-6)** via Chrome

---

## 2. What parts of the assignment did you use AI for?

AI was used at certain points during development, but not as the primary driver of the project. The three areas where AI was most involved:

1. Diagnosing the `ngx-charts` vs Angular 17 compatibility issue
2. Identifying the Keycloak JWT issuer mismatch between Docker-internal and browser URLs
3. Scaffolding the standard NestJS and Angular folder structures

---

## 3. Real Prompt Examples

### Prompt 1 — Chart library conflict

**Prompt:**
```
had @swimlane/ngx-charts@20 which requires
@angular/cdk@21 but I have Angular 17. 

After downgrading to ngx-charts@19, the build fails with TS-992012: PieChartModule is not a standalone component.
What is the root cause and what is the cleanest fix? 
```

**What AI told me:**
- `ngx-charts@19` NgModules lack the Ivy metadata Angular 17's strict standalone compiler requires
- Recommended switching to Chart.js as a framework-agnostic alternative

**What I did with it:**
- Accepted the diagnosis — it matched what I was seeing
- Switched to Chart.js and rewrote the two chart components myself using `@ViewChild` canvas refs
- Extracted color constants and label maps out of the render methods (AI had these hardcoded inline)

---

### Prompt 2 — Keycloak issuer mismatch

**Prompt:**
```
Why does JWT issuer validation fail when NestJS is inside Docker but the
token was issued to a browser at localhost:6353? The backend is calling
keycloak:8080 internally. How do I fix the iss claim mismatch?
```

**What AI told me:**
- The JWT `iss` claim is stamped with the URL the browser used (`localhost:6353`)
- The backend was validating against `keycloak:8080` — these never match
- Fix: set `frontendUrl` in `realm-export.json` so Keycloak always stamps tokens with the public URL

**What I did with it:**
- Verified this was the actual cause by inspecting the JWT payload
- Added `"frontendUrl": "http://localhost:6353"` to the realm attributes in `realm-export.json`
- Confirmed the fix by testing the full login → API call flow

---

### Prompt 3 — Project structure scaffold

**Prompt:**
```
Scaffold a NestJS backend with modules for auth, tasks, analytics, and redis.
Use passport-jwt with jwks-rsa for Keycloak RS256 JWT validation.
Apply a global JwtAuthGuard with a @Public() decorator bypass for /health.
```

**What AI generated:**
- Module skeleton: `app.module.ts`, `auth.module.ts`, `jwt.strategy.ts`, `jwt-auth.guard.ts`
- Angular standalone component structure for tasks and dashboard pages

**What I changed:**
- Fixed all import paths (AI generated `../src/auth/` instead of `./auth/`)
- Added `forwardRef()` for the circular dependency between `TasksModule` ↔ `AnalyticsModule`, AI missed this entirely
- Replaced `any` types with proper interfaces (`FindOptionsWhere<Task>`, `KeycloakJwtPayload`)
- Changed `synchronize: true` to `synchronize: false` with `migrationsRun: true` auto-sync can silently drop columns in production
- Restructured the frontend structure per the provided guidlines

---

## 4. What AI-generated code did you reject or modify?

- **`any` types** throughout: replaced with typed interfaces
- **Hardcoded inline colors** in chart components — extracted to named constants
- **`console.log` in bootstrap**: replaced with NestJS `Logger`
- **`ngx-charts`**: AI's initial suggestion; switched to Chart.js after diagnosing the incompatibility myself

---

## 5. Security checks performed personally

1. **Data isolation**: reviewed every `TasksService` method to confirm all queries use `WHERE id = ? AND owner_id = ?`. A user guessing another user's task UUID gets a 404, not a 403.
2. **JWT issuer validation**: traced the full token path and fixed the Docker-internal vs public URL mismatch.
3. **Redis failure safety**: confirmed the API continues working when Redis is down, falling back to direct PostgreSQL queries.
4. **Input validation**: `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })` applied globally.
5. **No SQL injection**: all queries use TypeORM parameterized builders, no string interpolation in WHERE clauses.
---

## 6. What would you improve with one more day?

1. **Automated tests**: Jest unit tests for `TasksService`, integration tests for cache invalidation
2. **Token refresh**: implement `keycloak.updateToken()` in the auth interceptor so expired tokens refresh silently
3. **Role-based UI**: gate admin features using `JwtUser.roles` already in the JWT payload
4. **Redis SCAN**: replace `redis.keys(pattern)` with cursor-based `SCAN` to avoid blocking at scale
5. **Runtime Angular config**: replace build-time `environment.ts` with a `config.json` fetched at container start
