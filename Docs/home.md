# Home — page context

Structure of `/home`, implemented in `src/app/home/page.tsx`. Counts and lists come from the database. The prototype screenshot `Docs/telasCadasPatas/tela-home.png` is the old dashboard (four hardcoded numbers) and does not match this layout.

Language of the labels: Brazilian Portuguese. Visual rules: `DESIGN.md`.

## Page

- Route: `/home`. Nav label stays **Início**.
- Title stays **Dashboard** (`font-poppins font-bold text-2xl text-[#755835]`).
- Two rows. On small screens each row stacks into one column. From `md` up, each row is three columns.
- Every outer block and every inner block uses the shared card: white, `rounded-xl`, border `#3A250B` at 30%, shadow `2px 4px 14px rgba(58, 37, 11, 0.1)`. Component: `Card` in `src/global/ui/Card/Card.tsx`.
- Totals are live counts. Nothing on this page stays hardcoded.
- Lists inside a card scroll inside that card. The row height does not grow with the list.
- Clicks that reveal detail use `Modal` in `src/global/ui/Modal/modal.tsx` (`isOpen` / `onClose`). Escape and the overlay already close it.

```
Dashboard
┌────────────────┬──────────────────────────────┬─────────────────────────────┐
│ Animais        │ Comunidade                   │ Medicação pendente         │
│ total          │ Voluntários │ Clínicas │     │ total                      │
│                │ Adotantes                    │ [cards dos gatos…]         │
└────────────────┴──────────────────────────────┴─────────────────────────────┘
┌────────────────────────────┬──────────────────────┬──────────────────────────┐
│ Gatis                      │ Adoções do mês       │ Cadastros                │
│ [cards dos gatis + total]  │ [cards das adoções]  │ [botões de cadastro]     │
└────────────────────────────┴──────────────────────┴──────────────────────────┘
```

## Row 1

### Animais

One card. Title **Animais**. Body is the count of registered animals (`Animal` rows).

Source: `prisma.animal.count()`, the same total `GET /api/animais` returns.

### Comunidade

One card beside Animais. Title **Comunidade**. Inside it, three cards in a row (stacked on small screens):

| Card | Count |
| --- | --- |
| **Voluntários** | Pessoas with tipo voluntário |
| **Clínicas** | Clínicas |
| **Adotantes** | Pessoas with tipo adotante |

Sources: `Pessoa` grouped by `TipoPessoa` (same voluntário / adotante rule as `/comunidade`) and `prisma.clinica.count()`. The list routes `GET /api/voluntarios` and `GET /api/adotantes` still query the removed `Voluntario` and `Adotante` models, so the dashboard does not call them.

These cards are totals. They do not open a list. The full lists stay on `/voluntarios`, `/clinicas`, and `/adotantes`.

### Medicação pendente

One card immediately to the right of Comunidade. Title **Medicação pendente**.

The number is how many **gatos** still need medication: distinct animals with `especie = gato` that have at least one open prescription.

A prescription is open when `nextDoseLabel` in `src/modules/animais/prescricao/schedule.ts` is not `Tratamento encerrado`. The start date is the consulta `dataAtendimento`. Frequency and duration come from `Prescreve` (`frequencia`, `duracaoTratamento`). One gato with several open medicines counts once.

Below the number, a clickable card list of those gatos. Each card shows:

- foto (fallback paw icon, same as `Card`)
- nome
- nome do medicamento em aberto (or the count, when there is more than one)
- próxima dose (`nextDoseLabel`)

Clicking a card opens a modal titled with the gato’s name. The modal is the gato’s info, not a navigation away from `/home`:

- foto, nome, sexo (Macho / Fêmea), espécie, cor, raça, pelagem
- data de chegada (`dd/mm/aaaa`)
- localização atual, or **Não informada**
- situação (`situacaoAnimalLabel` in `src/schemas/animalSchema.ts`)
- FIV/FeLV when `fivFelv` is true
- each open medicine: nome, dosagem, frequência, duração do tratamento, próxima dose

Empty list: **Nenhum gato com medicação pendente**.

