import {
  createLocalizacaoSchema,
  listLocalizacoesResponseSchema,
  localizacaoListItemSchema,
  localizacaoPublicSchema,
  updateLocalizacaoSchema,
} from '@/schemas/localizacaoSchema'
import {
  localizacaoCreate,
  localizacaoDelete,
  localizacaoFindMany,
  localizacaoFindWithHistory,
  localizacaoUpdate,
} from './repo'

function totalAnimaisAtivos(animalIds: Iterable<string> | null | undefined) {
  if (!animalIds) return 0
  return new Set(animalIds).size
}

export async function listLocalizacoes(rawQuery: unknown) {
  const response = await localizacaoFindMany(rawQuery)
  const locais = response.items.map((row) =>
    localizacaoListItemSchema.parse({
      id: row.id,
      nome: row.nome,
      tipoLocal: row.tipoLocal,
      ativo: row.ativo,
      totalAnimais: totalAnimaisAtivos(row.historicos?.map((historico) => historico.animalId)),
    }),
  )
  return listLocalizacoesResponseSchema.parse({ ...response, items: locais })
}

export async function createLocalizacao(raw: unknown) {
  const data = createLocalizacaoSchema.parse(raw)
  const created = await localizacaoCreate(data)
  return localizacaoPublicSchema.parse(created)
}

export async function updateLocalizacao(id: string, raw: unknown) {
  const data = updateLocalizacaoSchema.parse(raw)
  const updated = await localizacaoUpdate(id, data)
  return localizacaoPublicSchema.parse(updated)
}

export type DeleteLocalizacaoResult =
  | { ok: true; action: 'excluido' | 'desativado'; id: string }
  | { ok: false; status: 404 | 409; message: string }

export async function deleteLocalizacao(id: string): Promise<DeleteLocalizacaoResult> {
  const local = await localizacaoFindWithHistory(id)

  if (!local) {
    return { ok: false, status: 404, message: 'Gatil não encontrado' }
  }

  if (local.historicos.length > 0) {
    return {
      ok: false,
      status: 409,
      message: 'Não é possível excluir porque há animais neste gatil. Mova-os para outro local primeiro.',
    }
  }

  if (local._count.historicos > 0) {
    await localizacaoUpdate(id, { ativo: false })
    return { ok: true, action: 'desativado', id }
  }

  await localizacaoDelete(id)
  return { ok: true, action: 'excluido', id }
}
