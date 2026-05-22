# TopCV Team 2 — Design Spec

Date: 2026-05-22
Status: Approved (pending written-spec review)
Owner: Team 2

## 0. Scope & Deliverables

Two deliverables:

1. **MVP Demo** — a working web product (real code, not Figma) covering all 4 user groups: students, technical workers, general/manual workers, office workers. Bundled into 2 adaptive UX modes:
   - **Mode "Văn phòng"** — students + office workers (CV-centric UX, Ghost Mode, 1-Click Apply, Live Tracking)
   - **Mode "Lao động"** — technical + general workers (voice/photo/location-first UX, Trust badges, anti-scam)
2. **1-year Growth Marketing Plan** — focused on **Group B = Lao động kỹ thuật/phổ thông ở Tỉnh** (provincial technical/general labor). Reasoning: supply-constrained, recruiter-pays-premium dynamic, underserved by Cake/TopCV mobile-first patterns.

### Hero features
- **AI Matching 2-way with explanation** (candidate ↔ job, both sides see "why this match")
- **Anti-scam Trust layer** (job/company verification, scam_flags, trust_level)
- Office sub-heroes: **Ghost Mode**, **1-Click Apply**, **Live Tracking** (Shopee-style)
- Labor sub-heroes: **Voice/photo onboarding**, **Geo-first feed**, **Trust badges**

### Approach
Approach 2 — Full Loop. Both candidate side and recruiter side are functional in the demo.

### Platform
Web responsive, mobile-first layout. Native mobile app deferred to post-MVP. No PWA scope in this MVP.

---

## 1. Architecture

Split deployment: **Backend (Spring Boot) + Frontend (Next.js)**. No BFF, no monorepo tooling. Two repos-as-folders inside this working tree:

```
TopCV_Team_2/
├── backend/                  # Spring Boot 3.4.x, Java 21, Maven (pom.xml)
├── frontend/                 # Next.js 15 App Router, TypeScript, pnpm
├── docs/
│   ├── research/             # team spreadsheet extracts, idea-van-phong, etc.
│   ├── superpowers/specs/    # this spec
│   └── growth-plan/          # deliverable #2 (1-year plan for Group B)
└── README.md
```

### Stack — Backend

| Concern | Choice |
|---|---|
| Language / Runtime | Java 21 (JDK at `C:/Program Files/Java/jdk-21.0.11`) |
| Framework | Spring Boot 3.4.x |
| Build | **Maven** (`pom.xml`) |
| Persistence | Spring Data JPA + Hibernate 6 |
| Migrations | Flyway |
| DB | PostgreSQL 16 + `pgvector` extension |
| Auth | Spring Security + OAuth2 Resource Server (JWT) |
| Realtime | Spring WebSocket + STOMP |
| API Docs | springdoc-openapi |
| Rate limiting | Bucket4j |
| Cache | Spring Data Redis |
| AOP | Spring AOP (audit, ghost-mode aspect) |
| Validation | Jakarta Bean Validation (Hibernate Validator) |
| Test | JUnit 5, Mockito, Testcontainers (real Postgres, **not H2**), MockMvc, WireMock |
| Container | Dockerfile + docker-compose for local Postgres + Redis |

### Stack — Frontend

| Concern | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| Package mgr | pnpm |
| UI | Tailwind CSS + shadcn/ui |
| Forms | react-hook-form + Zod |
| Data fetch | TanStack Query (REST against Spring) |
| Realtime client | `@stomp/stompjs` over SockJS |
| Auth client | Cookie-based (HttpOnly+Secure+SameSite=Lax JWT set by backend) |
| AI client adapters | OpenAI (embeddings), Gemini Vision (OCR), Web Speech API (vi-VN) |
| Test | Vitest + React Testing Library + MSW; Playwright for E2E |

### High-level diagram

```
┌──────────────┐    HTTPS/REST       ┌────────────────┐    JDBC      ┌────────────┐
│  Next.js     │ ───────────────────▶│  Spring Boot   │─────────────▶│ Postgres   │
│  (frontend)  │ ◀── STOMP/WebSocket │  (backend)     │              │ + pgvector │
└──────┬───────┘                     └───────┬────────┘              └────────────┘
       │                                     │
       │ Web Speech / camera                 │ Embeddings + OCR + LLM
       ▼                                     ▼
   Browser APIs                       OpenAI / Gemini APIs
                                             │
                                             ▼
                                          Redis (cache, rate-limit, sessions)
```

