"use client"

import * as React from "react"
import tacaCopa from "@/assets/taca_copa.png"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { TeamFlag } from "@/components/simulador/team-flag"
import { getSelecao } from "@/data/copa2026"
import { cn } from "@/lib/utils"
import {
  FINAL_MATCH,
  THIRD_PLACE_MATCH,
  applyWinnerPick,
  koMatchRound,
  r32MatchSlotCaption,
} from "@/lib/copa2026-bracket"

const R32_LEFT = [73, 74, 75, 76, 77, 78, 79, 80, 81, 82] as const
const R32_RIGHT = [83, 84, 85, 86, 87, 88] as const
const R16_LEFT = [89, 90, 91, 92] as const
const R16_RIGHT = [93, 94, 95, 96] as const
const QF_LEFT = [97, 98] as const
const QF_RIGHT = [99, 100] as const

const ROUND_LABEL: Record<string, string> = {
  r32: "32 avos",
  r16: "16 avos",
  qf: "Quartas",
  sf: "Semifinal",
  third: "3º lugar",
  final: "Final",
}

function teamShortCode(teamId: string | null): string {
  if (!teamId) return "—"
  const t = getSelecao(teamId)
  return (t?.id ?? teamId).slice(0, 3).toUpperCase()
}

function ConnectorStrip() {
  return (
    <div
      className="h-0 w-5 shrink-0 border-t-2 border-dashed border-muted-foreground/50"
      aria-hidden
    />
  )
}

function PickSlot({
  teamId,
  matchId,
  side,
  winnerId,
  disabled,
  emphasize,
}: {
  teamId: string | null
  matchId: number
  side: "home" | "away"
  winnerId: string | undefined
  disabled: boolean
  emphasize?: boolean
}) {
  const id = `m${matchId}-${side}`
  const canPick = Boolean(teamId && !disabled)
  const code = teamShortCode(teamId)
  const picked = Boolean(teamId && winnerId === teamId)

  if (!teamId) {
    return (
      <div
        className="flex items-center gap-2 py-0.5 opacity-90"
        title="Vaga a definir"
      >
        <span className="size-8 shrink-0 rounded-full border-2 border-dashed border-muted-foreground/40 bg-muted/35 shadow-[2px_2px_0_var(--foreground)]" />
        <span className="font-heading text-[0.65rem] font-bold tracking-[0.12em] text-muted-foreground">
          —
        </span>
      </div>
    )
  }

  return (
    <div className="relative flex items-center py-0.5">
      <RadioGroupItem
        value={teamId}
        id={id}
        disabled={!canPick}
        className="peer sr-only"
      />
      <Label
        htmlFor={id}
        className={cn(
          "flex cursor-pointer items-center gap-2 rounded-full border-2 border-foreground bg-card px-0.5 py-0.5 shadow-[3px_3px_0_var(--foreground)] transition-[color,box-shadow,border-color]",
          picked &&
            "border-primary shadow-[2px_2px_0_color-mix(in_oklab,var(--primary)_65%,var(--foreground))]",
          emphasize && "ring-2 ring-primary/25",
          !canPick && "cursor-not-allowed opacity-50",
          "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background",
        )}
      >
        <span className="relative size-8 overflow-hidden rounded-full border-2 border-foreground/80 bg-muted">
          <TeamFlag
            teamId={teamId}
            size={32}
            className="size-full rounded-full border-0 object-cover"
          />
        </span>
        <span className="font-heading pr-2 text-[0.68rem] font-bold tracking-[0.14em]">
          {code}
        </span>
      </Label>
    </div>
  )
}

function BracketMatchPair({
  matchId,
  homeId,
  awayId,
  winnerId,
  onWinner,
  towardCenter,
  flow,
  emphasize,
  slotCaption,
}: {
  matchId: number
  homeId: string | null
  awayId: string | null
  winnerId: string | undefined
  onWinner: (teamId: string) => void
  towardCenter: boolean
  flow: "ltr" | "rtl"
  emphasize?: boolean
  slotCaption?: string | null
}) {
  const ready = Boolean(homeId && awayId)
  const roundKey = koMatchRound(matchId)
  const titleBits = [
    `Jogo ${matchId}`,
    ROUND_LABEL[roundKey],
    slotCaption,
  ].filter(Boolean)

  return (
    <div
      className="flex items-center gap-0"
      title={titleBits.join(" · ")}
    >
      {flow === "rtl" && towardCenter ? <ConnectorStrip /> : null}
      <RadioGroup
        value={
          winnerId && (winnerId === homeId || winnerId === awayId)
            ? winnerId
            : ""
        }
        onValueChange={(v) => {
          if (v) onWinner(v)
        }}
        className="flex flex-col gap-2"
        disabled={!ready}
      >
        <PickSlot
          teamId={homeId}
          matchId={matchId}
          side="home"
          winnerId={winnerId}
          disabled={!ready}
          emphasize={emphasize}
        />
        <PickSlot
          teamId={awayId}
          matchId={matchId}
          side="away"
          winnerId={winnerId}
          disabled={!ready}
          emphasize={emphasize}
        />
      </RadioGroup>
      {flow === "ltr" && towardCenter ? <ConnectorStrip /> : null}
    </div>
  )
}

