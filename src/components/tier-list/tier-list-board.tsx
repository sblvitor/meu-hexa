import * as React from "react"
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  pointerWithin,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  SortableContext,
  horizontalListSortingStrategy,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { MoreVertical, Plus } from "lucide-react"
import { useHydrated } from "@tanstack/react-router"
import type {
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
} from "@dnd-kit/core"

import type { ItemsByContainer, TierDefinition } from "@/lib/tier-list-state"
import { TeamFlag } from "@/components/simulador/team-flag"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { getSelecao } from "@/data/copa2026"
import {
  MAX_TIERS,
  POOL_ID,
  TIER_COLOR_SWATCHES,
  TIER_DEFAULT_LABEL_BACKGROUNDS,
  createInitialItems,
  createInitialTiers,
  findContainer,
  isContainerId,
  isLightLabelBackground,
  moveItemToContainerAtIndex,
  reorderWithinContainer,
  resolveTierLabelBg,
  tierLabelInputFocusRingClass,
  tierLabelInputTextClass,
} from "@/lib/tier-list-state"
import { cn } from "@/lib/utils"

function tierListCollisionDetection(
  args: Parameters<typeof closestCorners>[0],
) {
  const pointerHits = pointerWithin(args)
  if (pointerHits.length > 0) return pointerHits
  return closestCorners(args)
}

/** Lado útil da bandeira (px); o chip usa `size-14` (56px) com `p-1` para caber48+8. */
const FLAG_CHIP_SIZE = 48
const FLAG_CHIP_BOX_CLASS = "size-14 box-border p-1"

function SortableTeamChip({ teamId }: { teamId: string }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: teamId })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const t = getSelecao(teamId)
  const label = t?.nome ?? teamId

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          ref={setNodeRef}
          style={style}
          className={cn(
            "flex cursor-grab touch-none items-center justify-center rounded-md border-2 border-border bg-card shadow-[2px_2px_0_var(--foreground)] outline-none active:cursor-grabbing",
            FLAG_CHIP_BOX_CLASS,
            isDragging && "z-20 opacity-80",
          )}
          aria-label={label}
          {...attributes}
          {...listeners}
        >
          <TeamFlag teamId={teamId} size={FLAG_CHIP_SIZE} framed />
        </div>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        sideOffset={8}
        className="max-w-[min(20rem,calc(100vw-1rem))] font-medium shadow-[2px_2px_0_var(--foreground)]"
      >
        {label}
      </TooltipContent>
    </Tooltip>
  )
}

function TeamChipPreview({ teamId }: { teamId: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-md border-2 border-border bg-card shadow-[3px_3px_0_var(--foreground)]",
        FLAG_CHIP_BOX_CLASS,
      )}
    >
      <TeamFlag teamId={teamId} size={FLAG_CHIP_SIZE} framed />
    </div>
  )
}

function TierRowDropZone({
  tierId,
  teamIds,
}: {
  tierId: string
  teamIds: Array<string>
}) {
  const { setNodeRef } = useDroppable({ id: tierId })

  return (
    <div
      ref={setNodeRef}
      className="flex h-full min-h-[104px] min-w-0 flex-1 flex-wrap content-start gap-2 rounded-md border-2 border-[#2a2a2a] bg-[#1a1a1a] p-3 transition-colors"
    >
      <SortableContext items={teamIds} strategy={horizontalListSortingStrategy}>
        {teamIds.map((id) => (
          <SortableTeamChip key={id} teamId={id} />
        ))}
      </SortableContext>
    </div>
  )
}

function PoolDropZone({ teamIds }: { teamIds: Array<string> }) {
  const { setNodeRef } = useDroppable({ id: POOL_ID })

  return (
    <div
      ref={setNodeRef}
      className="min-h-[120px] rounded-md border-2 border-dashed border-border bg-muted/30 p-3 transition-colors"
    >
      <SortableContext items={teamIds} strategy={rectSortingStrategy}>
        <div className="flex flex-wrap gap-2">
          {teamIds.map((id) => (
            <SortableTeamChip key={id} teamId={id} />
          ))}
        </div>
      </SortableContext>
    </div>
  )
}