---

## 2. Components

### 2.1 Frontend modules (`frontend/src/`)

```
frontend/src/
├── app/
│   ├── (public)/                 # landing, mode picker
│   ├── (vanphong)/               # office/student mode routes
│   │   ├── feed/                 # job feed (CV-aware)
│   │   ├── jobs/[id]/
│   │   ├── apply/[jobId]/        # 1-click apply
│   │   ├── tracking/             # live tracking dashboard
│   │   ├── ghost/                # ghost-mode controls
│   │   └── profile/
│   ├── (laodong)/                # technical/general labor mode
│   │   ├── onboard/voice/        # voice onboarding
│   │   ├── onboard/photo/        # photo CV/cert OCR
│   │   ├── feed/                 # geo-first feed
│   │   ├── jobs/[id]/
│   │   └── trust/                # trust badge display
│   ├── recruiter/                # employer side (full loop)
│   │   ├── jobs/                 # CRUD jobs
│   │   ├── pipeline/             # applicants kanban
│   │   └── company/              # company profile + verification
│   └── api/                      # only thin Next handlers (auth-cookie helpers, sse proxy if needed)
├── components/
│   ├── ui/                       # shadcn primitives
│   ├── matching/                 # MatchCard, ExplainBadge
│   ├── trust/                    # TrustBadge, ScamFlag
│   ├── ghost/                    # GhostToggle, BlocklistEditor
│   ├── tracking/                 # TrackingTimeline (Shopee-style)
│   └── voice/                    # VoiceRecorder, OcrPreview
├── lib/
│   ├── api/                      # typed REST client (zod-validated)
│   ├── ws/                       # STOMP client wrapper + polling fallback
│   ├── auth/                     # cookie helpers, redirect guards
│   └── flags.ts                  # NEXT_PUBLIC_USE_MOCK_AI etc.
└── styles/
```

### 2.2 Backend packages (`backend/src/main/java/vn/topcv/api/`)

```
vn.topcv.api/
├── TopcvApiApplication.java
├── config/                       # SecurityConfig, WebSocketConfig, OpenApiConfig, RedisConfig, CorsConfig
├── common/
│   ├── audit/                    # BaseEntity, AuditingEntityListener config, AuditorAware
│   ├── exception/                # GlobalExceptionHandler (RFC 7807 ProblemDetail)
│   ├── ratelimit/                # Bucket4j filter
│   └── filter/                   # GhostModeFilterAspect (Hibernate @FilterDef bridge)
├── auth/                         # AuthController, JwtService, CookieJwtFilter
├── users/                        # User, CandidateProfile entities/services
├── companies/                    # Company entity + verification
├── jobs/                         # Job CRUD, JobSearchService (pgvector kNN)
├── applications/                 # Application + status events (drives Live Tracking)
├── ghost/                        # GhostBlock entity + Ghost service
├── matching/                     # MatchingService (2-way, with explanation)
├── trust/                        # TrustService (scam_flags, trust_level scoring)
├── ai/
│   ├── embedding/                # OpenAI embeddings client (WireMock-able)
│   ├── ocr/                      # Gemini Vision client
│   └── llm/                      # explanation + extraction (Bean-Validation + Zod-mirrored DTOs)
└── realtime/                     # STOMP destinations: /topic/applications/{id}
```

### 2.3 AI Service Layer

A single `AiOrchestrator` facade in `backend/.../ai/` exposing:

- `embedJobOrProfile(text) -> float[1536]`
- `ocrCv(file) -> StructuredCv` (validated against `CvDto` with Bean Validation; FE re-validates with mirrored Zod schema)
- `explainMatch(profile, job) -> {score, reasons[]}` (LLM, prompt-injection-safe template, see §4.5)
- All external calls go through Spring `RestClient` with WireMock recordings for tests; kill-switched by env vars when AI provider is down.

### 2.4 Trust Service

