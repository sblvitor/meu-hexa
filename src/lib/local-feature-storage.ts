import { createClientOnlyFn } from "@tanstack/react-start"
import type { ItemsByContainer, TierDefinition } from "@/lib/tier-list-state"
import type { GroupId, GroupRankByTeam, GroupResult } from "@/data/copa2026"
import {
  GROUP_ORDER,
  GRUPOS,
  SELECOES,
  buildAllGroupResults,
  buildProvisionalGroupResults,
} from "@/data/copa2026"
import {
  KO_PARENTS,
  R32_MATCHES,
  advancingThirdGroupsFromOrder,
  advancingThirdGroupsKey,
  buildR32Pairings,
  computeMatchTeams,
  lookupThirdByWinner,
  lookupThirdByWinnerPartial,
} from "@/lib/copa2026-bracket"
import {
  MAX_TIERS,
  POOL_ID,
  createInitialItems,
  createInitialTiers,
  defaultTeamIdsOrdered,
} from "@/lib/tier-list-state"

const STORAGE_V = 1 as const

export const LS_KEY_CONVOCACAO = "meu-hexa:convocacao"
export const LS_KEY_SIMULADOR = "meu-hexa:simulador"
export const LS_KEY_TIER_LIST = "meu-hexa:tier-list"

const MAX_CONVOCADOS = 26

const SELECAO_IDS = new Set(SELECOES.map((t) => t.id))
const KO_MATCH_ORDER = [...R32_MATCHES.map((m) => m.id), ...Object.keys(KO_PARENTS).map(Number)].sort(
  (a, b) => a - b,
)

const KO_MATCH_IDS = (() => {
  const s = new Set<number>()
  for (const m of R32_MATCHES) s.add(m.id)
  for (const k of Object.keys(KO_PARENTS)) s.add(Number(k))
  return s
})()

const getStorageItem = createClientOnlyFn((key: string) => {
  return window.localStorage.getItem(key)
})

const setStorageItem = createClientOnlyFn((key: string, value: string) => {
  window.localStorage.setItem(key, value)
})

const removeStorageItem = createClientOnlyFn((key: string) => {
  window.localStorage.removeItem(key)
})

function parseJson(raw: string | null): unknown {
  if (raw == null || raw === "") return null
  try {
    return JSON.parse(raw) as unknown
  } catch {
    return null
  }
}

// --- Convocação ---

type ConvocacaoStoredV1 = {
  v: typeof STORAGE_V
  orderedIds: Array<string>
}

function normalizeSelectedIds(
  ids: unknown,
  validIds: ReadonlySet<string>,
  limit?: number,
): Array<string> {
  if (!Array.isArray(ids)) return []
  const out: Array<string> = []
  const seen = new Set<string>()
  for (const id of ids) {
    if (typeof id !== "string" || !validIds.has(id) || seen.has(id)) continue
    seen.add(id)
    out.push(id)
    if (typeof limit === "number" && out.length >= limit) break
  }
  return out
}

export function normalizeConvocacaoOrderedIds(
  ids: unknown,
  validIds: ReadonlySet<string>,
): Array<string> {
  return normalizeSelectedIds(ids, validIds, MAX_CONVOCADOS)
}

export function readConvocacaoOrderedIds(validIds: ReadonlySet<string>): Array<string> | null {
  const raw = getStorageItem(LS_KEY_CONVOCACAO)
  if (raw == null) return null
  const data = parseJson(raw)
  if (!data || typeof data !== "object") return null
  const rec = data as Record<string, unknown>
  if (rec.v !== STORAGE_V) return null
  return normalizeConvocacaoOrderedIds(rec.orderedIds, validIds)
}

export function writeConvocacao(
  orderedIds: Array<string>,
  validIds: ReadonlySet<string>,
): void {
  try {
    const normalized = normalizeConvocacaoOrderedIds(orderedIds, validIds)
    if (normalized.length === 0) {
      removeStorageItem(LS_KEY_CONVOCACAO)
      return
    }
    const payload: ConvocacaoStoredV1 = {
      v: STORAGE_V,
      orderedIds: normalized,
    }
    setStorageItem(LS_KEY_CONVOCACAO, JSON.stringify(payload))
  } catch {
    /* quota / private mode */
  }
}

