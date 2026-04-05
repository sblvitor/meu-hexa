import * as React from "react"
import { createFileRoute } from "@tanstack/react-router"
import type { GroupId, GroupRankByTeam } from "@/data/copa2026"
import {
  GROUP_ORDER,
  buildAllGroupResults,
  buildProvisionalGroupResults,
  getSelecao,
} from "@/data/copa2026"
import { GroupStagePanel } from "@/components/simulador/group-stage-panel"
import { ThirdRankingPanel } from "@/components/simulador/third-ranking-panel"
import { KnockoutBracket } from "@/components/simulador/knockout-bracket"
import {
  advancingThirdGroupsFromOrder,
  advancingThirdGroupsKey,
  buildR32Pairings,
  computeMatchTeams,
  lookupThirdByWinner,
  lookupThirdByWinnerPartial,
} from "@/lib/copa2026-bracket"
import { Separator } from "@/components/ui/separator"

export const Route = createFileRoute("/simulador")({
  component: SimuladorPage,
})

function defaultRanks(): Record<GroupId, GroupRankByTeam> {
  const o = {} as Record<GroupId, GroupRankByTeam>
  for (const g of GROUP_ORDER) {
    o[g] = {}
  }
  return o
}

function SimuladorPage() {
  const [ranksByGroup, setRanksByGroup] = React.useState(() => defaultRanks())
  const [thirdOrderOverride, setThirdOrderOverride] = React.useState<
    Array<string> | null
  >(null)
  const [winners, setWinners] = React.useState<
    Partial<Record<number, string>>
  >({})
  /** Ordem em que os 3º foram definidos nos grupos (novos entram ao final). */
  const [thirdOrderInsertion, setThirdOrderInsertion] = React.useState<
    Array<string>
  >([])

  React.useEffect(() => {
    setThirdOrderOverride(null)
    setWinners({})
    const pg = buildProvisionalGroupResults(ranksByGroup)
    setThirdOrderInsertion((prev) => {
      const currentSet = new Set<string>()
      for (const g of GROUP_ORDER) {
        const t = pg[g].third
        if (t) currentSet.add(t)
      }
      const kept = prev.filter((id) => currentSet.has(id))
      const prevSet = new Set(prev)
      const added: Array<string> = []
      for (const g of GROUP_ORDER) {
        const t = pg[g].third
        if (t !== undefined && !prevSet.has(t)) added.push(t)
      }
      return [...kept, ...added]
    })
  }, [ranksByGroup])

  const provisionalGr = React.useMemo(
    () => buildProvisionalGroupResults(ranksByGroup),
    [ranksByGroup],
  )

  const allGr = React.useMemo(
    () => buildAllGroupResults(ranksByGroup),
    [ranksByGroup],
  )

  const thirdOrder = thirdOrderOverride ?? thirdOrderInsertion
  const hasAnyThird = thirdOrder.length > 0

  const hasAnyGroupPlacement = React.useMemo(
    () =>
      GROUP_ORDER.some(
        (g) => Object.keys(ranksByGroup[g]).length > 0,
      ),
    [ranksByGroup],
  )

  const advancingKey =
    allGr && thirdOrder.length === 12
      ? advancingThirdGroupsKey(thirdOrder, allGr)
      : null

  const thirdByWinnerOfficial =
    advancingKey !== null ? lookupThirdByWinner(advancingKey) : null

  const advancingSetUnified = React.useMemo(() => {
    if (advancingKey !== null) {
      return new Set(advancingKey.split("") as Array<GroupId>)
    }
    return advancingThirdGroupsFromOrder(thirdOrder, provisionalGr)
  }, [advancingKey, thirdOrder, provisionalGr])

  const thirdByWinnerUnified = React.useMemo(() => {
    if (advancingKey !== null) {
      return thirdByWinnerOfficial
    }
    if (advancingSetUnified.size === 0) return null
    return lookupThirdByWinnerPartial(advancingSetUnified)
  }, [advancingKey, thirdByWinnerOfficial, advancingSetUnified])

  const r32Pairings = React.useMemo(
    () =>
      buildR32Pairings(
        provisionalGr,
        thirdByWinnerUnified,
        advancingSetUnified,
      ),
    [provisionalGr, thirdByWinnerUnified, advancingSetUnified],
  )

  const matchTeams = React.useMemo(
    () => computeMatchTeams(r32Pairings, winners),
    [r32Pairings, winners],
  )

  const champ = winners[104]

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <header className="mb-8">
        <h1 className="font-heading text-2xl tracking-tight">
          Simulador da Copa 2026
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed">
          Escolha 1º, 2º e 3º em cada grupo (o 4º é a seleção restante); o
          chaveamento vai se preenchendo conforme as colocações. Ordene os
          terceiros quando existirem e simule o mata-mata até a final. Bandeiras
          via{" "}
          <a
            href="https://flagcdn.com"
            className="text-primary underline-offset-4 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            flagcdn
          </a>
          .
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          Fase de grupos
        </h2>
        <GroupStagePanel
          ranksByGroup={ranksByGroup}
          onRanksChange={setRanksByGroup}
        />
      </section>

      <Separator className="my-10" />

      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          Terceiros colocados
        </h2>
        {!hasAnyThird ? (
          <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
            Assim que você marcar o{" "}
            <span className="font-medium text-foreground">3º lugar</span> em
            algum grupo, a lista aparece aqui na ordem em que os 3º forem
            escolhidos; você pode reordenar para definir quais 8 avançam.
          </div>
        ) : (
          <ThirdRankingPanel
            orderedTeamIds={thirdOrder}
            onReorder={(next) => setThirdOrderOverride(next)}
            totalThirdSlots={12}
          />
        )}
      </section>

      <Separator className="my-10" />

      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          Mata-mata
        </h2>
        {!hasAnyGroupPlacement ? (
          <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
            Marque pelo menos uma colocação (1º, 2º ou 3º) em algum grupo para o
            chaveamento aparecer. Ele é atualizado automaticamente quando você
            altera os grupos; vagas ainda indefinidas ou que dependem dos
            melhores terceiros ficam em &quot;A definir&quot;.
          </div>
        ) : (
          <>
            {!allGr && (
              <div className="mb-4 rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                Complete o pódio em todos os grupos para fechar os 12 terceiros,
                ordenar os 8 classificados e preencher todas as vagas do
                mata-mata.
              </div>
            )}
            {allGr && (!advancingKey || !thirdByWinnerOfficial) ? (
              <div
                role="alert"
                className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              >
                <p className="font-medium">Combinação de terceiros</p>
                <p className="text-destructive/90 mt-1">
                  Não foi possível resolver o chaveamento para esta ordem de
                  terceiros (chave: {advancingKey ?? "—"}).
                </p>
              </div>
            ) : null}
            <KnockoutBracket
              matchTeams={matchTeams}
              winners={winners}
              onWinnersChange={setWinners}
            />
            {champ ? (
              <p className="text-center text-sm font-medium">
                Campeão: {getSelecao(champ)?.nome ?? champ}
              </p>
            ) : null}
          </>
        )}
      </section>
    </div>
  )
}