Scores companies + jobs into `trust_level ENUM('UNVERIFIED','BASIC','VERIFIED','PREMIUM')` and accumulates `scam_flags TEXT[]` from rule-based detectors:

- Salary outlier detector (job pays >3× p95 of similar title/location)
- Suspicious wording (bag of red-flag phrases — "no skill needed earn 50M", etc.)
- New domain / unverified company / repeated reposts
- Manual moderator flag

Surfaces in the FE as `TrustBadge` and inline `ScamFlag` callouts on every Job card and detail page.

---

## 3. Data Flow & Database Schema

### 3.1 Three core flows

**A. Labor onboarding (voice + photo)**
1. FE captures voice (Web Speech API, vi-VN) → transcript → POST `/api/onboard/voice` → BE LLM extracts skills/experience → returns `CandidateProfile` draft.
2. FE captures photo of CV/cert → POST multipart `/api/onboard/photo` → BE Gemini Vision OCR → merges with profile draft.
3. User confirms → BE persists profile + computes embedding → indexed in pgvector.

**B. Office feed with Ghost Mode**
1. FE GET `/api/feed?mode=vanphong` with cookie JWT.
2. BE: Hibernate `@Filter("ghost")` enabled per session → excludes companies that the candidate's `ghost_blocks` list resolves to. The filter is enforced at SQL level so no controller can accidentally bypass.
3. Matching scores computed via pgvector kNN against profile embedding; top N returned with `match_explanation` from LLM.
4. Trust info attached server-side (never client-derived).

**C. 1-Click Apply with Live Tracking**
1. FE swipe/click → POST `/api/applications` `{jobId}`. BE creates `application` + initial `application_event` (status=SUBMITTED).
2. Recruiter actions (`VIEWED`, `SHORTLISTED`, `INTERVIEW`, `REJECTED`, `OFFER`) write new `application_event` rows.
3. BE publishes to STOMP `/topic/applications/{id}` on each event. FE subscribes and renders Shopee-style timeline. Polling fallback every 8s if WS connect fails twice.

### 3.2 Audit base entity (every table)

Hard requirement: every domain table carries the **full audit base** below. Implemented as a JPA `@MappedSuperclass`:

```java
// backend/.../common/audit/BaseEntity.java
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseEntity {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @CreatedDate  @Column(nullable=false, updatable=false)
    private OffsetDateTime createdAt;
    @CreatedBy    @Column(updatable=false)
    private UUID createdBy;

    @LastModifiedDate @Column(nullable=false)
    private OffsetDateTime updatedAt;
    @LastModifiedBy
    private UUID updatedBy;

    private OffsetDateTime deletedAt;
    private UUID deletedBy;
}
```

`AuditorAware<UUID>` resolves `created_by` / `updated_by` from the JWT principal. Soft delete: every read query goes through `@Where(clause = "deleted_at IS NULL")` + a `@SQLDelete` annotation per entity.

### 3.3 Schema (Flyway `V1__init.sql`)

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS vector;

-- Reusable column block (applied to every table below):
--   id           uuid PK DEFAULT gen_random_uuid()
--   created_at   timestamptz NOT NULL DEFAULT NOW()
--   created_by   uuid
--   updated_at   timestamptz NOT NULL DEFAULT NOW()
--   updated_by   uuid
--   deleted_at   timestamptz
--   deleted_by   uuid

CREATE TYPE user_role     AS ENUM ('CANDIDATE','RECRUITER','ADMIN');
CREATE TYPE ux_mode       AS ENUM ('VANPHONG','LAODONG');
CREATE TYPE trust_level_t AS ENUM ('UNVERIFIED','BASIC','VERIFIED','PREMIUM');
CREATE TYPE app_status    AS ENUM ('SUBMITTED','VIEWED','SHORTLISTED','INTERVIEW','OFFER','REJECTED','WITHDRAWN');

CREATE TABLE users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email           citext UNIQUE,
    phone           text   UNIQUE,
    password_hash   text NOT NULL,
    role            user_role NOT NULL DEFAULT 'CANDIDATE',
    preferred_mode  ux_mode,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    created_by uuid,
    updated_at timestamptz NOT NULL DEFAULT NOW(),
    updated_by uuid,
    deleted_at timestamptz,
    deleted_by uuid
);
CREATE UNIQUE INDEX users_email_active_uk ON users(email) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX users_phone_active_uk ON users(phone) WHERE deleted_at IS NULL;