export function clearConvocacao(): void {
  try {
    removeStorageItem(LS_KEY_CONVOCACAO)
  } catch {
    /* ignore */
  }
}

// --- Simulador ---

export type SimuladorStoredV1 = {
  v: typeof STORAGE_V
  ranksByGroup: Record<GroupId, GroupRankByTeam>
  thirdOrderOverride: Array<string> | null
  thirdOrderInsertion: Array<string>
  winners: Partial<Record<number, string>>
}

export function defaultRanksByGroup(): Record<GroupId, GroupRankByTeam> {
  const o = {} as Record<GroupId, GroupRankByTeam>
  for (const g of GROUP_ORDER) {
    o[g] = {}
  }
  return o
}

function hasAnyRanksByGroup(ranksByGroup: Record<GroupId, GroupRankByTeam>): boolean {
  return GROUP_ORDER.some((g) => Object.keys(ranksByGroup[g]).length > 0)
}

function normalizeRanksByGroup(raw: unknown): Record<GroupId, GroupRankByTeam> {
  const out = defaultRanksByGroup()
  if (!raw || typeof raw !== "object") return out
  const obj = raw as Record<string, unknown>
  for (const g of GROUP_ORDER) {
    const row = obj[g]
    if (!row || typeof row !== "object") continue
    const teamIds = GRUPOS[g]
    const teamSet = new Set(teamIds)
    const cleaned: GroupRankByTeam = {}
    for (const [tid, rankRaw] of Object.entries(row as Record<string, unknown>)) {
      if (!teamSet.has(tid)) continue
      const r =
        rankRaw === 1 || rankRaw === 2 || rankRaw === 3
          ? rankRaw
          : Number(rankRaw)
      if (r !== 1 && r !== 2 && r !== 3) continue
      cleaned[tid] = r
    }
    const final: GroupRankByTeam = {}
    const usedRanks = new Set<number>()
    for (const tid of teamIds) {
      const r = cleaned[tid]
      if (r !== 1 && r !== 2 && r !== 3) continue
      if (usedRanks.has(r)) continue
      usedRanks.add(r)
      final[tid] = r
    }
    out[g] = final
  }
  return out
}

function normalizeWinners(raw: unknown): Partial<Record<number, string>> {
  if (!raw || typeof raw !== "object") return {}
  const out: Partial<Record<number, string>> = {}
  for (const [k, teamId] of Object.entries(raw as Record<string, unknown>)) {
    const matchId = Number(k)
    if (!Number.isInteger(matchId) || !KO_MATCH_IDS.has(matchId)) continue
    if (typeof teamId !== "string" || !SELECAO_IDS.has(teamId)) continue
    out[matchId] = teamId
  }
  return out
}

function currentThirdIds(
  provisionalGr: Record<GroupId, Partial<GroupResult>>,
): Array<string> {
  const out: Array<string> = []
  const seen = new Set<string>()
  for (const g of GROUP_ORDER) {
    const third = provisionalGr[g].third
    if (!third || seen.has(third)) continue
    seen.add(third)
    out.push(third)
  }
  return out
}

function mergeOrderedCurrentIds(raw: unknown, currentIds: Array<string>): Array<string> {
  const currentSet = new Set(currentIds)
  const kept = normalizeSelectedIds(raw, currentSet)
  const seen = new Set(kept)
  for (const id of currentIds) {
    if (seen.has(id)) continue
    seen.add(id)
    kept.push(id)
  }
  return kept
}

function normalizeWinnersAgainstBracket(
  raw: unknown,
  r32Pairings: Record<number, [string | null, string | null]>,
): Partial<Record<number, string>> {
  const saved = normalizeWinners(raw)
  const accepted: Partial<Record<number, string>> = {}

  for (const matchId of KO_MATCH_ORDER) {
    const winnerId = saved[matchId]
    if (!winnerId) continue
    const currentTeams = computeMatchTeams(r32Pairings, accepted)
    const [home, away] = currentTeams[matchId] ?? [null, null]
    if (winnerId === home || winnerId === away) {
      accepted[matchId] = winnerId
    }
  }

  return accepted
}

