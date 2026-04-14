import { describe, expect, it } from "vitest"

import {
  normalizeConvocacaoOrderedIds,
  normalizeSimuladorPayload,
  normalizeTierListState,
} from "@/lib/local-feature-storage"
import { GROUP_ORDER, GRUPOS } from "@/data/copa2026"
import { INITIAL_TIER_DEFINITIONS, POOL_ID } from "@/lib/tier-list-state"

function buildFullRanks() {
  const ranks = {} as Record<(typeof GROUP_ORDER)[number], Record<string, 1 | 2 | 3>>
  for (const groupId of GROUP_ORDER) {
    const [first, second, third] = GRUPOS[groupId]
    ranks[groupId] = {
      [first]: 1,
      [second]: 2,
      [third]: 3,
    }
  }
  return ranks
}

describe("normalizeConvocacaoOrderedIds", () => {
  it("remove ids inválidos e duplicatas preservando a ordem", () => {
    expect(
      normalizeConvocacaoOrderedIds(
        ["neymar", "fantasma", "neymar", "vini-jr"],
        new Set(["neymar", "vini-jr"]),
      ),
    ).toEqual(["neymar", "vini-jr"])
  })

  it("retorna lista vazia para entrada não-array", () => {
    expect(normalizeConvocacaoOrderedIds(null, new Set(["neymar"]))).toEqual([])
  })
})

describe("normalizeSimuladorPayload", () => {
  it("filtra ordem dos terceiros e remove vencedores incompatíveis com o chaveamento atual", () => {
    const thirds = GROUP_ORDER.map((groupId) => GRUPOS[groupId][2])
    const normalized = normalizeSimuladorPayload({
      v: 1,
      ranksByGroup: buildFullRanks(),
      thirdOrderInsertion: [thirds[3], "fantasma", thirds[0]],
      thirdOrderOverride: ["fantasma", thirds[1]],
      winners: {
        74: "ger",
        89: "bra",
        104: "ger",
      },
    })

    expect(normalized).not.toBeNull()
    expect(normalized?.thirdOrderInsertion).toEqual([
      thirds[3],
      thirds[0],
      ...thirds.filter((teamId) => teamId !== thirds[3] && teamId !== thirds[0]),
    ])
    expect(normalized?.thirdOrderOverride).toEqual([
      thirds[1],
      ...thirds.filter((teamId) => teamId !== thirds[1]),
    ])
    expect(normalized?.winners).toEqual({ 74: "ger" })
  })
})

describe("normalizeTierListState", () => {
  it("deduplica times e garante 48 seleções no total", () => {
    const tiers = INITIAL_TIER_DEFINITIONS.map((t) => ({ ...t }))
    const t0 = INITIAL_TIER_DEFINITIONS[0].id
    const items = {
      [POOL_ID]: ["bra"],
      [t0]: ["bra", "arg", "bra"],
    }
    const { items: next } = normalizeTierListState(tiers, items)
    expect(next[t0]).toEqual(["bra", "arg"])
    const all = Object.values(next).flat()
    expect(all.length).toBe(48)
    expect(new Set(all).size).toBe(48)
  })
})