CREATE TABLE companies (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name             text NOT NULL,
    domain           text,
    tax_code         text,
    trust_level      trust_level_t NOT NULL DEFAULT 'UNVERIFIED',
    scam_flags       text[] NOT NULL DEFAULT '{}',
    description      text,
    embedding        vector(1536),
    created_at timestamptz NOT NULL DEFAULT NOW(), created_by uuid,
    updated_at timestamptz NOT NULL DEFAULT NOW(), updated_by uuid,
    deleted_at timestamptz, deleted_by uuid
);
CREATE INDEX companies_emb_ivf ON companies USING ivfflat (embedding vector_cosine_ops) WITH (lists=100);

CREATE TABLE candidate_profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id),
    full_name text,
    headline  text,
    skills    text[] NOT NULL DEFAULT '{}',
    years_exp numeric(4,1),
    location_province text,
    geo_point  point,
    salary_min_vnd bigint,
    salary_max_vnd bigint,
    cv_raw_text text,
    embedding   vector(1536),
    created_at timestamptz NOT NULL DEFAULT NOW(), created_by uuid,
    updated_at timestamptz NOT NULL DEFAULT NOW(), updated_by uuid,
    deleted_at timestamptz, deleted_by uuid
);
CREATE UNIQUE INDEX cand_profile_user_uk ON candidate_profiles(user_id) WHERE deleted_at IS NULL;
CREATE INDEX cand_emb_ivf ON candidate_profiles USING ivfflat (embedding vector_cosine_ops) WITH (lists=100);

CREATE TABLE jobs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id),
    title text NOT NULL,
    mode  ux_mode NOT NULL,
    location_province text,
    geo_point  point,
    salary_min_vnd bigint,
    salary_max_vnd bigint,
    salary_is_net  boolean,
    work_arrangement text,             -- ONSITE / HYBRID / REMOTE
    description_raw  text NOT NULL,
    requirements     text[] NOT NULL DEFAULT '{}',
    trust_level      trust_level_t NOT NULL DEFAULT 'UNVERIFIED',
    scam_flags       text[] NOT NULL DEFAULT '{}',
    embedding        vector(1536),
    published_at     timestamptz,
    created_at timestamptz NOT NULL DEFAULT NOW(), created_by uuid,
    updated_at timestamptz NOT NULL DEFAULT NOW(), updated_by uuid,
    deleted_at timestamptz, deleted_by uuid
);
CREATE INDEX jobs_emb_ivf ON jobs USING ivfflat (embedding vector_cosine_ops) WITH (lists=100);
CREATE INDEX jobs_mode_province_idx ON jobs(mode, location_province) WHERE deleted_at IS NULL;

CREATE TABLE applications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id uuid NOT NULL REFERENCES users(id),
    job_id       uuid NOT NULL REFERENCES jobs(id),
    status       app_status NOT NULL DEFAULT 'SUBMITTED',
    match_score  numeric(5,4),
    match_reasons jsonb,
    created_at timestamptz NOT NULL DEFAULT NOW(), created_by uuid,
    updated_at timestamptz NOT NULL DEFAULT NOW(), updated_by uuid,
    deleted_at timestamptz, deleted_by uuid
);
CREATE UNIQUE INDEX applications_unique_active ON applications(candidate_id, job_id) WHERE deleted_at IS NULL;

CREATE TABLE application_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id uuid NOT NULL REFERENCES applications(id),
    status app_status NOT NULL,
    note text,
    created_at timestamptz NOT NULL DEFAULT NOW(), created_by uuid,
    updated_at timestamptz NOT NULL DEFAULT NOW(), updated_by uuid,
    deleted_at timestamptz, deleted_by uuid
);
CREATE INDEX app_events_app_idx ON application_events(application_id, created_at);

