import type { AllGroupResults, GroupId, GroupResult } from "@/data/copa2026"
import { GROUP_ORDER } from "@/data/copa2026"
import r32ThirdPlaceMap from "@/data/r32-third-place-map.json"

export type { AllGroupResults, GroupResult } from "@/data/copa2026"

export type MatchSlot =
  | { kind: "1"; group: GroupId }
  | { kind: "2"; group: GroupId }
  | { kind: "3"; group: GroupId }
  | {
      kind: "3m"
      winnerGroup: "A" | "B" | "D" | "E" | "G" | "I" | "K" | "L"
    }

export type R32MatchDef = {
  id: number
  home: MatchSlot
  away: MatchSlot
}

export const R32_MATCHES: Array<R32MatchDef> = [
  { id: 73, home: { kind: "2", group: "A" }, away: { kind: "2", group: "B" } },
  { id: 74, home: { kind: "1", group: "E" }, away: { kind: "3m", winnerGroup: "E" } },
  { id: 75, home: { kind: "1", group: "F" }, away: { kind: "2", group: "C" } },
  { id: 76, home: { kind: "1", group: "C" }, away: { kind: "2", group: "F" } },
  { id: 77, home: { kind: "1", group: "I" }, away: { kind: "3m", winnerGroup: "I" } },
  { id: 78, home: { kind: "2", group: "E" }, away: { kind: "2", group: "I" } },
  { id: 79, home: { kind: "1", group: "A" }, away: { kind: "3m", winnerGroup: "A" } },
  { id: 80, home: { kind: "1", group: "L" }, away: { kind: "3m", winnerGroup: "L" } },
  { id: 81, home: { kind: "1", group: "D" }, away: { kind: "3m", winnerGroup: "D" } },
  { id: 82, home: { kind: "1", group: "G" }, away: { kind: "3m", winnerGroup: "G" } },
  { id: 83, home: { kind: "2", group: "K" }, away: { kind: "2", group: "L" } },
  { id: 84, home: { kind: "1", group: "H" }, away: { kind: "2", group: "J" } },
  { id: 85, home: { kind: "1", group: "B" }, away: { kind: "3m", winnerGroup: "B" } },
  { id: 86, home: { kind: "1", group: "J" }, away: { kind: "2", group: "H" } },
  { id: 87, home: { kind: "1", group: "K" }, away: { kind: "3m", winnerGroup: "K" } },
  { id: 88, home: { kind: "2", group: "D" }, away: { kind: "2", group: "G" } },
]

/** Legenda curta da vaga (R32). */
export function formatMatchSlot(slot: MatchSlot): string {
  if (slot.kind === "1") return `1º ${slot.group}`
  if (slot.kind === "2") return `2º ${slot.group}`
  if (slot.kind === "3") return `3º ${slot.group}`
  return `3º rep. ${slot.winnerGroup}`
}

/** Linha auxiliar no card do jogo (somente R32). */
export function r32MatchSlotCaption(matchId: number): string | null {
  const def = R32_MATCHES.find((m) => m.id === matchId)
  if (!def) return null
  return `${formatMatchSlot(def.home)} × ${formatMatchSlot(def.away)}`
}

export type ThirdByWinner = Record<
  "A" | "B" | "D" | "E" | "G" | "I" | "K" | "L",
  GroupId
>

const R32_MAP = r32ThirdPlaceMap as Record<string, ThirdByWinner>

export function advancingThirdGroupsKey(
  thirdOrderTeamIds: Array<string>,
  groupResults: AllGroupResults,
): string | null {
  const top8 = thirdOrderTeamIds.slice(0, 8)
  const letters: Array<GroupId> = []
  for (const tid of top8) {
    let found: GroupId | undefined
    for (const g of Object.keys(groupResults) as Array<GroupId>) {
      if (groupResults[g].third === tid) {
        found = g
        break
      }
    }
    if (!found) return null
    letters.push(found)
  }
  if (new Set(letters).size !== 8) return null
  return [...letters].sort().join("")
}

export function lookupThirdByWinner(advancingKey: string): ThirdByWinner | null {
  return R32_MAP[advancingKey] ?? null
}

/** Grupos cujo 3º entra no top 8 *provisório* conforme a lista ordenada (melhores terceiros). */
export function advancingThirdGroupsFromOrder(
  thirdOrderTeamIds: Array<string>,
  gr: Record<GroupId, Partial<GroupResult>>,
): Set<GroupId> {
  const s = new Set<GroupId>()
  for (const tid of thirdOrderTeamIds.slice(0, 8)) {
    for (const g of GROUP_ORDER) {
      if (gr[g].third === tid) {
        s.add(g)
        break
      }
    }
  }
  return s
}

/**
 * Sem chave completa dos 8 terceiros: escolhe a primeira linha do mapa cuja
 * combinação contém todos os grupos em `advancingThirdGroups`, para preencher
 * as vagas 3m de forma consistente até fechar o simulador.
 */
export function lookupThirdByWinnerPartial(
  advancingThirdGroups: Set<GroupId>,
): ThirdByWinner | null {
  if (advancingThirdGroups.size === 0) return null
  const keys = Object.keys(R32_MAP).sort()
  for (const key of keys) {
    const kset = new Set(key.split("") as Array<GroupId>)
    let ok = true
    for (const g of advancingThirdGroups) {
      if (!kset.has(g)) {
        ok = false
        break
      }
    }
    if (!ok) continue
    return R32_MAP[key]
  }
  return null
}

