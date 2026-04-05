/** Copa do Mundo FIFA 2026 — grupos após sorteio (Wikipedia / FIFA). */

export type GroupId =
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F"
  | "G"
  | "H"
  | "I"
  | "J"
  | "K"
  | "L"

export type Selecao = {
  id: string
  nome: string
  /** ISO 3166-1 alpha-2 para https://flagcdn.com/w40/{iso2}.png */
  iso2: string
}

export const GROUP_ORDER: Array<GroupId> = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
]

export const SELECOES: Array<Selecao> = [
  { id: "mex", nome: "México", iso2: "mx" },
  { id: "rsa", nome: "África do Sul", iso2: "za" },
  { id: "kor", nome: "Coreia do Sul", iso2: "kr" },
  { id: "cze", nome: "República Tcheca", iso2: "cz" },
  { id: "can", nome: "Canadá", iso2: "ca" },
  { id: "bih", nome: "Bósnia e Herzegovina", iso2: "ba" },
  { id: "qat", nome: "Catar", iso2: "qa" },
  { id: "sui", nome: "Suíça", iso2: "ch" },
  { id: "bra", nome: "Brasil", iso2: "br" },
  { id: "mar", nome: "Marrocos", iso2: "ma" },
  { id: "hat", nome: "Haiti", iso2: "ht" },
  { id: "sco", nome: "Escócia", iso2: "gb-sct" },
  { id: "usa", nome: "Estados Unidos", iso2: "us" },
  { id: "par", nome: "Paraguai", iso2: "py" },
  { id: "aus", nome: "Austrália", iso2: "au" },
  { id: "tur", nome: "Turquia", iso2: "tr" },
  { id: "ger", nome: "Alemanha", iso2: "de" },
  { id: "cuw", nome: "Curaçao", iso2: "cw" },
  { id: "civ", nome: "Costa do Marfim", iso2: "ci" },
  { id: "ecu", nome: "Equador", iso2: "ec" },
  { id: "ned", nome: "Holanda", iso2: "nl" },
  { id: "jpn", nome: "Japão", iso2: "jp" },
  { id: "swe", nome: "Suécia", iso2: "se" },
  { id: "tun", nome: "Tunísia", iso2: "tn" },
  { id: "bel", nome: "Bélgica", iso2: "be" },
  { id: "egy", nome: "Egito", iso2: "eg" },
  { id: "irn", nome: "Irã", iso2: "ir" },
  { id: "nzl", nome: "Nova Zelândia", iso2: "nz" },
  { id: "esp", nome: "Espanha", iso2: "es" },
  { id: "cpv", nome: "Cabo Verde", iso2: "cv" },
  { id: "ksa", nome: "Arábia Saudita", iso2: "sa" },
  { id: "uru", nome: "Uruguai", iso2: "uy" },
  { id: "fra", nome: "França", iso2: "fr" },
  { id: "sen", nome: "Senegal", iso2: "sn" },
  { id: "irq", nome: "Iraque", iso2: "iq" },
  { id: "nor", nome: "Noruega", iso2: "no" },
  { id: "arg", nome: "Argentina", iso2: "ar" },
  { id: "alg", nome: "Argélia", iso2: "dz" },
  { id: "aut", nome: "Áustria", iso2: "at" },
  { id: "jor", nome: "Jordânia", iso2: "jo" },
  { id: "por", nome: "Portugal", iso2: "pt" },
  { id: "cod", nome: "RD Congo", iso2: "cd" },
  { id: "uzb", nome: "Uzbequistão", iso2: "uz" },
  { id: "col", nome: "Colômbia", iso2: "co" },
  { id: "eng", nome: "Inglaterra", iso2: "gb-eng" },
  { id: "cro", nome: "Croácia", iso2: "hr" },
  { id: "gha", nome: "Gana", iso2: "gh" },
  { id: "pan", nome: "Panamá", iso2: "pa" },
]

const byId = Object.fromEntries(SELECOES.map((t) => [t.id, t])) as Record<
  string,
  Selecao
>

export function getSelecao(id: string): Selecao | undefined {
  return byId[id]
}

/** Larguras suportadas pelo flagcdn (w* fixo) — ver https://flagpedia.net/download/api */
const FLAGCDN_WIDTHS = [20, 40, 80, 160, 320, 640, 1280, 2560] as const

function nearestFlagcdnWidth(requested: number): (typeof FLAGCDN_WIDTHS)[number] {
  const r = Math.max(16, Math.round(requested))
  let best: (typeof FLAGCDN_WIDTHS)[number] = FLAGCDN_WIDTHS[0]
  let bestDiff = Math.abs(best - r)
  for (const cur of FLAGCDN_WIDTHS) {
    const d = Math.abs(cur - r)
    if (d < bestDiff) {
      best = cur
      bestDiff = d
    }
  }
  return best
}