CREATE TABLE ghost_blocks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id uuid NOT NULL REFERENCES users(id),
    blocked_company_id uuid REFERENCES companies(id),
    blocked_domain text,                  -- catch-all when company not yet in DB
    reason text,
    created_at timestamptz NOT NULL DEFAULT NOW(), created_by uuid,
    updated_at timestamptz NOT NULL DEFAULT NOW(), updated_by uuid,
    deleted_at timestamptz, deleted_by uuid,
    CHECK (blocked_company_id IS NOT NULL OR blocked_domain IS NOT NULL)
);
CREATE INDEX ghost_blocks_cand_idx ON ghost_blocks(candidate_id) WHERE deleted_at IS NULL;

CREATE TABLE audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_user_id uuid,
    action text NOT NULL,                 -- e.g. APPLICATION_CREATE, GHOST_TOGGLE
    entity_type text,
    entity_id uuid,
    payload jsonb,
    ip inet,
    user_agent text,
    created_at timestamptz NOT NULL DEFAULT NOW(), created_by uuid,
    updated_at timestamptz NOT NULL DEFAULT NOW(), updated_by uuid,
    deleted_at timestamptz, deleted_by uuid
);
CREATE INDEX audit_logs_actor_time_idx ON audit_logs(actor_user_id, created_at DESC);
```

`AuditorAware` populates `created_by` / `updated_by` from the JWT principal `sub` claim.

---

## 4. Error Handling

### 4.1 Failure modes & fallbacks

| Failure | Fallback |
|---|---|
| OpenAI embeddings down | `MockEmbeddingService` returns deterministic hash-based vector; demo continues with degraded match quality. Toggle via `NEXT_PUBLIC_USE_MOCK_AI=true` (FE) and `app.ai.embeddings.mock=true` (BE). |
| Gemini Vision OCR down | `NEXT_PUBLIC_USE_MOCK_OCR=true` returns canned StructuredCv from a fixture; FE shows banner "OCR đang bảo trì — bạn có thể tự nhập". |
| Web Speech API unavailable / unsupported browser | `NEXT_PUBLIC_DISABLE_VOICE=true` hides voice button; falls back to typed input. Auto-detected via feature check too. |
| WebSocket connection fails twice | FE STOMP wrapper switches to HTTP polling `/api/applications/{id}/events` every 8s. |
| LLM explanation fails | Drop the explanation text but still return numeric `match_score`; FE renders "Không có lý do chi tiết — match dựa trên kỹ năng." |
| Postgres down | Spring health `DOWN` → 503 from gateway; FE shows retry screen. |

### 4.2 Error response contract

All BE errors emit RFC 7807 `application/problem+json`:

```json
{
  "type": "https://topcv.vn/errors/validation",
  "title": "Validation failed",
  "status": 400,
  "detail": "salary_min_vnd must be >= 0",
  "instance": "/api/jobs",
  "errors": [{ "field": "salary_min_vnd", "message": "must be >= 0" }],
  "traceId": "..."
}
```

`@RestControllerAdvice` maps Bean-Validation, `EntityNotFound`, `AccessDenied`, `OptimisticLock`, and AI client exceptions into stable problem types. FE typed client maps `type` URI to local error UI. Stack traces never leak to clients; logged server-side with `traceId`.

### 4.3 Demo kill-switches (env vars)

```
# frontend/.env.local
NEXT_PUBLIC_API_BASE_URL=
NEXT_PUBLIC_WS_URL=
NEXT_PUBLIC_USE_MOCK_AI=false
NEXT_PUBLIC_USE_MOCK_OCR=false
NEXT_PUBLIC_DISABLE_VOICE=false

# backend/src/main/resources/application.yml (driven by env)
app:
  ai:
    embeddings.mock: ${AI_EMBEDDINGS_MOCK:false}
    ocr.mock:        ${AI_OCR_MOCK:false}
    llm.mock:        ${AI_LLM_MOCK:false}
