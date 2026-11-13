# CadasPatas — repository context

Local notes for working in this repo. Not part of the product.

## What it is

CadasPatas is a web app for animal-rescue NGOs. Organizations register rescued animals (name, age, coat, health, history) and the people around them (volunteers, adopters, clinics) so animals can be managed and offered for adoption.

Language of the product: Brazilian Portuguese (`lang="pt-BR"`).

Team (from the README): React — Mirella; Node.js — Lana; AWS — Maria and Camila. Prototype: https://cadas-patas.vercel.app/

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript. Dev server: `npm run dev` (`next dev --webpack`).
- Tailwind CSS 4 (`@import 'tailwindcss'` in `src/app/globals.css`). Colors are mostly arbitrary hex classes, not design tokens.
- PostgreSQL via Prisma 7 (`@prisma/adapter-pg`). Client is generated to `src/generated/prisma` (gitignored). Schema: `prisma/schema.prisma`.
- Local database: `docker compose` (`compose.yaml`, Postgres 16, user password `postgres`, port 5432). Scripts: `npm run db:init`, `npm run db:migrate`.
- Validation: Zod 4 in `src/schemas/`.
- Forms: react-hook-form + `@hookform/resolvers`.
- Server state: TanStack Query. Providers live in `src/app/layout.tsx` (`QueryProvider`, `ToastProvider` via react-toastify).
- Auth: NextAuth v5 credentials, JWT session (`src/auth.ts`). Login is a mock: `admin@cadaspatas.com` / `123456`. There is also a `User` model and `bcryptjs`, but authorize does not read the database yet.
- Path alias: `@/*` → `src/*`.

## Layout

```
src/app/            routes, root layout, route handlers under api/
src/modules/        feature code: animais, pessoas, clinicas
src/global/         shared UI, hooks, providers, errors, API base URL
src/schemas/        Zod schemas shared by API and forms
src/lib/            prisma client, http helper, error constants, mock-auth
prisma/schema.prisma
```

Root layout (`src/app/layout.tsx`) always renders `MenuNav` and the page in `<main>`. Page background is `#FFF9F7`. Font is Poppins (see `DESIGN.md`).

## Routes

| Path | Status |
| --- | --- |
| `/` and `/login` | Login screen (mock credentials shown on the page) |
| `/home` | Dashboard. Layout and data rules: `Docs/home.md` |
| `/animais`, `/animais/new`, `/animais/[idAnimal]` | List, create, edit |
| `/comunidade` | Placeholder (`ComunidadePage`) |
| `/voluntarios`, `/voluntarios/new`, `/voluntarios/[idVoluntario]` | Volunteers (pessoa with volunteer data) |
| `/adotantes`, `/adotantes/[idAdotante]` | Adopters |
| `/clinicas` | Clinics list. Nav links to `/clinicas/new`, which has no page yet |
| `/fichamedica` | Placeholder (`FichaMedicaPage`). Not in the nav |
| `/logout` | Linked from the nav (`src/app/usuario/logout/logout.tsx` exists separately) |

Nav (`src/global/ui/MenuNav/MenuNav.tsx`): Início, Animais (+), Comunidade (Voluntários, Adotantes, Clínicas), Sair. Fixed sage sidebar (`#D0DAC4`). The “add” control on Adotantes currently routes to `/voluntarios/new`.

## API

Route handlers under `src/app/api/`:

- `GET/POST /api/animais`, `GET/PATCH/DELETE /api/animais/[idAnimal]`
- `GET/POST /api/voluntarios`, `.../[idVoluntario]`
- `GET/POST /api/adotantes`, `.../[idAdotante]`
- `GET/POST /api/clinicas`, `.../[idClinica]`
- `GET /api/health`

Client calls use `API_URL` from `src/global/constants/api.ts` (`/api` in the browser).

Intended module shape (animais is the reference):

- `types.ts` — client types
- `server/repo.ts` — Prisma queries
- `server/service.ts` — Zod parse, map entity → public DTO
- `hooks/useXList.ts`, `useCreateX.ts`, `useUpdateX.ts`, `useDeleteX.ts` — React Query
- `views/*ListView.tsx` — filters + table
- `componentes/` or `components/` — forms and tables
- `src/schemas/*Schema.ts` — shared validation

`useListQuery` (`src/global/hooks/useListQuery.ts`) wraps `useQuery` (5 min stale time, no refetch on focus). `useMutation` in `src/global/hooks/useMutation.ts` is the matching write helper.

List screens share the same filter row: search, sort field, sort direction, page size. Default list query is page 1, page size 20, sort `dataChegada` desc (animals).

## Domain (Prisma)

- `TipoPessoa` → `Pessoa` (CPF, birth date, phone, address, start/end dates). `Pessoa` is used for both volunteers and adopters.
- `Adocao` joins `Pessoa` and `Animal` (composite id).
- `Animal`: nome, cor, especie, raca, pelagem, sexo (boolean), fivFelv, dataNascimento, dataChegada, motivoSaida, foto.
- `Localizacao` / `HistoricoLocalizacao`, `Peso` / `HistoricoPeso`.
- `Clinica` → `Consulta` ← `Animal` and `Motivo`. `Consulta` → `Prescreve` → `Medicamento`.

UI and Zod are ahead of the schema in places. The animais POST handler writes `chip` and `observacoes`, and `animalSchema` requires `fivFelv`, while the create route’s `createAnimalSchema` (in `cadastroSchemas`) does not line up field-for-field with `prisma/schema.prisma`. Check both before changing animal create/update.

## Shared UI

Exported from `src/global/ui/index.tsx`: `AvatarUpload`, `Button`, `CheckBox`, `DropDown`, `Field`, `MenuNav`, `Table`, `TextArea`. `SummaryTag` is a collapsible block used by the nav.

`Button` variants: `green` (save, `#8AA36C`), `red` (delete, `#FFA686`), `disabled` (green at 50% opacity), and a text-only default. A `yellow` prop exists and is unused.

Tables are styled in `src/global/ui/Table/Table.style.css` (sage header, brown borders). Pagination buttons still fall back to `#007bff`, which is outside the rest of the palette.

## Conventions

- Keep feature code inside `src/modules/<feature>` and route files thin.
- Validate with the Zod schema for that entity; return `{ message, error: fieldErrors }` with 400 on `ZodError`.
- Do not edit `src/generated/prisma` by hand. Regenerate with Prisma.
- `.env*` is gitignored. Database URL is `DATABASE_URL`.
- CI: `.github/workflows/` runs eslint, prettier, and a general CI workflow. Format with `npm run format`.

## Design

Colors, type, and where each is used: `DESIGN.md`.