function isPristineSimuladorState(state: Omit<SimuladorStoredV1, "v">): boolean {
  return (
    !hasAnyRanksByGroup(state.ranksByGroup) &&
    state.thirdOrderOverride === null &&
    state.thirdOrderInsertion.length === 0 &&
    Object.keys(state.winners).length === 0
  )
}

export function normalizeSimuladorPayload(raw: unknown): SimuladorStoredV1 | null {
  if (!raw || typeof raw !== "object") return null
  const o = raw as Record<string, unknown>
  if (o.v !== STORAGE_V) return null

  const ranksByGroup = normalizeRanksByGroup(o.ranksByGroup)
  const provisionalGr = buildProvisionalGroupResults(ranksByGroup)
  const currentThirdTeamIds = currentThirdIds(provisionalGr)
  const thirdOrderInsertion = mergeOrderedCurrentIds(
    o.thirdOrderInsertion,
    currentThirdTeamIds,
  )

  let thirdOrderOverride: Array<string> | null = null
  if (Array.isArray(o.thirdOrderOverride)) {
    const mergedOverride = mergeOrderedCurrentIds(
      o.thirdOrderOverride,
      currentThirdTeamIds,
    )
    thirdOrderOverride = mergedOverride.length > 0 ? mergedOverride : null
  }

  const thirdOrder = thirdOrderOverride ?? thirdOrderInsertion
  const allGr = buildAllGroupResults(ranksByGroup)
  const advancingKey =
    allGr && thirdOrder.length === 12
      ? advancingThirdGroupsKey(thirdOrder, allGr)
      : null
  const thirdByWinnerOfficial =
    advancingKey !== null ? lookupThirdByWinner(advancingKey) : null
  const advancingSetUnified =
    advancingKey !== null
      ? new Set(advancingKey.split("") as Array<GroupId>)
      : advancingThirdGroupsFromOrder(thirdOrder, provisionalGr)
  const thirdByWinnerUnified =
    advancingKey !== null
      ? thirdByWinnerOfficial
      : advancingSetUnified.size === 0
        ? null
        : lookupThirdByWinnerPartial(advancingSetUnified)
  const r32Pairings = buildR32Pairings(
    provisionalGr,
    thirdByWinnerUnified,
    advancingSetUnified,
  )
  const winners = normalizeWinnersAgainstBracket(o.winners, r32Pairings)

  return {
    v: STORAGE_V,
    ranksByGroup,
    thirdOrderOverride,
    thirdOrderInsertion,
    winners,
  }
}

export function readSimulador(): SimuladorStoredV1 | null {
  const raw = getStorageItem(LS_KEY_SIMULADOR)
  if (raw == null) return null
  return normalizeSimuladorPayload(parseJson(raw))
}

export function writeSimulador(state: Omit<SimuladorStoredV1, "v">): void {
  try {
    const normalized = normalizeSimuladorPayload({
      v: STORAGE_V,
      ...state,
    })
    if (!normalized) return
    const payload: SimuladorStoredV1 = normalized
    if (isPristineSimuladorState(payload)) {
      removeStorageItem(LS_KEY_SIMULADOR)
      return
    }
    setStorageItem(LS_KEY_SIMULADOR, JSON.stringify(payload))
  } catch {
    /* ignore */
  }
}

export function clearSimuladorStorage(): void {
  try {
    removeStorageItem(LS_KEY_SIMULADOR)
  } catch {
    /* ignore */
  }
}

// --- Tier list ---

type TierListStoredV1 = {
  v: typeof STORAGE_V
  tiers: Array<TierDefinition>
  items: ItemsByContainer
}