```

---

## 4.5 Security

10 threats, ranked. All P0 must have automated regression tests before demo.

| ID | Threat | Sev | Mitigation |
|---|---|---|---|
| T1 | Ghost Mode bypass — controller forgets filter, employer sees blocked candidate / blocked company surfaces in feed | **P0** | Hibernate `@FilterDef("ghost")` on `Job`/`Company`/`CandidateProfile` reads. AOP `@Around` aspect that **enables the filter on every `@CandidateScoped` request** based on the JWT principal. Integration test: login as candidate with ghost block on company X → assert `/api/feed` never includes any job from X across pagination. |
| T2 | JWT theft via XSS | **P0** | JWT stored only in **HttpOnly + Secure + SameSite=Lax** cookie set by BE. Never written to `localStorage`/`sessionStorage`. CSP header restricts script sources. Refresh-token rotation on each refresh. |
| T3 | IDOR on `/api/applications/{id}`, `/api/jobs/{id}/applicants` | **P0** | Per-endpoint `@PreAuthorize("@authz.canRead(#id, principal)")` checks ownership; default-deny. Repository queries always include the principal scope (e.g. `candidate_id = :me`). |
| T4 | Prompt injection in job/CV text → exfiltrates other prompts | **P1** | LLM calls use a fixed system prompt + user content quoted in a fenced delimiter; output is parsed against a Zod/Bean-Validation schema and rejected if it doesn't match. Prohibited tokens (`</system>`, "ignore previous") stripped pre-call. |
| T5 | Scam jobs reach candidates | **P0** | Trust Service detectors run on every job upsert; jobs scored `UNVERIFIED` or with any `scam_flags` are rendered with a warning banner and demoted in match ranking. Recruiters with repeated flags are auto-suspended pending review. |
| T6 | Malicious file upload (CV/cert image) | **P1** | Direct-to-S3 (or local) **presigned URL** flow; BE never reads bytes inline. MIME sniff + magic-number check + max 8 MB; image-only types accepted; file is virus-scanned (`clamd` sidecar in compose); served from a separate read-only bucket, never executed. |
| T7 | Brute force on login / OTP | **P1** | Bucket4j: 5 attempts / 15 min / IP+username; exponential backoff; CAPTCHA after 3 failures; account lockout audit-logged. |
| T8 | CORS / CSRF | **P1** | Strict CORS allowlist (`FRONTEND_ORIGIN` env). Cookies `SameSite=Lax`; mutating endpoints require either `Authorization` header **or** double-submit CSRF token for cookie-only callers. |
| T9 | Secrets leak in repo / logs | **P0** | All secrets via env vars, never committed; `.gitignore` covers `.env*`, `application-local.yml`, `target/`, `node_modules/`, `.next/`. Logback masking pattern for `password`, `token`, `jwt`, `cookie`, email/phone. Pre-commit hook (gitleaks) recommended. |
| T10 | PII over-exposure (recruiter sees full phone/email of every viewer) | **P1** | DTO projections strip phone/email until candidate reaches `SHORTLISTED`. Unmasking action is audit-logged. |

### Cross-cutting controls
- Security headers: `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Strict-Transport-Security`, `X-Frame-Options: DENY`.
- All write endpoints write to `audit_logs` (actor, action, entity, payload diff, ip, ua).
- Passwords: BCrypt (cost 12).
- Timing-safe comparison for tokens.
- Secrets management: `.env` for local, env vars in deploy; never log full request bodies on auth endpoints.

---

## 5. Testing

### 5.1 Backend
- **Unit:** JUnit 5 + Mockito for services (Matching, Trust, Ghost, Auth).
- **Web layer:** MockMvc for controllers + `@WebMvcTest` slices.
- **Persistence:** `@DataJpaTest` against **Testcontainers Postgres 16 + pgvector**, never H2.
- **External AI:** WireMock for OpenAI/Gemini; recordings checked in under `backend/src/test/resources/wiremock/`.
- **Security regression suite (mandatory P0):**
  - `GhostModeFilterIT` — ghost block hides target across feed, search, and recruiter views.
  - `IdorApplicationsIT` — candidate A cannot read candidate B's application.
  - `CookieJwtSecurityIT` — JWT cookie is `HttpOnly; Secure; SameSite=Lax`; not reflected in any response body.
  - `ScamDetectionIT` — known-bad fixture jobs receive expected `scam_flags`.

### 5.2 Frontend
- **Unit:** Vitest + RTL for components (MatchCard, GhostToggle, TrackingTimeline).
- **Network:** MSW handlers mirror BE OpenAPI; types generated from springdoc.
- **E2E (Playwright) — 10 critical journeys:**
  1. Office candidate — sign up → CV upload → feed → ghost-toggle on current employer → verify employer absent.
  2. Office candidate — 1-click apply → see live tracking event update via WS.
  3. Labor candidate — voice onboarding (mocked transcript) → photo OCR (mocked) → profile saved.
  4. Labor candidate — geo feed → trust badge visible → scam-flagged job shows banner.
  5. Recruiter — create job → see trust score → publish.
  6. Recruiter — review applicants pipeline → move stage → candidate sees update.
  7. Auth — login wrong-password 5× triggers rate-limit/CAPTCHA.
  8. Security — attempt to read another candidate's application via direct URL → 403.
  9. Resilience — kill backend WS → FE falls back to polling; UI still updates.
  10. AI fallback — `NEXT_PUBLIC_USE_MOCK_AI=true` → product still demos end-to-end.

### 5.3 CI gates
- BE: `mvn verify` (compile + unit + integration with Testcontainers) + Spotless format check.
- FE: `pnpm lint && pnpm typecheck && pnpm test && pnpm exec playwright test`.
- Both must pass before merge.

---

## 6. Project Initialization Parameters

### 6.1 Backend — `spring init` (Maven)

```
spring init \
  --build=maven \
  --java-version=21 \
  --boot-version=3.4.0 \
  --type=maven-project \
  --packaging=jar \
  --group-id=vn.topcv \
  --artifact-id=topcv-api \
  --name=topcv-api \
  --package-name=vn.topcv.api \
  --description="TopCV Team 2 backend API" \
  --dependencies=web,security,oauth2-resource-server,validation,data-jpa,postgresql,flyway,data-redis,websocket,actuator,configuration-processor,devtools,lombok,testcontainers \
  backend
