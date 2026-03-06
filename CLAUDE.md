# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
  layout.tsx          # Root layout: wraps everything in ChatProvider + LayoutContent
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
- Rendering `AppHeader` with per-route titles (defined in `HEADER_TITLE` map)
- Rendering `BottomBar` only on `/home`, `/graduation`, `/my` routes
- Rendering `ChatInput` (floating, above keyboard on mobile)
- Mobile virtual keyboard detection and layout adjustment (see `docs/keyboard-handling.md`)
- View Transitions API for page navigation

### State management

- **Chat state**: `contexts/chat-context.tsx` — `ChatProvider` wraps the app, exposes `messages`, `isLoading`, `sendMessage`, `startNewChat` via `useChat()` hook. Currently uses mock timeout; API integration is a TODO.
- **Auth state**: `lib/auth-storage.ts` — localStorage key `navi_logged_in`. Mock credentials in `lib/mock-accounts.ts`.
- **Graduation result**: localStorage key `navi_graduation_result` via helpers in `lib/mock-accounts.ts`.

### UI / Design system

- **shadcn/ui** (new-york style) with Radix UI primitives — components in `components/ui/`
- **Tailwind CSS v4** — configured via `app/globals.css` (no `tailwind.config.js`)
- **Design system typography**: custom `ds-` prefixed Tailwind utilities (e.g., `text-ds-title-24-sb`, `text-ds-body-16-m`, `text-ds-caption-14-r`) defined in `globals.css`
- **Pretendard** font (Korean) — `--font-sans` maps to `--font-pretendard`
- **Lucide React** for icons; custom icons in `components/icons/`
- **Framer Motion** for animations

### Path aliases

`@/` maps to the project root. Key aliases: `@/components`, `@/lib`, `@/hooks`, `@/components/ui`.

### Form validation

Zod schemas in `lib/schemas/` — one file per form step (e.g., `signup-email.ts`, `signup-password.ts`, `login.ts`).

### Mobile-specific

- `hooks/use-keyboard-status.ts` — detects virtual keyboard via VirtualKeyboard API / VisualViewport API
- `hooks/use-voice-analyser.ts` — audio analysis for voice input
- `lib/view-transition.ts` — `withViewTransition()` wraps navigation calls with the View Transitions API crossfade
- `manifest.ts` / `viewport.ts` — PWA manifest and viewport config (`interactiveWidget: "resizes-visual"` is required for keyboard handling)
- `components/pwa-register.tsx` — service worker registration