export function flagUrl(iso2: string, w = 40): string {
  const width = nearestFlagcdnWidth(w)
  const code = iso2.toLowerCase().trim()
  return `https://flagcdn.com/w${width}/${code}.png`
}

/** 4 `teamId` por grupo, na ordem do sorteio FIFA. */
export const GRUPOS: Record<GroupId, Array<string>> = {
  A: ["mex", "rsa", "kor", "cze"],
  B: ["can", "bih", "qat", "sui"],
  C: ["bra", "mar", "hat", "sco"],
  D: ["usa", "par", "aus", "tur"],
  E: ["ger", "cuw", "civ", "ecu"],
  F: ["ned", "jpn", "swe", "tun"],
  G: ["bel", "egy", "irn", "nzl"],
  H: ["esp", "cpv", "ksa", "uru"],
  I: ["fra", "sen", "irq", "nor"],
  J: ["arg", "alg", "aut", "jor"],
  K: ["por", "cod", "uzb", "col"],
  L: ["eng", "cro", "gha", "pan"],
}

/** Grupo (A–L) do `teamId` na tabela 2026. */
export function groupIdForTeam(teamId: string): GroupId | undefined {
  for (const g of GROUP_ORDER) {
    if (GRUPOS[g].includes(teamId)) return g
  }
  return undefined
}

export type GroupStandingsUser = Partial<Record<1 | 2 | 3 | 4, string>>

export type GroupResult = {
  first: string
  second: string
  third: string
  fourth: string
}

export type AllGroupResults = Record<GroupId, GroupResult>

/** Colocações já deduzíveis pelo que foi marcado (grupo pode ainda estar incompleto). */
export type ProvisionalGroupResult = Partial<GroupResult>

/** Mapa time → posição (1–3) por grupo; o 4º lugar é o time sem posição escolhida. */
export type GroupRankByTeam = Partial<Record<string, 1 | 2 | 3>>

export function buildAllGroupResults(
  ranksByGroup: Record<GroupId, GroupRankByTeam>,
): AllGroupResults | null {
  const out = {} as AllGroupResults
  for (const g of GROUP_ORDER) {
    const pos = ranksByGroup[g]
    const teamIds = GRUPOS[g]
    const unplaced: Array<string> = []
    const inv: Partial<Record<1 | 2 | 3, string>> = {}
    for (const tid of teamIds) {
      const r = pos[tid]
      if (r === undefined) {
        unplaced.push(tid)
        continue
      }
      if (inv[r]) return null
      inv[r] = tid
    }
    if (unplaced.length !== 1) return null
    if (!inv[1] || !inv[2] || !inv[3]) return null
    out[g] = {
      first: inv[1],
      second: inv[2],
      third: inv[3],
      fourth: unplaced[0],
    }
  }
  return out
}

/** 1º/2º/3º/4º parciais: só preenche o que já está definido nas escolhas do grupo. */
export function buildProvisionalGroupResults(
  ranksByGroup: Record<GroupId, GroupRankByTeam>,
): Record<GroupId, ProvisionalGroupResult> {
  const out = {} as Record<GroupId, ProvisionalGroupResult>
  for (const g of GROUP_ORDER) {
    const pos = { ...ranksByGroup[g] }
    const teamIds = GRUPOS[g]
    const row: ProvisionalGroupResult = {}
    const unplaced: Array<string> = []
    for (const tid of teamIds) {
      const raw = pos[tid]
      if (raw === undefined) {
        unplaced.push(tid)
        continue
      }
      const r = typeof raw === "number" ? raw : Number(raw)
      if (r !== 1 && r !== 2 && r !== 3) {
        unplaced.push(tid)
        continue
      }
      if (r === 1) row.first = tid
      if (r === 2) row.second = tid
      if (r === 3) row.third = tid
    }
    if (unplaced.length === 1) row.fourth = unplaced[0]
    out[g] = row
  }
  return out
}

/** `teamId` → colocação (1–4) dentro do grupo. */
export function standingsByTeam(
  picks: GroupStandingsUser,
): Record<string, 1 | 2 | 3 | 4> | null {
  const entries: Record<string, 1 | 2 | 3 | 4> = {}
  for (const r of [1, 2, 3, 4] as const) {
    const tid = picks[r]
    if (!tid) return null
    if (tid in entries) return null
    entries[tid] = r
  }
  if (Object.keys(entries).length !== 4) return null
  return entries
}

export function groupStandingsValid(picks: GroupStandingsUser): boolean {
  return standingsByTeam(picks) !== null
}