```

Then add manually to `pom.xml`:
- `org.springdoc:springdoc-openapi-starter-webmvc-ui:2.6.0`
- `com.bucket4j:bucket4j-core:8.10.1`
- `com.pgvector:pgvector:0.1.6`
- `org.testcontainers:postgresql` (test scope)
- `com.github.tomakehurst:wiremock-standalone:3.9.1` (test scope)

### 6.2 Frontend — `create-next-app`

```
pnpm create next-app frontend \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --use-pnpm
```

Then `pnpm add`:
- `@tanstack/react-query` `@tanstack/react-query-devtools`
- `react-hook-form` `zod` `@hookform/resolvers`
- `@stomp/stompjs` `sockjs-client`
- `lucide-react` `class-variance-authority` `clsx` `tailwind-merge`
- shadcn/ui via `pnpm dlx shadcn@latest init`

Dev: `vitest` `@testing-library/react` `@testing-library/jest-dom` `msw` `@playwright/test`.

### 6.3 `.gitignore` (root + per-project)

Root:
```
.env
.env.*
!.env.example
.idea/
.vscode/
*.log
.DS_Store
```

`backend/.gitignore`:
```
target/
!**/src/main/**/target/
!**/src/test/**/target/
.mvn/wrapper/maven-wrapper.jar
.classpath
.project
.settings/
.springBeans
HELP.md
*.iml
out/
application-local.yml
```

`frontend/.gitignore`:
```
node_modules/
.next/
out/
.env*.local
coverage/
playwright-report/
test-results/
.turbo/
```

---

## 7. Out of Scope (MVP)

- Native mobile app (iOS/Android) — placeholder only.
- Payments / subscription billing.
- Real SMS OTP integration (mocked).
- Real virus-scan deployment (architecture present, daemon optional locally).
- I18n beyond Vietnamese.
- Multi-tenant company hierarchies.

---

## 8. Open follow-ups (post spec approval)

- **Deliverable #2 — Growth Plan for Group B**: separate brainstorming pass. Will land in `docs/growth-plan/2026-05-22-group-b-1y-plan.md`. Not blocked by MVP build.
- WireMock recordings for live AI providers — capture during first integration spike.
- Decide whether to host Postgres locally via docker-compose or use a managed dev instance for the demo machine.
