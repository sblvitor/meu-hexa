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
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { MoreVertical, Plus, Trash2 } from "lucide-react"
import { useHydrated } from "@tanstack/react-router"
import type {
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
} from "@dnd-kit/core"

import type {
  ContainerById,
  ItemsByContainer,
  TierDefinition,
} from "@/lib/tier-list-state"
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
  createContainerLookup,
  createInitialItems,
  createInitialTiers,
  isContainerId,
  isLightLabelBackground,
  moveItemToContainerAtIndex,
  reorderWithinContainer,
  resolveTierLabelBg,
  tierLabelInputFocusRingClass,
  tierLabelInputTextClass,
} from "@/lib/tier-list-state"
import {
  clearTierListStorage,
  initialTierListFromStorageOrDefault,
  writeTierList,
} from "@/lib/local-feature-storage"
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

type RectLike = {
  top: number
  left: number
  width: number
  height: number
}

function cloneItemsByContainer(items: ItemsByContainer): ItemsByContainer {
  return Object.fromEntries(
    Object.entries(items).map(([containerId, teamIds]) => [containerId, [...teamIds]]),
  )
}

function getProjectedIndex(
  items: ItemsByContainer,
  overContainer: string,
  overId: string,
  activeRect?: RectLike | null,
  overRect?: RectLike | null,
): number {
  const overItems = items[overContainer] ?? []

  if (isContainerId(items, overId)) {
    return overItems.length
  }

  const overIndex = overItems.indexOf(overId)
  if (overIndex < 0) {
    return overItems.length
  }

  if (!activeRect || !overRect) {
    return overIndex
  }

  const activeCenterX = activeRect.left + activeRect.width / 2
  const activeCenterY = activeRect.top + activeRect.height / 2
  const overCenterX = overRect.left + overRect.width / 2
  const overCenterY = overRect.top + overRect.height / 2
  const sameRowThreshold = overRect.height * 0.35
  const sameRow = Math.abs(activeCenterY - overCenterY) <= sameRowThreshold
  const shouldInsertAfter = sameRow
    ? activeCenterX > overCenterX
    : activeCenterY > overCenterY

  return overIndex + (shouldInsertAfter ? 1 : 0)
}

function findContainerByLookup(
  lookup: ContainerById,
  id: string,
): string | undefined {
  return lookup[id]
}

const SortableTeamChip = React.memo(function SortableTeamChipInner({
  teamId,
}: {
  teamId: string
}) {
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
})

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

const TierRowDropZone = React.memo(function TierRowDropZoneInner({
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
      <SortableContext items={teamIds} strategy={rectSortingStrategy}>
        {teamIds.map((id) => (
          <SortableTeamChip key={id} teamId={id} />
        ))}
      </SortableContext>
    </div>
  )
})

const PoolDropZone = React.memo(function PoolDropZoneInner({
  teamIds,
}: {
  teamIds: Array<string>
}) {
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
})

function TierListBoardContent() {
  const initialBoard = React.useMemo(() => initialTierListFromStorageOrDefault(), [])
  const [tiers, setTiers] = React.useState<Array<TierDefinition>>(initialBoard.tiers)
  const [items, setItems] = React.useState<ItemsByContainer>(initialBoard.items)
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const dragSnapshotRef = React.useRef<ItemsByContainer | null>(null)

  React.useEffect(() => {
    writeTierList(tiers, items)
  }, [tiers, items])

  function clearAllTierList() {
    const nextTiers = createInitialTiers()
    setTiers(nextTiers)
    setItems(createInitialItems(nextTiers))
    clearTierListStorage()
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  function handleDragStart(event: DragStartEvent) {
    dragSnapshotRef.current = cloneItemsByContainer(items)
    setActiveId(String(event.active.id))
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event
    const overId = over?.id
    if (!overId || active.id === overId) return

    setItems((prev) => {
      const containerLookup = createContainerLookup(prev)
      const activeContainer = findContainerByLookup(
        containerLookup,
        String(active.id),
      )
      const overContainer = findContainerByLookup(containerLookup, String(overId))
      if (!activeContainer || !overContainer) return prev
      if (activeContainer === overContainer) return prev
      const targetIndex = getProjectedIndex(
        prev,
        overContainer,
        String(overId),
        active.rect.current.translated,
        over.rect,
      )
      return moveItemToContainerAtIndex(
        prev,
        activeContainer,
        overContainer,
        String(active.id),
        overId,
        targetIndex,
      )
    })
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)
    if (!over) {
      if (dragSnapshotRef.current) {
        setItems(dragSnapshotRef.current)
      }
      dragSnapshotRef.current = null
      return
    }

    setItems((prev) => {
      const containerLookup = createContainerLookup(prev)
      const activeContainer = findContainerByLookup(
        containerLookup,
        String(active.id),
      )
      const overContainer = findContainerByLookup(
        containerLookup,
        String(over.id),
      )
      if (!activeContainer || !overContainer) return prev
      const targetIndex = getProjectedIndex(
        prev,
        overContainer,
        String(over.id),
        active.rect.current.translated,
        over.rect,
      )

      if (activeContainer === overContainer) {
        const aid = String(active.id)
        const currentIndex = prev[activeContainer].indexOf(aid)
        const normalizedIndex =
          currentIndex >= 0 && currentIndex < targetIndex
            ? targetIndex - 1
            : targetIndex
        return reorderWithinContainer(prev, activeContainer, aid, normalizedIndex)
      }

      return moveItemToContainerAtIndex(
        prev,
        activeContainer,
        overContainer,
        String(active.id),
        over.id,
        targetIndex,
      )
    })
    dragSnapshotRef.current = null
  }

  function handleDragCancel() {
    setActiveId(null)
    if (dragSnapshotRef.current) {
      setItems(dragSnapshotRef.current)
    }
    dragSnapshotRef.current = null
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
    const added: { id: string | null } = { id: null }
    setTiers((prev) => {
      if (prev.length >= MAX_TIERS) return prev
      const id = crypto.randomUUID()
      added.id = id
      const labelBg =
        TIER_DEFAULT_LABEL_BACKGROUNDS[
          prev.length % TIER_DEFAULT_LABEL_BACKGROUNDS.length
        ]
      return [...prev, { id, label: "Novo", labelBg }]
    })
    if (added.id) {
      const id = added.id
      setItems((prev) => ({ ...prev, [id]: [] }))
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
                    className="min-w-54"
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

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
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
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full border-2 border-destructive/40 text-destructive shadow-[2px_2px_0_var(--foreground)] hover:bg-destructive/10 sm:w-auto"
            onClick={clearAllTierList}
          >
            <Trash2 className="size-4" aria-hidden />
            Limpar tudo
          </Button>
        </div>

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
        className="flex min-h-112 flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-border bg-muted/15 px-4"
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
