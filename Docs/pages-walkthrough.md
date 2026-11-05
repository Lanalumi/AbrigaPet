# AbrigaPet: page-by-page walkthrough

A detailed description of every page in the app: what it is for, how you reach it, what it shows, what you can do on it, the rules behind it, and where it leads. The pages are grouped in the order they would be presented in a demo.

Interface labels are quoted exactly as they appear on screen (Brazilian Portuguese).

---

## Contents

1. [Global layout and navigation](#1-global-layout-and-navigation)
2. [Login](#2-login)
3. [Início (dashboard)](#3-início-dashboard)
4. [Animais](#4-animais)
   - [Animal list](#41-animal-list--animais)
   - [New animal](#42-new-animal--animaisnew)
   - [Animal page](#43-animal-page--animaisid)
   - [Ficha médica](#44-ficha-médica--animaisidfichamedica)
5. [Saúde animal](#5-saúde-animal)
   - [Health overview](#51-health-overview--saude)
   - [New consultation](#52-new-consultation--saudeconsultasnew)
   - [New medication](#53-new-medication--saudemedicacoesnew)
   - [Consultation page](#54-consultation-page--saudeconsultasid)
   - [Medication page](#55-medication-page--saudemedicacoesid)
6. [Comunidade](#6-comunidade)
   - [Community overview](#61-community-overview--comunidade)
   - [New person](#62-new-person--pessoasnew-voluntariosnew-adotantesnew)
   - [Voluntário and adotante pages](#63-voluntário-and-adotante-pages)
   - [New clinic](#64-new-clinic--clinicasnew)
   - [Clinic page](#65-clinic-page--clinicasid)
7. [Gatis](#7-gatis)
   - [Location list](#71-location-list--gatis)
   - [New location](#72-new-location--gatisnew)
   - [Location page](#73-location-page--gatisid)
8. [Secondary pages and redirects](#8-secondary-pages-and-redirects)
9. [Shared behaviour](#9-shared-behaviour)
10. [Known gaps](#10-known-gaps)
11. [Suggested demo script](#11-suggested-demo-script)

---

## 1. Global layout and navigation

Every page shares the same frame.

**Sidebar.** A fixed light-green panel on the left. On mobile it becomes a bar across the top that scrolls sideways. From top to bottom:

| Item | Destination | Notes |
| --- | --- | --- |
| AbrigaPet logo and name | none | Branding only |
| **Início** | `/home` | The dashboard |
| **Animais** | `/animais` | A small **+** beside it opens `/animais/new` directly |
| **Comunidade** | `/comunidade` | Volunteers, adopters, clinics |
| **Saúde animal** | `/saude` | Also highlighted on any `/fichamedica` address |
| **Gatis** | `/gatis` | Housing locations |
| **Sair da conta** | `/logout` | Pinned to the bottom, hidden on mobile |

The item for the current section is highlighted with a light background.

**Content area.** Sits to the right of the sidebar, on a warm off-white background, in the Poppins font.

**Notifications.** Every save, update and delete shows a toast in the corner: green for success, red for errors.

---

## 2. Login

**Routes:** `/` and `/login`. Both show the same screen.

**Purpose:** the entry point for ONG staff.

**Content**
- A centered card over an illustrated background
- The AbrigaPet icon, the title "AbrigaPet" and the subtitle "Entre na sua conta"
- An **E-mail** field and a **Senha** field, each with an icon
- An "Esqueceu a senha?" link
- An **Entrar** button, which reads "Entrando..." while it checks the credentials
- A hint at the bottom with the demo credentials

**Flow**
- Correct credentials save a session in the browser and open **Início**.
- Wrong credentials show "Email ou senha invalidos." under the fields.

**Rules**
- Login is currently a mock. The only valid account is `admin@abrigapet.com` with password `123456`.
- "Esqueceu a senha?" doesn't do anything yet.

---

## 3. Início (dashboard)

**Route:** `/home`

**Purpose:** a live overview of the shelter. Every number is read from the database when the page loads. Nothing is hardcoded.

**Header:** a paw icon, the title "Dashboard" and the subtitle "Visão geral e acompanhamento em tempo real do abrigo".

The page has two rows of three cards. On small screens each row stacks into a single column.

### Row 1

#### Animais
- The card title is a link to `/animais`.
- A large **Total** shows the number of animals in the system. Deleted animals aren't counted.
- Below it is a scrollable list of mini-cards, sorted by name. Each shows the photo (or a paw icon), the name, and "sexo · espécie · situação", for example "Fêmea · Gato · Disponível".
- Each mini-card opens that animal's page.
- When there are no animals, the card says "Nenhum animal cadastrado".

#### Comunidade
- Subtitle "Pessoas e clínicas ligadas ao abrigo". Clicking anywhere on the card opens `/comunidade`.
- Inside is a vertical list of three rows, each with a label on the left and a number on the right:
  - **Voluntários**, with an **Ativos** tag
  - **Adotantes**
  - **Clínicas**

#### Medicação pendente
- Subtitle "Acompanhe os gatos com tratamento em andamento".
- A large number shows how many **cats** still have an ongoing treatment. A cat with several open medicines counts once.
- A treatment counts as ongoing while its next dose isn't "Tratamento encerrado" (see [how next doses are calculated](#how-next-doses-are-calculated)).
- Below it is a list of cards, one per cat. Each shows:
  - the photo and name
  - **Medicamento**: the medicine name, or "N medicamentos" when there are several
  - **Próxima dose**: the soonest next dose
- Clicking a cat opens a pop-up (modal) titled with its name, containing:
  - the photo, Sexo, Espécie, Cor, Raça, Pelagem, Data de chegada, Localização and Situação, and a FIV/FeLV tag when positive
  - a **Medicação** section with one block per open medicine: name, Dosagem, Frequência, Duração and Próxima dose
  - a "Ficha médica completa" link to the cat's ficha médica
- When no cat is on treatment, the card says "Nenhum gato com medicação pendente".

### Row 2

#### Gatis
- Subtitle "Locais cadastrados e os gatos que estão em cada um".
- One card per location, showing **Tipo de local** and **Animais no local**. The second is the number of animals of any species currently housed there.
- Clicking a location opens a pop-up listing the **cats** currently there (photo, sex, location). Each cat opens the same cat pop-up described above.
- Empty states: "Nenhum gatil cadastrado" when there are no locations, and "Nenhum gato neste gatil" when a location has no cats.

#### Adoções do mês
- Subtitle "Animais que saíram por adoção neste mês".
- One card per animal whose exit reason is **Adoção** and whose exit date falls in the current month (São Paulo time). Each card shows the animal's photo and name, the adopter, and the date.
- Clicking a card opens a pop-up with:
  - the animal: photo, Animal, Espécie, Situação
  - **Adotante**: Nome, Telefone, Cidade, Rua, Número, Bairro (shown when an adopter is linked)
  - **Data da adoção**
- When there are none, the card says "Nenhuma adoção neste mês".

#### Ações rápidas
- Subtitle "Atalhos para cadastros frequentes no abrigo".
- Eight green buttons in a two-column grid. The whole button is clickable.

| Button | Opens |
| --- | --- |
| Cadastrar Animal | `/animais/new` |
| Cadastrar Voluntário | `/voluntarios/new` |
| Cadastrar Adotante | `/adotantes/new` |
| Cadastrar Pessoa | `/pessoas/new` |
| Cadastrar Clínica | `/clinicas/new` |
| Cadastrar Gatil | `/gatis/new` |
| Nova consulta | `/saude/consultas/new` |
| Nova medicação | `/saude/medicacoes/new` |

**States**
- Each card loads on its own. While a card is loading it shows "Carregando…".
- If a card fails, it shows "Não foi possível carregar" in red. The other cards still appear normally.

---

## 4. Animais

### 4.1 Animal list (`/animais`)

**Purpose:** find any rescued animal and get to its record.

**How you get here:** the **Animais** menu item, the title of the Animais card on Início, or **← Voltar para lista** on an animal's page.

**Header:** the page title, plus a **Cadastrar Animal** button.

**Filter panel**

| Control | Behaviour |
| --- | --- |
| **Pesquisar** | Free text. It matches name, breed, species and exit reason. It also understands "macho" and "fêmea", synonyms such as "óbito", "morte" or "adotado", and dates written as `dd/mm/aaaa`, which match birth, arrival or exit dates. |
| **Ordenar por** | Data de chegada (default), Nome, Data de nascimento or Sexo |
| **Ordem** | Descendente (default) or Ascendente |
| **Aplicar filtros** | Runs the search |

The panel's footer shows "Mostrando X de Y Animais • Página N de M". It also has an **Itens por página** selector: 10, 20 (default), 50 or 100.

**The list:** one card per animal, showing:
- the photo, or a paw icon
- the name, which is a link, plus a red **FIV/FeLV** tag when positive
- **Data de chegada**, **Sexo** and **Localização** (or "Não informada")
- a green **Ficha médica** button that opens the animal's ficha médica

Clicking anywhere else on the card opens the animal's page.

**Pagination:** **Anterior** and **Próxima** buttons with "Página N de M". They only appear when there's more than one page.

**States**
- While loading: a spinner with "Carregando animais...".
- With no results, an empty card shows:
  - "Nenhum animal encontrado"
  - either "Tente ajustar os filtros…" (when filters are active) or "Ainda não há nenhum animal cadastrado no sistema."
  - a **Cadastrar Primeiro Animal** button

**Rules:** deleted animals never appear here.

### 4.2 New animal (`/animais/new`)

**Purpose:** register a newly rescued animal.

**How you get here:**
- the **+** next to Animais in the sidebar
- **Cadastrar Animal** on the list
- the Ações rápidas shortcut on Início

**Layout:** a white card titled "Cadastro do Animal", with the subtitle "Preencha as informações do novo resgatado". It has two columns.

**Left column: data fields**

| Field | Type | Required | Options and rules |
| --- | --- | --- | --- |
| Nome | text | yes | |
| Data de Chegada | date | yes | `dd/mm/aaaa` |
| Espécie | dropdown | yes | Cachorro, Gato |
| Raça | text | yes | |
| Cor | dropdown | yes | Preto, Branco, Cinza, Caramelo, Laranja |
| Pelagem | dropdown | yes | Longo, Curto, Médio |
| Data de Nascimento | date | no | `dd/mm/aaaa` |
| Sexo | choice | yes | Fêmea (default), Macho |

**Right column: photo and blood tests**
- **Foto do Animal:** a square preview with **Adicionar foto**, then **Trocar foto** and **Remover** once a photo is set. Any image file is accepted.
- **Testes de Sorologia:** two checkboxes, **Positivo para FIV** and **Positivo para FeLV**. A note says to leave both unchecked when negative. Checking either one marks the animal as FIV/FeLV positive.

**Actions:** **Salvar Animal** at the bottom right. It reads "Salvando..." while the save is in progress.

**Validation:** missing or invalid fields are listed in a red box at the top, under "Corrija os erros destacados abaixo:". The first error also appears as a toast.

**After saving:** the toast "Animal cadastrado com sucesso" appears, and the new animal's page opens.

### 4.3 Animal page (`/animais/[id]`)

**Purpose:** the animal's complete record, used both to view and to edit it.

**How you get here:** a card on the animal list, a mini-card on Início, a gatil's animal list, or an adotante's adopted animals.

**Header**
- A paw icon, the animal's name, and a status tag:
  - **Disponível:** in the shelter
  - **Adoção:** adopted
  - **Falecimento:** deceased
  - **Saiu:** left for another reason
- The subtitle reads "Ficha de cadastro e histórico de saúde do resgatado". It changes to "Modo de Edição ativado — altere os dados desejados abaixo" while editing.

**Left column**
- **Data fields:** the same fields as registration (Nome, Data de Chegada, Espécie, Cor, Raça, Pelagem, Data de Nascimento, Sexo). They're locked until you click **Editar Animal**.
- **Local atual:** the name of the animal's current location, with a pencil icon. The pencil works even outside edit mode and opens the **Local** pop-up:
  - The **Novo local** form has a **Local** dropdown listing only active locations, a **Data** field and a **Registrar** button.
  - Registering a new location shows the toast "Local registrado". The previous stay is closed on that date and marked "Anterior", and the new one becomes "Atual".
  - Below the form, a card shows the current location, its type and "desde" (since) the entry date.
  - Below that, a **Histórico** list shows every previous stay.
  - Possible messages: "Nenhum local cadastrado.", "Nenhum local registrado.", "Nenhum local anterior.", "Este local está inativo".

**Right column**
- **Foto do Animal:** read-only until editing.
- **Testes de Sorologia:** the FIV and FeLV checkboxes, locked until editing.
- **Saúde:** two links, each opening a pop-up.
  - **Ficha Médica** shows the medicines from the most recent consultation that has prescriptions. Each medicine card shows **Data de início**, **Próxima dose**, **Dosagem** and **Período do dia** (Manhã, Tarde, Noite, Diário, or the frequency text). A "Ficha médica completa →" link goes to the full ficha. When empty it says "Nenhuma prescrição registrada no momento."
  - **Histórico de peso** works like this:
    - The **Nova pesagem** form has **Peso (kg)**, which accepts a comma, for example "4,5", and **Data**, which defaults to today. **Registrar** saves it and shows the toast "Pesagem registrada".
    - A **Peso atual** card shows the latest weight in large type and the date it was measured.
    - A **Histórico** list shows earlier weigh-ins, each with its date and a status of "Atual" or "Anterior".
    - Whichever weigh-in has the most recent date becomes "Atual", even if it was entered later.
    - Validation messages: "Informe o peso", "O peso deve ser maior que zero", "Data de pesagem inválida".

**Motivo de saída** (full width, below both columns)
- **Motivo:** Selecione, Falecimento, Adoção or Saiu
- **Data:** the exit date
- Rule: both must be filled in, or both left empty. Errors read "Informe a data de saída" or "Selecione o motivo de saída".
- Setting an exit reason changes the status tag in the header.

**Footer actions**

| State | Buttons |
| --- | --- |
| Viewing | **← Voltar para lista** and **Editar Animal** |
| Editing | **← Voltar para lista**, **Salvar Alterações**, **Excluir** and **Cancelar** |

- **Salvar Alterações** sends only the fields that changed. If nothing changed, a "Nenhum campo alterado" notice appears instead. On success, the toast "Animal atualizado com sucesso" appears and the page goes back to viewing.
- **Cancelar** discards your changes and goes back to viewing.
- **Excluir** asks "Tem certeza que deseja excluir este animal?" and then:
  - The animal is **hidden, not erased**. It disappears from every list, the dashboard and the selection dropdowns, and can no longer receive consultations, weigh-ins or location changes.
  - Its current location stay is closed, so it stops counting toward that gatil.
  - Its history is kept. It still shows as "Nome (excluído)", without a link, in an adopter's list and in a gatil's "Passaram por aqui".
  - The toast "Animal excluído com sucesso" appears, and the animal list opens.

### 4.4 Ficha médica (`/animais/[id]/fichamedica`)

**Purpose:** the animal's complete clinical history. There is one ficha per animal. Each consultation is an entry in that ficha, and each consultation holds its own prescriptions.

**How you get here:**
- **Ficha médica** on an animal card
- the "Ficha médica completa" links in the pop-ups
- any card on Saúde animal
- after saving or deleting a consultation or medication

Adding `?consulta=[id]` to the address opens that specific consultation. Without it, the most recent one opens.

**Header**
- the animal's photo, the label "FICHA MÉDICA" and the animal's name
- **← Voltar para o animal**
- **+ Nova consulta**, which opens the new-consultation form with this animal already selected
- **+ Nova medicação**, shown only when a consultation exists. It opens the new-medication form with this animal and the displayed consultation already selected.

**Prescrição panel (left)**
- The subtitle reads "Medicamentos desta consulta, aferida em [date]".
- A table with columns **Nome**, **Tipo**, **Dosagem**, **Quantidade**, **Duração** and **Frequência**, plus an **Editar** link on each row that opens that medication's page.
- When empty: "Nenhuma prescrição registrada nesta consulta."

**Detalhes do atendimento panel (right)**
- An **Editar consulta** link in the panel header opens the consultation's page.
- **Data de atendimento**, **Data de retorno** (or "—") and **Motivo**.
- **Clínica:** the clinic name is a button. It opens a pop-up with the CNPJ, Telefone, Endereço, Bairro and Cidade, and a **Fechar** button. Escape or a click outside also closes it.
- **Observação:** the notes, or "Nenhuma observação registrada."

**Histórico de consultas (bottom, full width)**
- A table with columns **Data**, **Clínica**, **Motivo** and **Observação** (shortened if long).
- The displayed consultation is highlighted. Clicking another date loads that consultation into both panels above.
- When there are no consultations, a dashed box explains that the first consultation will appear here once it's added.

---

## 5. Saúde animal

### 5.1 Health overview (`/saude`)

**Purpose:** one place to browse all medical records.

**Header:** "Saúde animal", with the subtitle "Acompanhamento de fichas médicas e histórico de consultas dos animais", plus **Nova consulta** and **Nova medicação** buttons.

**Two columns.** Each has its own search box and sorting, and both filter instantly as you type.

| Column | One card per | Card content | Sort options | Opens |
| --- | --- | --- | --- | --- |
| **Fichas Médicas** | animal | Última consulta (or "Nenhuma"), Clínica, Motivo, Observação | Animal (default, A to Z), Última consulta, Clínica | the animal's ficha médica |
| **Consultas** | consultation | Title "Animal — date", then Animal, Clínica, Motivo, Prescrições (count), Retorno | Data de atendimento (default, newest first), Animal, Clínica, Motivo | the ficha médica, opened on that consultation |

**States:** "Nenhuma ficha médica encontrada" or "Nenhuma consulta encontrada" when a column is empty, "Tente ajustar os filtros" when a search finds nothing, and "Não foi possível carregar a lista" on error.

**Rules:** deleted animals and their consultations don't appear.

### 5.2 New consultation (`/saude/consultas/new`)

**Purpose:** record a vet visit. This adds a new entry to the animal's ficha médica.

**How you get here:** **Nova consulta** on Saúde animal or Início, or **+ Nova consulta** on a ficha médica, which preselects the animal.

**Header:** "Nova consulta", with the subtitle "Registro de atendimento clínico e histórico de saúde".

**Fields**

| Field | Required | Notes |
| --- | --- | --- |
| Animal | yes | Dropdown of non-deleted animals |
| Clínica | yes | Dropdown of registered clinics |
| Motivo | yes | Free text, with suggestions from reasons used before. A new reason is saved automatically. |
| Data de atendimento | yes | `dd/mm/aaaa` |
| Data de retorno | no | `dd/mm/aaaa` |
| Observação | yes | Multi-line notes |

**Actions:** **Salvar** and **Cancelar**. Cancelar goes back to Saúde animal.

**Rules**
- If there are no animals or no clinics, the form is replaced by "Cadastre um animal antes de registrar uma consulta." or "Cadastre uma clínica antes…".
- Invalid dates show "Data inválida. Use dd/mm/aaaa".

**After saving:** the toast "Consulta registrada" appears, and the animal's ficha médica opens on the new consultation.

### 5.3 New medication (`/saude/medicacoes/new`)

**Purpose:** add a prescribed medicine to a consultation.

**How you get here:** **Nova medicação** on Saúde animal or Início, or **+ Nova medicação** on a ficha médica, which preselects the animal and consultation.

**Header:** "Dados da Medicação", with the subtitle "Preencha os detalhes do medicamento para vinculá-lo ao histórico do animal."

**Fields**

| Field | Required | Notes |
| --- | --- | --- |
| Animal | yes | Changing it clears the consultation |
| Consulta vinculada | yes | Locked until an animal is chosen ("Escolha o animal primeiro"). Lists only that animal's consultations, as "date — reason". If the animal has none, a red note warns that a medication needs a consultation. |
| Medicamento | yes | Free text, with suggestions from medicines used before. A new name is saved automatically. |
| Tipo | no | For example Comprimido, Gotas or Pomada |
| Dosagem | yes | For example "2mg" |
| Quantidade por dose | yes | A whole number greater than zero |
| Frequência | yes | For example "A cada 12 horas" |
| Duração do tratamento | yes | For example "7 dias" |

**Actions:** **Cancelar**, which goes back to Saúde animal, and **Salvar Medicação**.

**After saving:** the toast "Medicação cadastrada" appears, and the ficha médica opens on the linked consultation.

#### How next doses are calculated

**Frequência** and **Duração do tratamento** are free text. The app reads them to work out the next dose shown on Início and in the Ficha Médica pop-up.

| Field | Phrases it understands |
| --- | --- |
| Frequência | "a cada 8 horas", "12/12h", "2x ao dia", "1 vez", "diário", "a cada 3 dias", "2x por semana", "manhã e noite" |
| Duração do tratamento | "7 dias", "2 semanas", "contínuo" (never ends) |

- The treatment starts on the consultation's date.
- Once the duration has passed, the next dose reads **Tratamento encerrado**, and the cat drops off "Medicação pendente".
- If the frequency can't be understood, the next dose shows "—".

### 5.4 Consultation page (`/saude/consultas/[id]`)

**Purpose:** view, edit or delete a consultation.

**How you get here:** **Editar consulta** on the ficha médica.

**Content:** the same form as Nova consulta, filled in and locked. The title is "Consulta".

| State | Buttons |
| --- | --- |
| Viewing | **Editar Consulta** and **Voltar** |
| Editing | **Salvar Alterações**, **Excluir** and **Cancelar** |

- **Salvar Alterações** shows the toast "Consulta atualizada" and opens the ficha médica on this consultation.
- **Excluir** asks for confirmation, and the message includes how many medications go with it, for example "Tem certeza que deseja excluir esta consulta e suas 2 medicações?". The consultation and its medications are deleted permanently, then the ficha médica opens.
- **Cancelar** restores the saved values and locks the form again.

### 5.5 Medication page (`/saude/medicacoes/[id]`)

**Purpose:** view, edit or delete one prescribed medicine.

**How you get here:** **Editar** on a row of the Prescrição table.

**Content:** the same form as Nova medicação, filled in and locked.

| State | Buttons |
| --- | --- |
| Viewing | **Voltar** and **Editar Medicação** |
| Editing | **Cancelar**, **Excluir** and **Salvar Alterações** |

- Saving shows the toast "Medicação atualizada". Deleting asks "Tem certeza que deseja excluir esta medicação?". Either one then opens the ficha médica on the consultation.
- You can move a medication to another consultation of the same animal by changing **Consulta vinculada**.

---

## 6. Comunidade

### 6.1 Community overview (`/comunidade`)

**Purpose:** everyone connected to the ONG, all on one screen.

**Header:** "Comunidade", with the subtitle "Gerencie voluntários, adotantes e clínicas parceiras da ONG", plus **Cadastrar Pessoa** and **Cadastrar Clínica** buttons.

**Three columns.** Each has its own search box and sorting, and filters instantly as you type.

| Column | Card content | Sort options (default first) | Card opens |
| --- | --- | --- | --- |
| **Voluntários** | Cidade, Telefone, Data de nascimento, Data de inscrição | Data de inscrição (newest), Nome, Data de nascimento | `/voluntarios/[id]` |
| **Adotantes** | Cidade, Telefone, Data de nascimento, Cadastro | Data de cadastro (newest), Nome, Data de nascimento | `/adotantes/[id]` |
| **Clínicas** | Cidade, Telefone, Bairro, CNPJ | Nome (A to Z), Cidade | `/clinicas/[id]` |

The search covers more than what the card shows. For example, the clinic search also matches CNPJ, neighbourhood and street.

**States:** "Nenhum … encontrado" when a column is empty, "Tente ajustar os filtros" when a search finds nothing, and "Não foi possível carregar a lista" on error.

### 6.2 New person (`/pessoas/new`, `/voluntarios/new`, `/adotantes/new`)

**Purpose:** register a volunteer or an adopter. All three addresses use the same form.

**How you get here:** **Cadastrar Pessoa** on Comunidade, or the Cadastrar Pessoa, Voluntário and Adotante shortcuts on Início.

| Address | Page title | Tipo de pessoa |
| --- | --- | --- |
| `/pessoas/new` | "Cadastro de pessoa" | You choose: Voluntário or Adotante |
| `/voluntarios/new` | "Cadastro de voluntário" | Fixed to Voluntário, selector hidden |
| `/adotantes/new` | "Cadastro de adotante" | Fixed to Adotante, selector hidden |

**Fields**

| Section | Field | Required | Rule |
| --- | --- | --- | --- |
| Informações Pessoais | Nome completo | yes | At least 3 characters |
| | CPF | yes | 11 to 14 characters (with or without punctuation) |
| | Data de nascimento | yes | `dd/mm/aaaa` |
| | Telefone | yes | At least 10 characters |
| Endereço | Rua | yes | |
| | Número | yes | A whole number greater than zero |
| | Bairro | yes | |
| | Cidade | yes | |
| Dados do voluntariado (volunteers only) | Data de inscrição | yes | |
| | Data de saída | no | Filling it in makes the volunteer **Inativo** |
| Dados do adotante (adopters only) | Data de cadastro | yes | |

**Actions:** **Salvar**, centered at the bottom.

**After saving:** a success toast appears, and the new person's page opens: `/voluntarios/[id]` or `/adotantes/[id]`.

### 6.3 Voluntário and adotante pages

**Routes:** `/voluntarios/[id]` and `/adotantes/[id]`

**Purpose:** view and edit one person.

**How you get here:** a card on Comunidade, or right after registering. Opening a volunteer's id under `/adotantes`, or the reverse, redirects to the correct address.

**Header:** a paw icon, the person's name, and a status tag:
- For volunteers: **Ativo** when there is no Data de saída, **Inativo** when there is one
- For adopters: **Adotante**

The subtitle reads "Ficha de cadastro do voluntário" or "Ficha de cadastro do adotante", and changes while editing.

**Content**
- **Personal and address fields:** the same as registration, locked until editing.
- **Dados do voluntariado:** Data de inscrição and Data de saída (volunteers only).
- **Dados do adotante:** Data de cadastro (adopters only).
- **Animais adotados** (adopters only): each adopted animal with its adoption date, linked to the animal's page. A deleted animal appears as "Nome (excluído)" with no link. When there are none: "Nenhum animal adotado".

**Footer actions**

| State | Buttons |
| --- | --- |
| Viewing | **← Voltar para lista** and **Editar Voluntário** (or **Editar Adotante**) |
| Editing | **← Voltar para lista**, **Salvar Alterações**, **Excluir** and **Cancelar** |

- If nothing changed, saving shows "Nenhum campo alterado".
- **Excluir** asks "Tem certeza que deseja excluir este voluntário?" (or adotante). An adopter with linked adoptions can't be deleted. The message explains that adoptions are linked to this person.

### 6.4 New clinic (`/clinicas/new`)

**Purpose:** register a partner vet clinic.

**How you get here:** **Cadastrar Clínica** on Comunidade, or the Início shortcut.

**Header:** "Dados da clínica", with the subtitle "Preencha os dados cadastrais da clínica parceira".

| Section | Field | Required | Rule |
| --- | --- | --- | --- |
| Informações da Clínica | Nome | yes | |
| | CNPJ | yes | 14 to 18 characters |
| | Telefone | yes | At least 10 characters |
| Endereço | Rua, Número, Bairro, Cidade | yes | Número must be a whole number greater than zero |

**Actions:** **Salvar** and **Cancelar**.

**After saving:** the toast "Clínica cadastrada com sucesso" appears, and the clinic list at `/clinicas` opens.

### 6.5 Clinic page (`/clinicas/[id]`)

**Purpose:** view and edit one clinic.

**How you get here:** a clínica card on Comunidade, or the edit icon in the `/clinicas` table.

**Content:** the same fields as registration, locked until editing.

**Actions:** the same flow as the person pages: Editar, then Salvar Alterações, Excluir or Cancelar.

**Rules:** a clinic with registered consultations can't be deleted. The message explains that consultations are linked to it.

---

## 7. Gatis

A gatil is any housing location: a shelter room, a foster home, and so on.

### 7.1 Location list (`/gatis`)

**Purpose:** see every location and how many animals are in each.

**Header:** "Gatis", with the subtitle "Locais e setores de alojamento cadastrados", plus a **Cadastrar Gatil** button.

**Filter panel**
- **Pesquisar gatis...:** matches the name or the location type
- **Ordenar por:** Nome or Tipo
- **Ordem:** Ascendente or Descendente
- **Aplicar filtros**
- **Exibir:** 10, 20 (default), 50 or 100 per page

Below the panel: "Mostrando X de Y Gatis" and "Página N de M".

**Grid of cards** (three columns on large screens). Each card shows:
- the name, which is a link
- a status tag: **Ativo** in green or **Inativo** in red
- **Tipo de local**
- **Animais no local**: the number of animals there now
- a **Ver detalhes →** button

**Pagination:** **← Anterior**, "N / M", **Próxima →**.

**States:** "Carregando gatis...". When empty: "Nenhum gatil encontrado", with either "Tente ajustar os termos da sua pesquisa ou filtros" or "Cadastre um gatil para começar".

### 7.2 New location (`/gatis/new`)

**Purpose:** add a housing location.

**Header:** "Dados do gatil", with the subtitle "Preencha as informações para registrar um novo local de abrigo."

| Field | Required | Example |
| --- | --- | --- |
| Nome do Local | yes | "Lar Nenens" |
| Tipo de local | yes | "LT" |

**Actions:** **Cancelar** and **Salvar Gatil**.

**After saving:** the toast "Gatil cadastrado com sucesso" appears, and the location list opens. New locations start as **Ativo**.

### 7.3 Location page (`/gatis/[id]`)

**Purpose:** a location's details and its animals, past and present.

**Header:** the label "GATIL", the location name, "N animais no local", and a **← Voltar para os gatis** button.

**Dados do Gatil card**
- **Nome**, **Tipo de local** and **Status** (Ativo or Inativo), all locked until editing
- In view mode: an **Editar** button
- In edit mode: **Cancelar**, **Excluir** and **Salvar**

Saving shows "Gatil atualizado". Setting **Status** to **Inativo** removes the location from the dropdown used to move animals.

**Excluir rules** (after a confirmation):

| Situation | Result |
| --- | --- |
| Animals are housed here right now | Blocked: "Não é possível excluir porque há animais neste gatil. Mova-os para outro local primeiro." |
| Has animal history, but no current animals | Marked **Inativo** instead of deleted. The toast reads "Gatil desativado, pois possui histórico de animais". |
| Never housed an animal | Deleted. The toast reads "Gatil excluído com sucesso". |

After a deletion or deactivation, the location list opens.

**Animais neste local**
- One row per animal currently here: the name (linked to the animal's page) and "status · desde [date]".
- When empty: "Nenhum animal está aqui agora."

**Passaram por aqui** (only shown when there's history)
- One row per past stay: the animal's name and "[entry date] até [exit date]".
- Deleted animals appear as "Nome (excluído)" with no link.

---

## 8. Secondary pages and redirects

**Older list pages.** These aren't in the menu. The Comunidade page has mostly taken their place, but they still work:

| Route | Content |
| --- | --- |
| `/voluntarios` | A table of volunteers with search, sorting, items per page, edit and delete icons, and **Cadastrar Voluntário** |
| `/adotantes` | The same for adopters, with **Cadastrar Adotante** |
| `/clinicas` | A filtered table of clinics with edit and delete icons. New clinics land here after saving. |

**Redirects**

| Route | Goes to |
| --- | --- |
| `/pessoas/[id]` | `/voluntarios/[id]` or `/adotantes/[id]`, depending on the person's type |
| `/fichamedica?animalId=[id]` | `/animais/[id]/fichamedica` |
| `/fichamedica` with no animal | `/saude` |
| `/saude/fichas/new` | `/saude/consultas/new`, keeping the `animalId` if one was given |

---

## 9. Shared behaviour

**View, then edit.** Every record page opens read-only. **Editar** unlocks the fields and shows **Salvar Alterações**, **Excluir** and **Cancelar**. **Cancelar** always restores the last saved values.

**Dates.** Dates are typed as `dd/mm/aaaa` and validated. An invalid date shows "Data inválida. Use dd/mm/aaaa".

**Validation.** Form errors are listed in a red box at the top of the form, and the first one also appears as a toast.

**Deletion policy**

| Record | When deleted |
| --- | --- |
| Animal | Hidden and kept as history |
| Gatil | Deleted if it was never used. Deactivated if it has history. Blocked while it houses animals. |
| Consultation | Deleted, together with its medications |
| Medication | Deleted |
| Volunteer, adopter, clinic | Deleted, unless linked records exist (adoptions or consultations) |

**Suggestions.** The Motivo field on consultations and the Medicamento field on medications suggest values already used. New values are added automatically.

**Status labels**

| Record | Possible labels |
| --- | --- |
| Animal | Disponível, Adoção, Falecimento, Saiu |
| Volunteer | Ativo, Inativo |
| Gatil | Ativo, Inativo |

---

## 10. Known gaps

- **Sair da conta** links to `/logout`, but there is no page at that address, so clicking it shows a "not found" page.
- Login is a mock, and the other pages don't check for a session. Anyone with a link can open them.
- The sidebar also appears on the login screen, because the layout always renders it.
- The **Voluntários · Ativos** number on Início counts every volunteer, including inactive ones.
- "Esqueceu a senha?" has no action.
- The older `/voluntarios`, `/adotantes` and `/clinicas` lists still use an earlier visual style.
- `Docs/fluxo-de-paginas.md` still refers to `/localizacoes` routes. The app now uses `/gatis`.

---

## 11. Suggested demo script

1. **Login:** sign in with the demo account.
2. **Início:** walk through the six cards. Open a cat from Medicação pendente and a location from Gatis.
3. **Animais:**
   - Search the list.
   - Register a new animal, which opens its page.
   - Move it to a gatil through **Local atual**.
   - Record a weigh-in in **Histórico de peso**.
4. **Ficha médica:**
   - From the animal, open its ficha.
   - Add a **Nova consulta**, then a **Nova medicação** in it.
   - Show the next dose, then edit the medication.
5. **Saúde animal:** show both columns. Searching and opening a consultation.
6. **Comunidade:**
   - Register an adotante.
   - Open a clínica and show its edit flow.
7. **Gatis:**
   - Open the location used in step 3, showing the animal under "Animais neste local".
   - Show the Ativo/Inativo status and the deletion rules.
8. **Closing:** delete the demo animal. It disappears from the lists but still shows in the gatil's "Passaram por aqui".
