import { describe, expect, it } from "vitest"
import type {AllGroupResults} from "@/lib/copa2026-bracket";
import type {GroupId} from "@/data/copa2026";
import {
  
  R32_MATCHES,
  buildR32Pairings,
  lookupThirdByWinner
} from "@/lib/copa2026-bracket"
import { GRUPOS  } from "@/data/copa2026"
import r32ThirdPlaceMap from "@/data/r32-third-place-map.json"

function fakeGroupResults(): AllGroupResults {
  const out = {} as AllGroupResults
  for (const g of Object.keys(GRUPOS) as Array<GroupId>) {
    const [a, b, c, d] = GRUPOS[g]
    out[g] = { first: a, second: b, third: c, fourth: d }
  }
  return out
}

function groupOfTeam(tid: string): GroupId {
  for (const g of Object.keys(GRUPOS) as Array<GroupId>) {
    if (GRUPOS[g].includes(tid)) return g
  }
  throw new Error(tid)
}

describe("r32-third-place-map", () => {
  it("tem 495 chaves únicas de 8 letras", () => {
    const keys = Object.keys(r32ThirdPlaceMap)
    expect(keys).toHaveLength(495)
    for (const k of keys) {
      expect(k).toMatch(/^[A-L]{8}$/)
      expect(new Set(k.split("")).size).toBe(8)
    }
  })

  it("cada combinação: 16 jogos R32, 32 times únicos, nenhum confronto intra-grupo", () => {
    const gr = fakeGroupResults()
    for (const [advKey, thirdByWinner] of Object.entries(r32ThirdPlaceMap)) {
      const advancing = new Set(advKey.split("") as Array<GroupId>)
      const pairings = buildR32Pairings(gr, thirdByWinner as never, advancing)
      const seen = new Set<string>()
      for (const m of R32_MATCHES) {
        const [x, y] = pairings[m.id]
        expect(x).toBeTruthy()
        expect(y).toBeTruthy()
        expect(seen.has(x!)).toBe(false)
        expect(seen.has(y!)).toBe(false)
        seen.add(x!)
        seen.add(y!)
        expect(groupOfTeam(x!)).not.toBe(groupOfTeam(y!))
      }
      expect(seen.size).toBe(32)
    }
  })

  it("lookupThirdByWinner encontra chave conhecida", () => {
    const row = lookupThirdByWinner("EFGHIJKL")
    expect(row).toBeTruthy()
    expect(row!.A).toBe("E")
  })
})
