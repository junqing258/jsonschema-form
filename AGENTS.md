# Repository Guidelines

## Project Structure & Module Organization
Core code stays in `src/`. `components/ui` mirrors shadcn primitives and `components/apps|blocks|approvals` host domain widgets consumed by routes in `pages/` registered through `App.tsx`. Async contracts live in `services/`, client state in `stores/`, and axios-mock fixtures in `mocks/`. Styles belong in `styles/` plus Tailwind tokens, static assets live in `public/`, and Vite builds emit to `dist/`.

## Build, Test, and Development Commands
- `pnpm install` respects the committed lockfile.
- `pnpm dev` boots Vite with mock data.
- `pnpm build` produces the bundle; `pnpm build:stage|build:product` use the matching mode and upload `dist/` through `uploads3`.
- `pnpm preview` serves the build locally.
- `pnpm lint` runs the flat ESLint stack and must pass before opening a PR.

## Coding Style & Naming Conventions
Favor functional React + TypeScript and TanStack Query for async data. Use PascalCase for components (`UserGrid.tsx`), camelCase for hooks/utilities (`useSubmitBlock.ts`), and kebab-case for assets. Keep Tailwind utilities in markup, fall back to SCSS modules only for layered tokens, and co-locate feature styles with the component they affect. Formatting defaults to two-space indentation, single quotes, and no semicolons; rely on ESLint autofix instead of manual tweaks.

## Testing Guidelines
A formal test runner is not yet wired in, so each PR must document the manual scenarios executed against `pnpm dev`. When automation is introduced, place `*.spec.tsx` beside the covered component, mock HTTP via `src/mocks/handlers.ts`, and lean on Vitest + React Testing Library. Cover at least one happy and one guarded path per form, run `pnpm vitest run` (after adding the script), and aim for ≥80 % statement coverage on critical flows.

## Commit & Pull Request Guidelines
Use Conventional Commits so downstream release tooling can infer semantics, e.g., `feat(blocks): add publish toggle validation`. Keep scopes aligned with the module touched (`apps`, `blocks`, `approvals`, `ui`, `mocks`). Every PR should link to an issue, summarize motivation, include screenshots for UI changes, list manual test steps, note env vars, and wait for `pnpm lint` (and future tests) to pass before merging.

## Security & Configuration Tips
Never commit secrets; share only `.env.sample`. Keep `VITE_ENABLE_MOCK=true` locally and add `VITE_API_BASE_URL` plus AWS credentials when targeting real services or running the upload scripts. Store `uploads3` keys in your shell profile, verify via `aws sts get-caller-identity`, and scrub sensitive data from logs before sharing build artifacts.
