import { describe, expect, it } from "vitest"
import type { GroupId, GroupRankByTeam } from "@/data/copa2026"
import { GROUP_ORDER, buildProvisionalGroupResults } from "@/data/copa2026"
import {
  advancingThirdGroupsFromOrder,
  buildR32Pairings,
  computeMatchTeams,
  lookupThirdByWinnerPartial,
} from "@/lib/copa2026-bracket"

function emptyRanks(): Record<GroupId, GroupRankByTeam> {
  const o = {} as Record<GroupId, GroupRankByTeam>
  for (const g of GROUP_ORDER) o[g] = {}
  return o
}

describe("provisional bracket", () => {
  it("1º do grupo C aparece na partida 76 (C1 x F2)", () => {
    const ranks = emptyRanks()
    ranks.C = { bra: 1 }
    const pg = buildProvisionalGroupResults(ranks)
    expect(pg.C.first).toBe("bra")
    const pair = buildR32Pairings(pg, null, null)
    expect(pair[76]).toEqual(["bra", null])
    const mt = computeMatchTeams(pair, {})
    expect(mt[76]).toEqual(["bra", null])
  })

  it("3º parcial entra no bracket (vaga 3m) conforme lista de melhores terceiros", () => {
    const ranks = emptyRanks()
    ranks.C = { mar: 3 }
    const pg = buildProvisionalGroupResults(ranks)
    expect(pg.C.third).toBe("mar")
    const thirdOrder = ["mar"]
    const adv = advancingThirdGroupsFromOrder(thirdOrder, pg)
    expect(adv.has("C")).toBe(true)
    const tbw = lookupThirdByWinnerPartial(adv)
    expect(tbw).not.toBeNull()
    if (tbw === null) throw new Error("lookupThirdByWinnerPartial")
    const pair = buildR32Pairings(pg, tbw, adv)
    const flat = Object.values(pair).flat(2)
    expect(flat.some((x) => x === "mar")).toBe(true)
  })
})
