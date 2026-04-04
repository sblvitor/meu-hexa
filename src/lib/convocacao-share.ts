import type { Jogador, Posicao } from "@/data/jogadores"

/** Fundo opaco do poster — tom “papel de carta” (export + html-to-image). */
export const POSTER_BACKGROUND_HEX = "#f3efe6"

/** URL exibida e linkada no rodapé do poster de compartilhamento. */
export const SITE_DISPLAY_URL = "meuhexa.com.br"
export const SITE_FULL_URL = `https://${SITE_DISPLAY_URL}`

const SETORES: Array<{ titulo: string; posicoes: ReadonlyArray<Posicao> }> = [
  { titulo: "Goleiros", posicoes: ["GOL"] },
  { titulo: "Defensores", posicoes: ["ZAG", "LAT"] },
  { titulo: "Meio-campistas", posicoes: ["VOL", "MEI"] },
  { titulo: "Atacantes", posicoes: ["ATA"] },
]

export type SetorConvocacao = {
  titulo: string
  jogadores: Array<Jogador>
}

/**
 * Agrupa convocados por setor (goleiros / defesa / meio / ataque), preservando a ordem de convocação (`orderedIds`)
 * dentro de cada setor.
 */
export function groupJogadoresPorSetor(
  orderedIds: Array<string>,
  jogadorById: Map<string, Jogador>,
): Array<SetorConvocacao> {
  return SETORES.map(({ titulo, posicoes }) => {
    const set = new Set(posicoes)
    const jogadores = orderedIds
      .map((id) => jogadorById.get(id))
      .filter((j): j is Jogador => Boolean(j && set.has(j.posicao)))
    return { titulo, jogadores }
  }).filter((s) => s.jogadores.length > 0)
}

export function formatDataConvocacaoPt(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(date)
}