The home loader reads every gato and their `Prescreve` rows in one query (`src/modules/home/server/load.ts`). It does not call `GET /api/animais/[idAnimal]/prescricao` per animal.

Espécie values are `gato` and `cachorro` (`src/modules/animais/componentes/FormNewAnimal/components/especies.tsx`). This card is gatos only. The Animais total above counts every species.

## Row 2

### Gatis

One card. Title **Gatis**. Inside it, a card list of every gatil.

A gatil is a `Localizacao` (`src/modules/gatis`). Each inner card shows:

- nome
- tipo de local
- **Animais no local**: animals currently there

“Currently there” is the same rule as `/gatis` and `/gatis/[idGatil]`: `HistoricoLocalizacao` with `dataSaida` null. `GET /api/gatis` already returns `totalAnimais` as the distinct animal ids in those open histories (`totalAnimaisAtivos` in `src/modules/gatis/server/service.ts`). The home card uses that number. It counts every species, not only gatos.

Clicking a gatil card opens a modal titled with the gatil’s name. The body is a card list of the **gatos** in that gatil right now (`especie = gato` and `dataSaida` null). Each cat card uses the same fields as the medicação list (foto, nome, sexo, localização) and opens the same gato-info modal.

Empty gatil list: **Nenhum gatil cadastrado**. Empty modal: **Nenhum gato neste gatil**.

### Adoções do mês

One card to the right of Gatis. Title **Adoções do mês**.

Inside it, a card list of adoptions whose `Adocao.dataAdocao` falls in the current calendar month (America/Sao_Paulo). One card per adoption (`pessoaId` + `animalId`). The card shows the animal’s foto and nome, the adotante’s nome, and the date as `dd/mm/aaaa`.

Clicking a card opens a modal with the adoption record. The schema has no extra adoption fields beyond the link and the date, so “all the adoption info” is:

- Animal: foto, nome, espécie, situação
- Adotante: nome, telefone, cidade, rua, número, bairro
- Adoção: data da adoção

Empty list: **Nenhuma adoção neste mês**.

`Adocao` has no route of its own. The home loader joins `Adocao`, `Animal`, and `Pessoa` for the current month.

### Cadastros

Last card on the row. Title **Cadastros**. Inside it, every register action that already has a page. Each one is a `Button` with `green` and icon `/images/icons/add-button.svg`, and it navigates to the existing form. No new forms.

| Label | Route |
| --- | --- |
| Cadastrar Animal | `/animais/new` |
| Cadastrar Voluntário | `/voluntarios/new` |
| Cadastrar Adotante | `/adotantes/new` |
| Cadastrar Pessoa | `/pessoas/new` |
| Cadastrar Clínica | `/clinicas/new` |
| Cadastrar Gatil | `/gatis/new` |
| Nova consulta | `/saude/consultas/new` |
| Nova medicação | `/saude/medicacoes/new` |

`/saude/fichas/new` only redirects to `/saude/consultas/new`, so it is not a separate button. The disabled **Cadastrar Voluntário** on the current home page goes away; that route already exists and the button is enabled.

Buttons stack in one column inside the card, with the same gap the current home page uses (`gap-4`).

## States

- Loading copy follows the gatis page: **Carregando…** in `font-poppins text-sm font-semibold text-[#755835]/70`, inside the card that is still fetching.
- A failed count or list shows **Não foi possível carregar** in `#8A3B3B` inside that card. The other cards still render.
- Zero is a valid total. Show `0`, not an empty state, on Animais, Voluntários, Clínicas, Adotantes, and the medicação number. Empty copy is only for the lists (gatos, gatis, adoções).

## What this page does not do

- It does not replace `/animais`, `/comunidade`, `/gatis`, or `/saude`.
- Community totals do not filter or search.
- Register buttons do not open modals. They go to the pages above.
- Cat and adoption modals stay on `/home`. A link to the ficha (`/animais/[id]/fichamedica`) can sit under the medicine list in the gato modal, the same way `FichaMedicaModal` already does. It is secondary to the info in the modal.
