# Diagrama de classes

Modelo de dados do CadasPatas, lido de `prisma/schema.prisma`. Cada classe é uma tabela do PostgreSQL. As chaves primárias estão marcadas com `PK` e as chaves estrangeiras com `FK`. Campos com `?` são opcionais.

```mermaid
classDiagram
    direction LR

    class User {
        +String id PK
        +String? name
        +String email UK
        +String passwordHash
        +DateTime createdAt
        +DateTime updatedAt
    }

    class TipoPessoa {
        +String id PK
        +String tipo
        +String email
        +String senha
    }

    class Pessoa {
        +String id PK
        +String tipoId FK
        +String nome
        +String cpf
        +DateTime dataNascimento
        +String telefone
        +String rua
        +String cidade
        +Int numero
        +String bairro
        +DateTime dataInicio
        +DateTime? dataSaida
    }

    class Adocao {
        +String pessoaId PK FK
        +String animalId PK FK
        +DateTime dataAdocao
    }

    class Animal {
        +String id PK
        +String nome
        +String cor
        +String especie
        +String raca
        +String pelagem
        +Boolean sexo
        +Boolean fivFelv
        +DateTime? dataNascimento
        +DateTime dataChegada
        +String? motivoSaida
        +DateTime? dataSaida
        +String? foto
    }

    class Localizacao {
        +String id PK
        +String nome
        +String tipoLocal
        +Boolean ativo
    }

    class HistoricoLocalizacao {
        +String id PK
        +String animalId FK
        +String localizacaoId FK
        +String status
        +DateTime dataEntrada
        +DateTime? dataSaida
    }

    class Peso {
        +String id PK
        +String animalId FK
        +Float quantidadePeso
    }

    class HistoricoPeso {
        +String id PK
        +String animalId FK
        +String pesoId FK
        +String status
        +DateTime dataPesagem
    }

    class Clinica {
        +String id PK
        +String nome
        +String cnpj
        +String telefone
        +String rua
        +String cidade
        +Int numero
        +String bairro
    }

    class Motivo {
        +String id PK
        +String nome
    }

    class Consulta {
        +String id PK
        +String clinicaId FK
        +String animalId FK
        +String motivoId FK
        +String observacao
        +DateTime dataAtendimento
        +DateTime? dataRetorno
    }

    class Medicamento {
        +String id PK
        +String nome
    }

    class Prescreve {
        +String id PK
        +String consultaId FK
        +String medicamentoId FK
        +String? tipo
        +String dosagem
        +Int quantidade
        +String frequencia
        +String duracaoTratamento
    }

    TipoPessoa "1" -- "0..*" Pessoa : classifica
    Pessoa "1" -- "0..*" Adocao : realiza
    Animal "1" -- "0..*" Adocao : é adotado em

    Animal "1" -- "0..*" HistoricoLocalizacao : possui
    Localizacao "1" -- "0..*" HistoricoLocalizacao : registra

    Animal "1" -- "0..*" Peso : tem
    Animal "1" -- "0..*" HistoricoPeso : possui
    Peso "1" -- "0..*" HistoricoPeso : registrado em

    Clinica "1" -- "0..*" Consulta : realiza
    Animal "1" -- "0..*" Consulta : passa por
    Motivo "1" -- "0..*" Consulta : justifica

    Consulta "1" -- "0..*" Prescreve : gera
    Medicamento "1" -- "0..*" Prescreve : é prescrito em
```

## Legenda

| Marca | Significado |
| --- | --- |
| `PK` | Chave primária |
| `FK` | Chave estrangeira |
| `UK` | Valor único |
| `?` | Campo opcional |

## Chaves estrangeiras

| Tabela | Campo | Referencia |
| --- | --- | --- |
| `Pessoa` | `tipoId` | `TipoPessoa.id` |
| `Adocao` | `pessoaId` | `Pessoa.id` |
| `Adocao` | `animalId` | `Animal.id` |
| `HistoricoLocalizacao` | `animalId` | `Animal.id` |
| `HistoricoLocalizacao` | `localizacaoId` | `Localizacao.id` |
| `Peso` | `animalId` | `Animal.id` |
| `HistoricoPeso` | `animalId` | `Animal.id` |
| `HistoricoPeso` | `pesoId` | `Peso.id` |
| `Consulta` | `clinicaId` | `Clinica.id` |
| `Consulta` | `animalId` | `Animal.id` |
| `Consulta` | `motivoId` | `Motivo.id` |
| `Prescreve` | `consultaId` | `Consulta.id` |
| `Prescreve` | `medicamentoId` | `Medicamento.id` |

## Observações

- `Adocao` é uma classe de associação entre `Pessoa` e `Animal`. A chave primária é composta por `pessoaId` e `animalId`, então a mesma pessoa não adota o mesmo animal duas vezes.
- `Prescreve` liga `Consulta` e `Medicamento`, mas tem `id` próprio e guarda os dados da prescrição.
- `User` não se relaciona com nenhuma outra tabela. Ele é usado só para o login.
