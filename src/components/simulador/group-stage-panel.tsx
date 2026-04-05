"use client"

import type { Dispatch, SetStateAction } from "react"
import type { GroupId, GroupRankByTeam } from "@/data/copa2026"
import { GROUP_ORDER, GRUPOS, getSelecao } from "@/data/copa2026"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TeamFlag } from "@/components/simulador/team-flag"
import { cn } from "@/lib/utils"

/** Largura das colunas 1º–3º — alinhar com o cabeçalho. */
const POS_COL = "w-9"
const POS_GAP = "gap-6"

function clearTeamRank(
  prev: Record<GroupId, GroupRankByTeam>,
  group: GroupId,
  teamId: string,
): Record<GroupId, GroupRankByTeam> {
  const g = { ...prev[group] }
  delete g[teamId]
  return { ...prev, [group]: g }
}

function setTeamRank(
  prev: Record<GroupId, GroupRankByTeam>,
  group: GroupId,
  teamId: string,
  rank: 1 | 2 | 3,
): Record<GroupId, GroupRankByTeam> {
  const g = { ...prev[group] }
  const victim = Object.entries(g).find(
    ([tid, r]) => r === rank && tid !== teamId,
  )?.[0]
  if (victim !== undefined) delete g[victim]
  g[teamId] = rank
  return { ...prev, [group]: g }
}

export function GroupStagePanel({
  ranksByGroup,
  onRanksChange,
}: {
  ranksByGroup: Record<GroupId, GroupRankByTeam>
  onRanksChange: Dispatch<
    SetStateAction<Record<GroupId, GroupRankByTeam>>
  >
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {GROUP_ORDER.map((g) => {
        const teamIds = GRUPOS[g]
        const ranks = { ...ranksByGroup[g] }
        return (
          <Card key={g} className="min-w-0 gap-0 overflow-visible py-0">
            <CardHeader
              className={cn(
                "flex flex-row flex-wrap items-center justify-between gap-x-3 gap-y-2",
                "border-b border-border/60 bg-muted/30 px-4 py-2.5!",
              )}
            >
              <CardTitle className="font-heading shrink-0 text-base leading-tight">
                Grupo {g}
              </CardTitle>
              <div
                className={cn(
                  "ml-auto flex min-w-0 items-center pr-1 leading-none",
                  POS_GAP,
                )}
                aria-label="Posições 1º, 2º e 3º"
              >
                <span className="text-muted-foreground shrink-0 text-xs font-medium tracking-wide">
                  Posição
                </span>
                {(["1º", "2º", "3º"] as const).map((label) => (
                  <span
                    key={label}
                    className={cn(
                      "flex shrink-0 justify-center text-xs font-medium tracking-wide text-muted-foreground",
                      POS_COL,
                    )}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              <table className="w-full min-w-[220px] text-sm">
                <tbody>
                  {teamIds.map((tid, i) => {
                    const t = getSelecao(tid)
                    const r = ranks[tid]
                    return (
                      <tr
                        key={tid}
                        className={cn(
                          "border-b border-border/50 last:border-b-0",
                          i % 2 === 1 && "bg-muted/15",
                        )}
                      >
                        <td className="min-w-0 px-4 py-2.5">
                          <div className="flex min-w-0 items-center gap-2">
                            <TeamFlag teamId={tid} size={20} />
                            <span className="min-w-0 truncate font-medium">
                              {t?.nome ?? tid}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          <div
                            className={cn(
                              "flex shrink-0 flex-row justify-end pr-1",
                              POS_GAP,
                            )}
                          >
                            {([1, 2, 3] as const).map((n) => {
                              const id = `g-${g}-${tid}-${n}`
                              return (
                                <div
                                  key={n}
                                  className={cn(
                                    "flex h-8 shrink-0 items-center justify-center",
                                    POS_COL,
                                  )}
                                >
                                  <Checkbox
                                    id={id}
                                    checked={r === n}
                                    onCheckedChange={(c) => {
                                      if (c === true) {
                                        onRanksChange((prev) =>
                                          setTeamRank(prev, g, tid, n),
                                        )
                                      } else if (c === false && r === n) {
                                        onRanksChange((prev) =>
                                          clearTeamRank(prev, g, tid),
                                        )
                                      }
                                    }}
                                    aria-label={`${t?.nome ?? tid} em ${n}º lugar`}
                                  />
                                </div>
                              )
                            })}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