function sanitizeTiers(raw: unknown): Array<TierDefinition> {
  if (!Array.isArray(raw)) return createInitialTiers()
  const out: Array<TierDefinition> = []
  const seenIds = new Set<string>()
  for (const row of raw) {
    if (out.length >= MAX_TIERS) break
    if (!row || typeof row !== "object") continue
    const t = row as Partial<TierDefinition>
    if (typeof t.id !== "string" || !t.id || seenIds.has(t.id)) continue
    if (typeof t.label !== "string") continue
    seenIds.add(t.id)
    const def: TierDefinition = {
      id: t.id,
      label: t.label.slice(0, 80),
    }
    if (typeof t.labelBg === "string" && /^#[0-9A-Fa-f]{6}$/.test(t.labelBg)) {
      def.labelBg = t.labelBg
    }
    out.push(def)
  }
  return out.length > 0 ? out : createInitialTiers()
}

export function normalizeTierListState(
  tiersRaw: unknown,
  itemsRaw: unknown,
): { tiers: Array<TierDefinition>; items: ItemsByContainer } {
  const tiers = sanitizeTiers(tiersRaw)
  const tierIds = tiers.map((t) => t.id)
  const tierIdSet = new Set(tierIds)

  const nextItems: ItemsByContainer = { [POOL_ID]: [] }
  for (const id of tierIds) nextItems[id] = []

  const items =
    itemsRaw && typeof itemsRaw === "object" ? (itemsRaw as ItemsByContainer) : {}

  const containerOrder = [...tierIds, POOL_ID]
  const seenTeams = new Set<string>()

  for (const cid of containerOrder) {
    const list = items[cid]
    if (!Array.isArray(list)) continue
    for (const tid of list) {
      if (typeof tid !== "string" || !SELECAO_IDS.has(tid) || seenTeams.has(tid)) {
        continue
      }
      seenTeams.add(tid)
      nextItems[cid].push(tid)
    }
  }

  for (const [cid, list] of Object.entries(items)) {
    if (cid === POOL_ID || tierIdSet.has(cid)) continue
    if (!Array.isArray(list)) continue
    for (const tid of list) {
      if (typeof tid !== "string" || !SELECAO_IDS.has(tid) || seenTeams.has(tid)) {
        continue
      }
      seenTeams.add(tid)
      nextItems[POOL_ID].push(tid)
    }
  }

  for (const tid of defaultTeamIdsOrdered()) {
    if (!seenTeams.has(tid)) {
      seenTeams.add(tid)
      nextItems[POOL_ID].push(tid)
    }
  }

  return { tiers, items: nextItems }
}

function defaultTierListState(): {
  tiers: Array<TierDefinition>
  items: ItemsByContainer
} {
  const tiers = createInitialTiers()
  return { tiers, items: createInitialItems(tiers) }
}

function isPristineTierListState(state: {
  tiers: Array<TierDefinition>
  items: ItemsByContainer
}): boolean {
  const initial = defaultTierListState()
  return JSON.stringify(state) === JSON.stringify(initial)
}

export function readTierList(): { tiers: Array<TierDefinition>; items: ItemsByContainer } | null {
  const raw = getStorageItem(LS_KEY_TIER_LIST)
  if (raw == null) return null
  const data = parseJson(raw)
  if (!data || typeof data !== "object") return null
  const o = data as Record<string, unknown>
  if (o.v !== STORAGE_V) return null
  return normalizeTierListState(o.tiers, o.items)
}

export function writeTierList(
  tiers: Array<TierDefinition>,
  items: ItemsByContainer,
): void {
  try {
    const normalized = normalizeTierListState(tiers, items)
    if (isPristineTierListState(normalized)) {
      removeStorageItem(LS_KEY_TIER_LIST)
      return
    }
    const payload: TierListStoredV1 = {
      v: STORAGE_V,
      tiers: normalized.tiers,
      items: normalized.items,
    }
    setStorageItem(LS_KEY_TIER_LIST, JSON.stringify(payload))
  } catch {
    /* ignore */
  }
}

export function clearTierListStorage(): void {
  try {
    removeStorageItem(LS_KEY_TIER_LIST)
  } catch {
    /* ignore */
  }
}

export function initialTierListFromStorageOrDefault(): {
  tiers: Array<TierDefinition>
  items: ItemsByContainer
} {
  const stored = readTierList()
  if (stored) return stored
  return defaultTierListState()
}