function resolveSlot(
  slot: MatchSlot,
  gr: Record<GroupId, Partial<GroupResult>>,
  thirdByWinner: ThirdByWinner | null,
  advancingSet: Set<GroupId> | null,
): string | null {
  const adv = advancingSet ?? new Set<GroupId>()
  const row = (g: GroupId) => gr[g]
  if (slot.kind === "1") return row(slot.group).first ?? null
  if (slot.kind === "2") return row(slot.group).second ?? null
  if (slot.kind === "3") {
    if (!adv.has(slot.group)) return null
    return row(slot.group).third ?? null
  }
  if (!thirdByWinner) return null
  const g = thirdByWinner[slot.winnerGroup]
  if (!adv.has(g)) return null
  return row(g).third ?? null
}

export function buildR32Pairings(
  gr: Record<GroupId, Partial<GroupResult>>,
  thirdByWinner: ThirdByWinner | null,
  advancingThirdGroups: Set<GroupId> | null,
): Record<number, [string | null, string | null]> {
  const out: Record<number, [string | null, string | null]> = {}
  for (const m of R32_MATCHES) {
    out[m.id] = [
      resolveSlot(m.home, gr, thirdByWinner, advancingThirdGroups),
      resolveSlot(m.away, gr, thirdByWinner, advancingThirdGroups),
    ]
  }
  return out
}

export const KO_PARENTS: Record<number, readonly [number, number] | null> = {
  89: [74, 77],
  90: [73, 75],
  91: [76, 78],
  92: [79, 80],
  93: [83, 84],
  94: [81, 82],
  95: [86, 88],
  96: [85, 87],
  97: [89, 90],
  98: [93, 94],
  99: [91, 92],
  100: [95, 96],
  101: [97, 98],
  102: [99, 100],
  103: null,
  104: null,
}

const KO_CHILDREN: Record<number, Array<number>> = (() => {
  const ch: Record<number, Array<number>> = {}
  for (const [cid, par] of Object.entries(KO_PARENTS)) {
    if (!par) continue
    const id = Number(cid)
    for (const p of par) {
      ch[p] = ch[p] ?? []
      ch[p].push(id)
    }
  }
  for (const semi of [101, 102]) {
    for (const x of [103, 104]) {
      ch[semi] = ch[semi] ?? []
      if (!ch[semi].includes(x)) ch[semi].push(x)
    }
  }
  return ch
})()

export function descendantWinnerMatchIds(fromMatchId: number): Array<number> {
  const out: Array<number> = []
  const seen = new Set<number>()
  const stack = [...(KO_CHILDREN[fromMatchId] ?? [])]
  while (stack.length) {
    const m = stack.pop()!
    if (seen.has(m)) continue
    seen.add(m)
    out.push(m)
    stack.push(...(KO_CHILDREN[m] ?? []))
  }
  return out
}

/** Aplica vitória em `matchId` e remove vencedores escolhidos nas partidas descendentes. */
export function applyWinnerPick(
  matchId: number,
  teamId: string,
  winners: Partial<Record<number, string>>,
): Partial<Record<number, string>> {
  const drop = descendantWinnerMatchIds(matchId)
  const next = { ...winners, [matchId]: teamId }
  for (const id of drop) delete next[id]
  return next
}

export const THIRD_PLACE_MATCH = 103
export const FINAL_MATCH = 104

export type KoRound = "r32" | "r16" | "qf" | "sf" | "third" | "final"

export function koMatchRound(id: number): KoRound {
  if (id >= 73 && id <= 88) return "r32"
  if (id >= 89 && id <= 96) return "r16"
  if (id >= 97 && id <= 100) return "qf"
  if (id === 101 || id === 102) return "sf"
  if (id === 103) return "third"
  return "final"
}

const LEFT_R32 = new Set([
  73, 74, 75, 76, 77, 78, 79, 80, 81, 82,
])

export function koMatchSide(id: number): "left" | "right" {
  if (id >= 73 && id <= 88) return LEFT_R32.has(id) ? "left" : "right"
  if (id === 89 || id === 90 || id === 91 || id === 92) return "left"
  if (id === 93 || id === 94 || id === 95 || id === 96) return "right"
  if (id === 97 || id === 98) return "left"
  if (id === 99 || id === 100) return "right"
  if (id === 101) return "left"
  if (id === 102) return "right"
  return "left"
}

/**
 * Participantes exibidos em cada partida: após R32, cada lado é o vencedor da partida pai.
 */
export function computeMatchTeams(
  r32: Record<number, [string | null, string | null]>,
  winners: Partial<Record<number, string>>,
): Record<number, [string | null, string | null]> {
  const m: Record<number, [string | null, string | null]> = { ...r32 }

  for (const id of [
    89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102,
  ] as const) {
    const par = KO_PARENTS[id]
    if (!par) continue
    const [p1, p2] = par
    m[id] = [winners[p1] ?? null, winners[p2] ?? null]
  }

  const w101 = winners[101]
  const w102 = winners[102]
  const p101 = m[101]
  const p102 = m[102]
  if (w101 && w102 && p101[0] && p101[1] && p102[0] && p102[1]) {
    const l101 = p101[0] === w101 ? p101[1] : p101[0]
    const l102 = p102[0] === w102 ? p102[1] : p102[0]
    m[103] = [l101, l102]
  } else {
    m[103] = [null, null]
  }

  m[104] = [w101 ?? null, w102 ?? null]

  return m
}
