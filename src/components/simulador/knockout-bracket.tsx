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
  koMatchCaption,
  koMatchRound,
} from "@/lib/copa2026-bracket"

/*
 * Bracket tree built from KO_PARENTS. Each half feeds one semifinal.
 *
 * LEFT (→ SF 101):
 *   QF 97 ← R16 89 ← [R32 74, 77]
 *                R16 90 ← [R32 73, 75]
 *   QF 98 ← R16 93 ← [R32 83, 84]
 *                R16 94 ← [R32 81, 82]
 *
 * RIGHT (→ SF 102):
 *   QF 99 ← R16 91 ← [R32 76, 78]
 *                R16 92 ← [R32 79, 80]
 *   QF100 ← R16 95 ← [R32 86, 88]
 *                R16 96 ← [R32 85, 87]
 */

const LEFT_R32 = [74, 77, 73, 75, 83, 84, 81, 82] as const
const LEFT_R16 = [89, 90, 93, 94] as const
const LEFT_QF = [97, 98] as const

const RIGHT_R32 = [76, 78, 79, 80, 86, 88, 85, 87] as const
const RIGHT_R16 = [91, 92, 95, 96] as const
const RIGHT_QF = [99, 100] as const

const ROUND_LABEL: Record<string, string> = {
  r32: "32 avos",
  r16: "16 avos",
  qf: "Quartas",
  sf: "Semifinal",
  third: "3º lugar",
  final: "Final",
}

function teamName(teamId: string | null): { short: string; full: string } {
  if (!teamId) return { short: "—", full: "A definir" }
  const t = getSelecao(teamId)
  return {
    short: (t?.id ?? teamId).slice(0, 3).toUpperCase(),
    full: t?.nome ?? teamId,
  }
}

function PickSlot({
  teamId,
  matchId,
  side,
  winnerId,
  disabled,
  compact,
}: {
  teamId: string | null
  matchId: number
  side: "home" | "away"
  winnerId: string | undefined
  disabled: boolean
  compact?: boolean
}) {
  const id = `m${matchId}-${side}`
  const canPick = Boolean(teamId && !disabled)
  const { short, full } = teamName(teamId)
  const picked = Boolean(teamId && winnerId === teamId)
  const lost = Boolean(teamId && winnerId && winnerId !== teamId)

  if (!teamId) {
    return (
      <div className="flex items-center gap-2 px-2 py-1.5">
        <span className="size-6 shrink-0 rounded-full border-2 border-dashed border-muted-foreground/40 bg-muted/35" />
        <span className="font-heading truncate text-[0.6rem] font-bold tracking-wider text-muted-foreground">
          A definir
        </span>
      </div>
    )
  }

  return (
    <div className="relative flex min-w-0 items-center">
      <RadioGroupItem
        value={teamId}
        id={id}
        disabled={!canPick}
        className="peer sr-only"
      />
      <Label
        htmlFor={id}
        className={cn(
          "flex w-full cursor-pointer items-center gap-2 border-0 px-2 py-1.5 shadow-none transition-colors",
          picked && "bg-primary/12",
          lost && "opacity-40",
          !canPick && "cursor-not-allowed",
          "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-1"
        )}
      >
        <span className="relative size-6 shrink-0 overflow-hidden rounded-full border-2 border-foreground/70 bg-muted">
          <TeamFlag
            teamId={teamId}
            size={24}
            className="size-full rounded-full border-0 object-cover"
          />
        </span>
        <span className="flex min-w-0 flex-col">
          <span
            className={cn(
              "font-heading truncate text-[0.68rem] font-bold leading-tight tracking-wide",
              compact ? "" : "sm:hidden"
            )}
          >
            {short}
          </span>
          {!compact && (
            <span className="font-heading hidden truncate text-[0.68rem] font-bold leading-tight tracking-wide sm:block">
              {full}
            </span>
          )}
        </span>
        {picked && (
          <span className="ml-auto shrink-0 text-primary" aria-label="Vencedor">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="fill-current">
              <path d="M5.5 9.79 2.71 7l-.96.96L5.5 11.71l8-8-.96-.96L5.5 9.79Z" />
            </svg>
          </span>
        )}
      </Label>
    </div>
  )
}

