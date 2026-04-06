import * as React from "react"
import { createFileRoute } from "@tanstack/react-router"
import { motion } from "motion/react"
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
  SimuladorBackdrop,
  SimuladorPipelineDecor,
  SimuladorSectionHeading,
  SimuladorTicketDivider,
} from "@/components/simulador/simulador-page-decor"
import {
  advancingThirdGroupsFromOrder,
  advancingThirdGroupsKey,
  buildR32Pairings,
  computeMatchTeams,
  lookupThirdByWinner,
  lookupThirdByWinnerPartial,
} from "@/lib/copa2026-bracket"

export const Route = createFileRoute("/simulador")({
  component: SimuladorPage,
})

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.48, ease: "easeOut" as const },
  },
}

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
    <div className="relative overflow-x-hidden pb-24">
      <SimuladorBackdrop />

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-5 sm:py-10">
        <motion.header
          className="relative mb-10 max-w-3xl"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          <motion.div
            variants={fadeUp}
            className="mb-3 flex items-center gap-2 sm:mb-4"
          >
            <span className="h-1 w-6 shrink-0 rounded-full bg-accent sm:w-8" />
            <span className="font-heading text-xs font-medium tracking-[0.28em] text-accent uppercase">
              Rota da copa
            </span>
            <span className="h-px flex-1 max-w-24 rounded-full bg-linear-to-r from-accent/50 to-transparent sm:max-w-32" />
          </motion.div>

          <motion.div variants={fadeUp}>
            <SimuladorPipelineDecor />
          </motion.div>

          <motion.p
            variants={fadeUp}
            className="font-heading text-xs font-medium tracking-widest text-primary uppercase"
          >
            Simulador · Copa 2026
          </motion.p>
          <motion.h1
            variants={fadeUp}
            className="mt-1 font-heading text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            Chave interativa
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base"
          >
            Defina o pódio nos grupos, ordene os terceiros e avance o mata-mata
            até a final — o chaveamento reage em tempo real às suas escolhas.
            Bandeiras via{" "}
            <a
              href="https://flagcdn.com"
              className="text-primary underline-offset-4 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              flagcdn
            </a>
            .
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-5 flex flex-wrap gap-2 text-[0.65rem] font-medium tracking-wide text-muted-foreground uppercase sm:text-xs"
          >
            {[
              "12 grupos",
              "48 seleções",
              "32-avos à final",
            ].map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-border/80 bg-background/80 px-2.5 py-1 shadow-[2px_2px_0_var(--foreground)]"
              >
                {chip}
              </span>
            ))}
          </motion.div>
        </motion.header>

        <section className="mb-2 flex flex-col gap-4">
          <SimuladorSectionHeading
            kicker="Etapa 01"
            title="Fase de grupos"
            hint="Marque 1º, 2º e 3º; o último lugar do grupo fica implícito."
          />
          <GroupStagePanel
            ranksByGroup={ranksByGroup}
            onRanksChange={setRanksByGroup}
          />
        </section>

        <SimuladorTicketDivider />

        <section className="mb-2 flex flex-col gap-4">
          <SimuladorSectionHeading
            kicker="Etapa 02"
            title="Terceiros colocados"
            hint="Quando existirem 3º lugares, arraste para definir a ordem dos doze; os oito primeiros avançam."
          />
          {!hasAnyThird ? (
            <div className="rounded-md border-2 border-dashed border-border/60 bg-muted/25 px-4 py-4 text-sm text-muted-foreground">
              Assim que você marcar o{" "}
              <span className="font-medium text-foreground">3º lugar</span>{" "}
              em algum grupo, a lista aparece aqui na ordem em que os 3º forem
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

        <SimuladorTicketDivider />

        <section className="flex flex-col gap-4">
          <SimuladorSectionHeading
            kicker="Etapa 03"
            title="Mata-mata"
            hint="Escolha o vencedor de cada confronto; as vagas TBD encaixam quando o chaveamento fechar."
          />
          {!hasAnyGroupPlacement ? (
            <div className="rounded-md border-2 border-dashed border-border/60 bg-muted/25 px-4 py-4 text-sm text-muted-foreground">
              Marque pelo menos uma colocação (1º, 2º ou 3º) em algum grupo
              para o chaveamento aparecer. Ele é atualizado automaticamente
              quando você altera os grupos; vagas ainda indefinidas ou que
              dependem dos melhores terceiros ficam em &quot;A definir&quot;.
            </div>
          ) : (
            <>
              {!allGr && (
                <div className="rounded-md border-2 border-border/70 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                  Complete o pódio em todos os grupos para fechar os 12
                  terceiros, ordenar os 8 classificados e preencher todas as
                  vagas do mata-mata.
                </div>
              )}
              {allGr && (!advancingKey || !thirdByWinnerOfficial) ? (
                <div
                  role="alert"
                  className="rounded-md border-2 border-destructive/45 bg-destructive/10 px-4 py-3 text-sm text-destructive"
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
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                  className="mt-10 flex justify-center px-1"
                >
                  <div className="max-w-md rounded-lg border-2 border-primary/35 bg-linear-to-br from-primary/12 via-card to-secondary/10 px-6 py-5 text-center shadow-[4px_4px_0_oklch(0.57_0.18_150_/0.35)]">
                    <p className="font-heading text-[0.65rem] font-bold tracking-[0.22em] text-muted-foreground uppercase">
                      Campeão simulado
                    </p>
                    <p className="font-heading mt-2 text-2xl font-semibold tracking-tight text-foreground">
                      {getSelecao(champ)?.nome ?? champ}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Parabéns — no papel, a taça é de vocês.
                    </p>
                  </div>
                </motion.div>
              ) : null}
            </>
          )}
        </section>
      </div>
    </div>
  )
}