function RoundColumn({
  label,
  matchIds,
  matchTeams,
  winners,
  onWinner,
  flow,
  towardCenter,
}: {
  label: string
  matchIds: ReadonlyArray<number>
  matchTeams: Record<number, [string | null, string | null]>
  winners: Partial<Record<number, string>>
  onWinner: (matchId: number, teamId: string) => void
  flow: "ltr" | "rtl"
  towardCenter: boolean
}) {
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <p className="font-heading text-center text-[0.65rem] font-bold tracking-[0.12em] text-muted-foreground uppercase">
        {label}
      </p>
      <div className="flex flex-col gap-4">
        {matchIds.map((mid) => {
          const [a, b] = matchTeams[mid] ?? [null, null]
          return (
            <BracketMatchPair
              key={mid}
              matchId={mid}
              homeId={a}
              awayId={b}
              winnerId={winners[mid]}
              onWinner={(tid) => onWinner(mid, tid)}
              towardCenter={towardCenter}
              flow={flow}
              slotCaption={r32MatchSlotCaption(mid)}
            />
          )
        })}
      </div>
    </div>
  )
}

export function KnockoutBracket({
  matchTeams,
  winners,
  onWinnersChange,
}: {
  matchTeams: Record<number, [string | null, string | null]>
  winners: Partial<Record<number, string>>
  onWinnersChange: (w: Partial<Record<number, string>>) => void
}) {
  const setWinner = React.useCallback(
    (matchId: number, teamId: string) => {
      onWinnersChange(applyWinnerPick(matchId, teamId, winners))
    },
    [onWinnersChange, winners],
  )

  const final = matchTeams[FINAL_MATCH]
  const third = matchTeams[THIRD_PLACE_MATCH]

  return (
    <div className="flex w-full flex-col gap-8">
      <div className="overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="mx-auto flex min-w-[min(100%,56rem)] items-start justify-center gap-1 px-1 sm:min-w-[56rem] sm:px-2">
          <div className="flex flex-1 flex-col items-end gap-2 sm:flex-row sm:items-start sm:justify-end sm:gap-1.5">
            <RoundColumn
              label="32 avos"
              matchIds={R32_LEFT}
              matchTeams={matchTeams}
              winners={winners}
              onWinner={setWinner}
              flow="ltr"
              towardCenter
            />
            <RoundColumn
              label="16 avos"
              matchIds={R16_LEFT}
              matchTeams={matchTeams}
              winners={winners}
              onWinner={setWinner}
              flow="ltr"
              towardCenter
            />
            <RoundColumn
              label="Quartas"
              matchIds={QF_LEFT}
              matchTeams={matchTeams}
              winners={winners}
              onWinner={setWinner}
              flow="ltr"
              towardCenter
            />
            <RoundColumn
              label="Semi"
              matchIds={[101]}
              matchTeams={matchTeams}
              winners={winners}
              onWinner={setWinner}
              flow="ltr"
              towardCenter
            />
          </div>

          <div className="flex w-[11.5rem] shrink-0 flex-col items-center gap-3 border-y-2 border-foreground/15 bg-muted/20 px-2 py-5 shadow-[3px_3px_0_var(--foreground)] sm:w-52 sm:border-y-0 sm:border-x-2">
            <p className="font-heading text-center text-[0.58rem] font-bold leading-snug tracking-[0.08em] text-muted-foreground uppercase">
              Clique no vencedor de cada confronto para simular o caminho até a
              final.
            </p>
            <img
              src={tacaCopa}
              alt=""
              className="mx-auto w-14 object-contain opacity-95 sm:w-16"
            />
            <p className="font-heading text-[0.6rem] font-bold tracking-[0.15em] text-muted-foreground uppercase">
              Final
            </p>
            <BracketMatchPair
              matchId={FINAL_MATCH}
              homeId={final[0]}
              awayId={final[1]}
              winnerId={winners[FINAL_MATCH]}
              onWinner={(tid) => setWinner(FINAL_MATCH, tid)}
              towardCenter={false}
              flow="ltr"
              emphasize
            />
          </div>

          <div className="flex flex-1 flex-col items-start gap-2 sm:flex-row sm:items-start sm:justify-start sm:gap-1.5">
            <RoundColumn
              label="Semi"
              matchIds={[102]}
              matchTeams={matchTeams}
              winners={winners}
              onWinner={setWinner}
              flow="rtl"
              towardCenter
            />
            <RoundColumn
              label="Quartas"
              matchIds={QF_RIGHT}
              matchTeams={matchTeams}
              winners={winners}
              onWinner={setWinner}
              flow="rtl"
              towardCenter
            />
            <RoundColumn
              label="16 avos"
              matchIds={R16_RIGHT}
              matchTeams={matchTeams}
              winners={winners}
              onWinner={setWinner}
              flow="rtl"
              towardCenter
            />
            <RoundColumn
              label="32 avos"
              matchIds={R32_RIGHT}
              matchTeams={matchTeams}
              winners={winners}
              onWinner={setWinner}
              flow="rtl"
              towardCenter
            />
          </div>
        </div>
      </div>

      <div className="flex justify-center border-t-2 border-dashed border-muted-foreground/40 pt-6">
        <div className="flex w-full max-w-md flex-col items-center gap-2">
          <p className="font-heading text-[0.65rem] font-bold tracking-[0.15em] text-muted-foreground uppercase">
            Disputa de 3º lugar
          </p>
          <BracketMatchPair
            matchId={THIRD_PLACE_MATCH}
            homeId={third[0]}
            awayId={third[1]}
            winnerId={winners[THIRD_PLACE_MATCH]}
            onWinner={(tid) => setWinner(THIRD_PLACE_MATCH, tid)}
            towardCenter={false}
            flow="ltr"
          />
        </div>
      </div>
    </div>
  )
}