function MatchCard({
  matchId,
  homeId,
  awayId,
  winnerId,
  onWinner,
  compact,
  emphasize,
}: {
  matchId: number
  homeId: string | null
  awayId: string | null
  winnerId: string | undefined
  onWinner: (teamId: string) => void
  compact?: boolean
  emphasize?: boolean
}) {
  const ready = Boolean(homeId && awayId)
  const roundKey = koMatchRound(matchId)
  const caption = koMatchCaption(matchId)

  return (
    <div className={cn("flex flex-col", compact ? "w-[8.5rem]" : "w-[9rem] sm:w-[10.5rem]")}>
      <div className="flex items-center gap-1.5 px-0.5 pb-0.5">
        <span className="font-heading rounded-sm border-2 border-foreground bg-card px-1 py-px text-[0.5rem] font-bold leading-none tracking-widest shadow-[2px_2px_0_var(--foreground)]">
          J{matchId}
        </span>
        <span className="font-heading truncate text-[0.48rem] font-bold tracking-wider text-muted-foreground uppercase">
          {ROUND_LABEL[roundKey]}
        </span>
      </div>

      <RadioGroup
        value={
          winnerId && (winnerId === homeId || winnerId === awayId)
            ? winnerId
            : ""
        }
        onValueChange={(v) => {
          if (v) onWinner(v)
        }}
        className={cn(
          "flex flex-col overflow-hidden rounded-sm border-2 border-foreground bg-card shadow-[3px_3px_0_var(--foreground)]",
          emphasize && "ring-2 ring-primary/30 ring-offset-2 ring-offset-background"
        )}
        disabled={!ready}
      >
        <PickSlot
          teamId={homeId}
          matchId={matchId}
          side="home"
          winnerId={winnerId}
          disabled={!ready}
          compact={compact}
        />
        <div className="h-0 border-t border-foreground/20" />
        <PickSlot
          teamId={awayId}
          matchId={matchId}
          side="away"
          winnerId={winnerId}
          disabled={!ready}
          compact={compact}
        />
      </RadioGroup>

      {caption && (
        <p className="mt-0.5 truncate px-0.5 text-[0.48rem] leading-tight text-muted-foreground">
          {caption}
        </p>
      )}
    </div>
  )
}

/**
 * C-shaped bracket connectors: merges `sourceCount` evenly-spaced input points
 * into sourceCount/2 output points. The "C" opens toward the source side.
 *
 * For LTR (source on left):  the vertical + right border draws the ⊂ shape.
 * For RTL (source on right): the vertical + left border draws the ⊃ shape.
 */
