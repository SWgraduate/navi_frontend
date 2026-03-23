# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Rules

- 코드를 작성하거나 수정하기 전에, 해당 디렉토리 또는 상위 디렉토리에 `README.md`가 있으면 반드시 먼저 읽고 내용을 반영한다.

## Commands

```bash
# Development
npm run dev              # Start dev server (localhost:3000)
npm run dev:network      # Start dev server accessible on LAN (for mobile testing)
npm run tunnel           # Expose local server via localtunnel (mobile testing)

# Build & production
npm run build
npm run start

# Lint
npm run lint
```

No test suite is configured.

## Architecture

**Navi** is a mobile-first PWA for Hanyang University students, built with Next.js 16 App Router, React 19, TypeScript, and Tailwind CSS v4.

### App Router structure

```
app/
  layout.tsx          # Root layout: wraps everything in I18nProvider + ChatProvider + LayoutContent
  splash/             # Splash screen (checks auth, redirects to /home or /login)
  login/
  signup/             # Multi-step: terms → email → verify → name → password → complete → welcome
  home/               # Main chat page
  speak/              # Voice input page
  graduation/         # Graduation requirements checker (upload → processing → result)
  history/            # Chat history
  my/                 # Profile/settings (personal info, language, terms)
```

### Global layout (`components/layout/layout-content.tsx`)

The `LayoutContent` component is the shell for all pages. It handles:
- Rendering `AppHeader` with per-route titles (defined in `HEADER_TITLE_KEYS` map)
- Rendering `BottomBar` only on `/home`, `/graduation`, `/my` routes
- Rendering `ChatInput` (floating, above keyboard on mobile)
- Mobile virtual keyboard detection and layout adjustment (see `docs/keyboard-handling.md`)
- View Transitions API for page navigation

### State management

- **Chat state**: `contexts/chat-context.tsx` — `ChatProvider` wraps the app, exposes `messages`, `isLoading`, `sendMessage`, `startNewChat` via `useChat()` hook. Uses async task polling (see API section).
- **Auth state**: `lib/auth-storage.ts` — localStorage key `navi_logged_in`. Mock credentials in `lib/mock-accounts.ts` (real auth API is wired in `lib/api/auth.ts` but signup/login pages still use mock matching).
- **Language/i18n**: `contexts/i18n-context.tsx` + `lib/i18n-storage.ts` — localStorage key `navi_language`. Exposes `language` and `setLanguage()` via `useI18n()` hook. Supports ko, en, zh.
- **Graduation result**: localStorage key `navi_graduation_result` via helpers in `lib/mock-accounts.ts`.
- **Chat history pins**: `lib/history-storage.ts` — localStorage key `navi_history_pins`.
- **Signup flow state**: `sessionStorage` (email, verification flags — cleared after flow).

### API layer

All HTTP calls go through `lib/api/client.ts` → `apiFetch<T>()`:
- Adds `Content-Type: application/json` and `Authorization: Bearer <token>`
- JWT accessToken은 localStorage `navi_access_token`에서 읽어 헤더에 자동 포함
- Base URL from env var `NEXT_PUBLIC_API_URL`
- Throws `Error` on non-OK responses

Endpoint modules in `lib/api/`:
- `auth.ts` — register, login, logout, leave, sendAuthEmail, verifyAuthEmail
- `chat.ts` — sendChatQuery, getChatStatus (async task polling)
- `student.ts` — profile CRUD, academic record CRUD, image parsing
- `rag.ts` — PDF upload via raw `fetch` + `FormData` (not `apiFetch`, since multipart)

**Chat async task pattern**: `POST /chat` returns `{ taskId }` → poll `GET /chat/status/{taskId}` every `POLL_INTERVAL_MS = 1500ms`, up to `MAX_POLL_ATTEMPTS = 60` (90 seconds). Check `status.message || status.result || status.answer` for completion.

### Environment variables

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL (accessible in browser) |

### Internationalization (i18n)

- **i18next**: Configured in `lib/i18n/index.ts` with `react-i18next`
- **Translations**: `lib/i18n/locales/{ko,en,zh}.json`
- **Usage**: `const { t } = useI18n(); t("key.path")` in components. For academic options, use `lib/academic-options.ts` which loads translated options from i18n.

### UI / Design system

- **shadcn/ui** (new-york style) with Radix UI primitives — components in `components/ui/`
- **Tailwind CSS v4** — configured via `app/globals.css` (no `tailwind.config.js`)
- **Design system typography**: custom `ds-` prefixed Tailwind utilities (e.g., `text-ds-title-24-sb`, `text-ds-body-16-m`, `text-ds-caption-14-r`) defined in `globals.css`
- **Pretendard** font (Korean) — `--font-sans` maps to `--font-pretendard`
- **Lucide React** for icons; custom icons in `components/icons/`
- **Framer Motion** for animations
- **`cn()`** utility in `lib/utils.ts` — combines `clsx` + `tailwind-merge`

### Path aliases

`@/` maps to the project root. Key aliases: `@/components`, `@/lib`, `@/hooks`, `@/components/ui`.

### Form validation (Zod)

Schemas in `lib/schemas/` — one file per form step (e.g., `signup-email.ts`, `signup-password.ts`, `login.ts`).

**Validation conventions**:
- Extract types: `export type LoginFormValues = z.infer<typeof loginFormSchema>`
- Error messages: **Korean** via `.refine()` or `message` option
- Trim strings before validation: `z.string().trim().min(1)`
- Use `safeParse()` in form submissions: `schema.safeParse(payload)` — handle failures with `error.flatten().fieldErrors`
- For forms validated against mock accounts, ensure schema rules allow mock credential values

### Figma integration

When user messages contain **"@figma"**, use Figma MCP server tools and resources via `call_mcp_tool` or `fetch_mcp_resource`.

### Mobile-specific

- `hooks/use-keyboard-status.ts` — detects virtual keyboard via VirtualKeyboard API (primary) / VisualViewport API (fallback). Returns `isKeyboardOpen`, `keyboardHeight`.
- `hooks/use-voice-analyser.ts` — audio analysis for voice input via Web Audio API (`AudioContext`, `AnalyserNode`)
- `lib/view-transition.ts` — `withViewTransition()` wraps navigation calls with the View Transitions API crossfade
- `manifest.ts` / `viewport.ts` — PWA manifest and viewport config (`interactiveWidget: "resizes-visual"` is required for keyboard handling)
- `components/pwa-register.tsx` — service worker registration
