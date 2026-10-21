# Chess Archive — Antigravity Project Rules

## Source of truth

Before coding, read `PRD.md` and the relevant files in `docs/`. Treat these files as the product contract. When requirements conflict, stop and report the conflict instead of silently inventing a new product direction.

## Work discipline

1. Work only on the current phase in `docs/IMPLEMENTATION_PLAN.md` unless the user explicitly changes scope.
2. Begin each phase by summarizing the requirements, affected files, risks, and acceptance criteria. Then implement; do not repeatedly ask for approval for routine reversible details.
3. Never generate the whole product in one pass. Build, test, inspect, and refine in small vertical slices.
4. Do not claim a command passed unless it was actually run. Report exact commands and concise results for lint, typecheck, tests, and production build.
5. Keep a `docs/IMPLEMENTATION_LOG.md` during development with completed work, decisions, known issues, and next steps. Create it if it does not exist.
6. Do not replace a working implementation or dependency without explaining the reason and checking impact.

## Engineering rules

- Use TypeScript with strict type safety. Avoid `any`; if unavoidable, explain why and isolate it.
- Keep chess rules, engine integration, UI, persistence, and AI tutoring in separate modules.
- Use `chess.js` or a verified equivalent for legal move generation/validation and game-state rules. Do not handwrite a second chess rules engine.
- Run Stockfish in a Web Worker or suitable worker adapter so engine analysis does not block UI rendering.
- Treat engine outputs and LLM outputs as untrusted input until validated. Gemini must never decide whether a chess move is legal.
- Keep all Gemini calls on the server. Never expose `GEMINI_API_KEY`, secret environment variables, or private server configuration through client code, logs, or `NEXT_PUBLIC_*` variables.
- Validate every API request and response shape. Bound prompt length, output length, analysis payload size, and request frequency. Fail gracefully when the key is absent, quota is exhausted, or the model fails.
- Do not store secrets in source files or commit real `.env*` files. Only commit `.env.example` with blank placeholders.
- Do not add authentication, multiplayer, analytics, tracking, or third-party services unless the current phase explicitly calls for them.
- Use stable, maintained package versions compatible with the selected Next.js/React version. Verify official package documentation at implementation time; do not invent APIs.
- Respect third-party licenses, especially Stockfish's GPL obligations. Record the exact engine package/build and license/source notices used.

## UI/UX rules

- Follow `docs/DESIGN_SYSTEM.md`, `docs/UI_UX_SPEC.md`, and `docs/SCREEN_SPEC.md`.
- The product is a polished, 2D, minimal, dark graphite archive—not a 3D chess scene, generic admin dashboard, or neon gaming HUD.
- Prefer strong spacing, clear hierarchy, subdued borders, readable typography, and intentional motion. Avoid gradients, glassmorphism overload, glowing effects, excessive cards, and decorative clutter.
- The chessboard is the primary focus on play screens. Never let side panels, AI chat, or marketing copy shrink it unnecessarily.
- Build responsive layouts for mobile, tablet, and desktop. Ensure drag-and-drop is not the only way to move a piece; support click/tap selection and destination.
- Provide loading, success, disabled, error, empty, game-over, and reduced-motion states as applicable.
- All user-visible product copy is natural Bahasa Indonesia unless a proper chess term, notation, or brand name is more appropriate. Keep terminology consistent.
- Icons must have accessible labels when their meaning is not obvious. Use semantic controls, visible focus indicators, and sufficient color contrast.
- Do not add fake interactions. Disabled or not-yet-built features must be clearly represented and must not imply they work.

## Completion checklist

Before declaring a phase complete:

- Match acceptance criteria in `docs/IMPLEMENTATION_PLAN.md`.
- Run applicable unit, integration, and end-to-end tests from `docs/TEST_PLAN.md`.
- Run lint, typecheck, and production build where scripts exist.
- Inspect the page at desktop and mobile widths; fix overflow, broken spacing, clipped menus, and unreadable text.
- Check browser console and network errors.
- Update `docs/IMPLEMENTATION_LOG.md` with evidence, remaining issues, and the next phase.