function TierListBoardContent() {
  const [tiers, setTiers] = React.useState<Array<TierDefinition>>(() =>
    createInitialTiers(),
  )
  const [items, setItems] = React.useState<ItemsByContainer>(() =>
    createInitialItems(createInitialTiers()),
  )
  const [activeId, setActiveId] = React.useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id))
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event
    const overId = over?.id
    if (!overId || active.id === overId) return

    setItems((prev) => {
      const activeContainer = findContainer(prev, active.id)
      const overContainer = findContainer(prev, overId)
      if (!activeContainer || !overContainer) return prev
      if (activeContainer === overContainer) return prev
      return moveItemToContainerAtIndex(
        prev,
        activeContainer,
        overContainer,
        String(active.id),
        overId,
      )
    })
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)
    if (!over) return

    setItems((prev) => {
      const activeContainer = findContainer(prev, active.id)
      const overContainer = findContainer(prev, over.id)
      if (!activeContainer || !overContainer) return prev

      if (activeContainer === overContainer) {
        const aid = String(active.id)
        const oid = String(over.id)
        if (aid === oid) return prev
        if (
          isContainerId(prev, over.id) &&
          prev[activeContainer].at(-1) === aid
        ) {
          return prev
        }
        return reorderWithinContainer(prev, activeContainer, aid, oid)
      }

      return moveItemToContainerAtIndex(
        prev,
        activeContainer,
        overContainer,
        String(active.id),
        over.id,
      )
    })
  }

  function handleDragCancel() {
    setActiveId(null)
  }

  function updateTierLabel(tierId: string, label: string) {
    setTiers((prev) =>
      prev.map((t) => (t.id === tierId ? { ...t, label } : t)),
    )
  }

  function updateTierLabelBg(tierId: string, labelBg: string) {
    setTiers((prev) =>
      prev.map((t) => (t.id === tierId ? { ...t, labelBg } : t)),
    )
  }

  function addTierBelow() {
    let newTierId: string | null = null
    setTiers((prev) => {
      if (prev.length >= MAX_TIERS) return prev
      newTierId = crypto.randomUUID()
      const labelBg =
        TIER_DEFAULT_LABEL_BACKGROUNDS[
          prev.length % TIER_DEFAULT_LABEL_BACKGROUNDS.length
        ]
      return [...prev, { id: newTierId, label: "Novo", labelBg }]
    })
    if (newTierId) {
      setItems((prev) => ({ ...prev, [newTierId!]: [] }))
    }
  }

  function removeTier(tierId: string) {
    if (tiers.length <= 1) return
    setItems((prev) => {
      const next = { ...prev }
      const fromTier = next[tierId] ?? []
      delete next[tierId]
      next[POOL_ID] = [...next[POOL_ID], ...fromTier]
      return next
    })
    setTiers((prev) => prev.filter((t) => t.id !== tierId))
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={tierListCollisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          {tiers.map((tier, i) => {
            const labelBg = resolveTierLabelBg(tier, i)
            return (
              <div
                key={tier.id}
                className="flex flex-col gap-2 sm:flex-row sm:items-stretch"
              >
                <div
                  className="flex min-h-[104px] w-full shrink-0 rounded-md border-2 border-border shadow-[2px_2px_0_var(--foreground)] sm:w-40 sm:self-stretch md:w-44"
                  style={{ backgroundColor: labelBg }}
                >
                  <Input
                    value={tier.label}
                    onChange={(e) => updateTierLabel(tier.id, e.target.value)}
                    className={cn(
                      "h-full min-h-[104px] w-full flex-1 border-0 bg-transparent py-4 text-center font-heading text-base font-bold uppercase shadow-none outline-none focus-visible:border-0 focus-visible:ring-2 sm:min-h-0 md:text-lg",
                      tierLabelInputTextClass(labelBg),
                      tierLabelInputFocusRingClass(labelBg),
                    )}
                    aria-label={`Nome do tier na posição ${i + 1}`}
                  />
                </div>
                <TierRowDropZone
                  tierId={tier.id}
                  teamIds={items[tier.id] ?? []}
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        "inline-flex w-full shrink-0 cursor-pointer items-center justify-center rounded-md border-2 border-[#2a2a2a] bg-[#1a1a1a] text-zinc-100 shadow-[2px_2px_0_var(--foreground)] outline-none transition-colors",
                        "hover:bg-[#252525] hover:text-zinc-100",
                        "focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                        "min-h-[104px] sm:w-12 sm:min-w-12 sm:max-w-12 sm:self-stretch sm:shrink-0",
                      )}
                      aria-label={`Opções do tier ${tier.label}`}
                    >
                      <MoreVertical
                        className="size-4 shrink-0 text-zinc-100"
                        aria-hidden
                      />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="min-w-[13.5rem]"
                  >
                    <DropdownMenuLabel className="text-xs font-medium normal-case tracking-normal">
                      Cor do rótulo
                    </DropdownMenuLabel>
                    <div className="grid grid-cols-5 gap-1.5 p-1">
                      {TIER_COLOR_SWATCHES.map((swatch) => {
                        const selected =
                          labelBg.toUpperCase() === swatch.hex.toUpperCase()
                        const light = isLightLabelBackground(swatch.hex)
                        return (
                          <DropdownMenuItem
                            key={swatch.hex}
                            className="flex size-9 cursor-pointer items-center justify-center rounded-full p-0"
                            onSelect={() =>
                              updateTierLabelBg(tier.id, swatch.hex)
                            }
                            aria-label={`Cor ${swatch.label}`}
                          >
                            <span
                              className={cn(
                                "size-7 shrink-0 rounded-full border-2 shadow-sm",
                                light
                                  ? "border-neutral-900/25 ring-1 ring-black/15"
                                  : "border-white/90 ring-1 ring-black/25",
                                selected && "ring-2 ring-neutral-900 ring-offset-2 ring-offset-popover",
                              )}
                              style={{ backgroundColor: swatch.hex }}
                            />
                          </DropdownMenuItem>
                        )
                      })}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      disabled={tiers.length <= 1}
                      onSelect={() => removeTier(tier.id)}
                    >
                      Remover tier
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )
          })}
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="w-full border-2 border-border shadow-[2px_2px_0_var(--foreground)] sm:w-auto"
          disabled={tiers.length >= MAX_TIERS}
          title={
            tiers.length >= MAX_TIERS
              ? `Limite de ${MAX_TIERS} tiers atingido`
              : undefined
          }
          onClick={addTierBelow}
        >
          <Plus className="size-4" aria-hidden />
          Adicionar tier
          {tiers.length >= MAX_TIERS ? (
            <span className="sr-only"> — limite de {MAX_TIERS} tiers</span>
          ) : null}
        </Button>

        <div className="flex flex-col gap-2">
          <h2 className="font-heading text-sm uppercase tracking-wide">
            Sem tier
          </h2>
          <PoolDropZone teamIds={items[POOL_ID] ?? []} />
        </div>
      </div>

      <DragOverlay dropAnimation={null}>
        {activeId ? <TeamChipPreview teamId={activeId} /> : null}
      </DragOverlay>
    </DndContext>
  )
}

export function TierListBoard() {
  const hydrated = useHydrated()

  if (!hydrated) {
    return (
      <div
        className="flex min-h-[28rem] flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-border bg-muted/15 px-4"
        aria-busy="true"
        aria-live="polite"
      >
        <span className="sr-only">Preparando a tier list para interação</span>
        <p className="text-muted-foreground text-sm">Carregando ranking…</p>
      </div>
    )
  }

  return <TierListBoardContent />
}