function MergeConnector({
  sourceCount,
  flow,
}: {
  sourceCount: number
  flow: "ltr" | "rtl"
}) {
  if (sourceCount < 2) return null
  const pairs = sourceCount / 2

  return (
    <div className="flex w-4 shrink-0 flex-col self-stretch" aria-hidden>
      {Array.from({ length: pairs }, (_, i) => (
        <div key={i} className="flex flex-1 flex-col">
          {/* Top arm of the C */}
          <div className="flex flex-1 flex-col">
            <div className="flex-1" />
            <div
              className={cn(
                "flex-1 border-foreground/30",
                flow === "ltr"
                  ? "rounded-tr-sm border-t-2 border-r-2"
                  : "rounded-tl-sm border-t-2 border-l-2"
              )}
            />
          </div>
          {/* Bottom arm of the C */}
          <div className="flex flex-1 flex-col">
            <div
              className={cn(
                "flex-1 border-foreground/30",
                flow === "ltr"
                  ? "rounded-br-sm border-r-2 border-b-2"
                  : "rounded-bl-sm border-l-2 border-b-2"
              )}
            />
            <div className="flex-1" />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Horizontal feed lines — draws `count` evenly-spaced horizontal segments
 * connecting merge outputs to the next column's match inputs.
 */
function HLines({ count }: { count: number }) {
  return (
    <div className="flex w-3 shrink-0 flex-col self-stretch" aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex flex-1 items-center">
          <div className="h-0 w-full border-t-2 border-foreground/30" />
        </div>
      ))}
    </div>
  )
}

function RoundColumn({
  matchIds,
  matchTeams,
  winners,
  onWinner,
}: {
  matchIds: ReadonlyArray<number>
  matchTeams: Record<number, [string | null, string | null]>
  winners: Partial<Record<number, string>>
  onWinner: (matchId: number, teamId: string) => void
}) {
  return (
    <div className="flex min-w-0 shrink-0 flex-col justify-around self-stretch gap-1">
      {matchIds.map((mid) => {
        const [a, b] = matchTeams[mid] ?? [null, null]
        return (
          <div key={mid} className="flex flex-1 items-center">
            <MatchCard
              matchId={mid}
              homeId={a}
              awayId={b}
              winnerId={winners[mid]}
              onWinner={(tid) => onWinner(mid, tid)}
            />
          </div>
        )
      })}
    </div>
  )
}

/**
 * One half of the bracket.
 *
 * LTR (left half):  R32(8) ─merge(8)→ hfeed(4) → R16(4) ─merge(4)→ hfeed(2) → QF(2) ─merge(2)→ hfeed(1) → SF(1)
 * RTL (right half): SF(1) ← hfeed(1) ←merge(2)─ QF(2) ← hfeed(2) ←merge(4)─ R16(4) ← hfeed(4) ←merge(8)─ R32(8)
 *
 * The visual order left-to-right is outermost → innermost for LTR,
 * and innermost → outermost for RTL.
 */
function BracketHalf({
  r32Ids,
  r16Ids,
  qfIds,
  sfId,
  matchTeams,
  winners,
  onWinner,
  flow,
}: {
  r32Ids: ReadonlyArray<number>
  r16Ids: ReadonlyArray<number>
  qfIds: ReadonlyArray<number>
  sfId: number
  matchTeams: Record<number, [string | null, string | null]>
  winners: Partial<Record<number, string>>
  onWinner: (matchId: number, teamId: string) => void
  flow: "ltr" | "rtl"
}) {
  const col = (ids: ReadonlyArray<number>, key: string) => (
    <RoundColumn
      key={key}
      matchIds={ids}
      matchTeams={matchTeams}
      winners={winners}
      onWinner={onWinner}
    />
  )

  // Connectors between rounds — always merge outer→inner.
  // sourceCount = number of matches in the outer round.
  // targetCount = sourceCount / 2 = number of matches in the inner round.
  const conn = (sourceCount: number, key: string) => (
    <React.Fragment key={key}>
      {flow === "ltr" ? (
        <>
          <MergeConnector sourceCount={sourceCount} flow="ltr" />
          <HLines count={sourceCount / 2} />
        </>
      ) : (
        <>
          <HLines count={sourceCount / 2} />
          <MergeConnector sourceCount={sourceCount} flow="rtl" />
        </>
      )}
    </React.Fragment>
  )

  if (flow === "ltr") {
    return (
      <div className="flex items-stretch">
        {col(r32Ids, "r32")}
        {conn(r32Ids.length, "r32-r16")}
        {col(r16Ids, "r16")}
        {conn(r16Ids.length, "r16-qf")}
        {col(qfIds, "qf")}
        {conn(qfIds.length, "qf-sf")}
        {col([sfId], "sf")}
      </div>
    )
  }

  return (
    <div className="flex items-stretch">
      {col([sfId], "sf")}
      {conn(qfIds.length, "qf-sf")}
      {col(qfIds, "qf")}
      {conn(r16Ids.length, "r16-qf")}
      {col(r16Ids, "r16")}
      {conn(r32Ids.length, "r32-r16")}
      {col(r32Ids, "r32")}
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
      <div className="overflow-x-auto pb-4">
        <div className="mx-auto flex w-max items-stretch justify-center px-2">
          <BracketHalf
            r32Ids={LEFT_R32}
            r16Ids={LEFT_R16}
            qfIds={LEFT_QF}
            sfId={101}
            matchTeams={matchTeams}
            winners={winners}
            onWinner={setWinner}
            flow="ltr"
          />

          <HLines count={1} />

          <div className="flex w-[10.5rem] shrink-0 flex-col items-center justify-center gap-3 border-x-2 border-foreground/15 bg-muted/15 px-3 py-4">
            <p className="font-heading text-center text-[0.52rem] font-bold leading-snug tracking-wider text-muted-foreground uppercase">
              Simule o caminho até a final
            </p>
            <img
              src={tacaCopa}
              alt=""
              className="mx-auto w-12 object-contain opacity-95 sm:w-14"
            />
            <MatchCard
              matchId={FINAL_MATCH}
              homeId={final[0]}
              awayId={final[1]}
              winnerId={winners[FINAL_MATCH]}
              onWinner={(tid) => setWinner(FINAL_MATCH, tid)}
              compact
              emphasize
            />
          </div>

          <HLines count={1} />

          <BracketHalf
            r32Ids={RIGHT_R32}
            r16Ids={RIGHT_R16}
            qfIds={RIGHT_QF}
            sfId={102}
            matchTeams={matchTeams}
            winners={winners}
            onWinner={setWinner}
            flow="rtl"
          />
        </div>
      </div>

      <div className="flex justify-center border-t-2 border-dashed border-muted-foreground/40 pt-6">
        <div className="flex flex-col items-center gap-2">
          <p className="font-heading text-[0.6rem] font-bold tracking-wider text-muted-foreground uppercase">
            Disputa de 3º lugar
          </p>
          <MatchCard
            matchId={THIRD_PLACE_MATCH}
            homeId={third[0]}
            awayId={third[1]}
            winnerId={winners[THIRD_PLACE_MATCH]}
            onWinner={(tid) => setWinner(THIRD_PLACE_MATCH, tid)}
          />
        </div>
      </div>
    </div>
  )
}
