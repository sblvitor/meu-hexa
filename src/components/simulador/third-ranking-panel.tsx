"use client"

import { Fragment } from "react"
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical } from "lucide-react"
import type { DragEndEvent } from "@dnd-kit/core"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TeamFlag } from "@/components/simulador/team-flag"
import { getSelecao, groupIdForTeam } from "@/data/copa2026"
import { cn } from "@/lib/utils"

function SortableThirdRow({
  tid,
  qualifies,
}: {
  tid: string
  qualifies: boolean
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tid })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const t = getSelecao(tid)
  const group = groupIdForTeam(tid)
  const rowCls = qualifies
    ? "border-primary/25 bg-primary/5"
    : "border-muted bg-muted/20 opacity-80"

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 rounded-lg border px-2 py-2 sm:gap-3 sm:px-3",
        rowCls,
        isDragging && "z-10 opacity-60 shadow-md ring-2 ring-primary/20",
      )}
    >
      <button
        type="button"
        className="text-muted-foreground hover:text-foreground flex size-8 shrink-0 cursor-grab touch-none items-center justify-center rounded-md border border-transparent hover:border-border/60 active:cursor-grabbing"
        aria-label="Arrastar para reordenar"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" aria-hidden />
      </button>
      <TeamFlag teamId={tid} size={24} />
      <div className="min-w-0 flex-1">
        <span className="text-sm font-medium">
          {t?.nome ?? tid}
          {group !== undefined ? (
            <span className="ml-1.5 text-[0.7rem] font-normal text-muted-foreground">
              · Grupo {group}
            </span>
          ) : null}
        </span>
      </div>
      {qualifies ? (
        <span className="hidden shrink-0 text-xs text-primary sm:inline">
          Classifica
        </span>
      ) : null}
    </li>
  )
}

export function ThirdRankingPanel({
  orderedTeamIds,
  onReorder,
  totalThirdSlots = 12,
}: {
  orderedTeamIds: Array<string>
  onReorder: (next: Array<string>) => void
  /** Total de terceiros na Copa (12 grupos). */
  totalThirdSlots?: number
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = orderedTeamIds.indexOf(String(active.id))
    const newIndex = orderedTeamIds.indexOf(String(over.id))
    if (oldIndex < 0 || newIndex < 0) return
    onReorder(arrayMove(orderedTeamIds, oldIndex, newIndex))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-lg">
          Melhores terceiros colocados
        </CardTitle>
        <CardDescription className="space-y-2">
          <span className="block">
            <strong className="text-foreground">Arraste pela alça</strong> para
            mudar a ordem da lista.
          </span>
          <span className="block">
            Os <strong className="text-foreground">8 primeiros</strong> classificam;
            os <strong className="text-foreground">4 últimos</strong> não. Na
            regra da Copa 2026, o chaveamento dos 3º depende de{" "}
            <strong className="text-foreground">quais 8 grupos</strong> entram
            nesse conjunto — reordenar só entre os que já estão acima da linha
            tracejada <strong className="text-foreground">não muda</strong> as
            partidas; quem muda é quem{" "}
            <strong className="text-foreground">sobe ou desce</strong> dessa
            linha.
          </span>
          {orderedTeamIds.length < totalThirdSlots ? (
            <span className="block text-foreground/80">
              Por enquanto {orderedTeamIds.length} de {totalThirdSlots} terceiros
              — os demais entram na lista conforme você marca o 3º em cada grupo.
            </span>
          ) : null}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={orderedTeamIds}
            strategy={verticalListSortingStrategy}
          >
            <ul className="flex flex-col gap-2">
              {orderedTeamIds.map((tid, i) => (
                <Fragment key={tid}>
                  <SortableThirdRow tid={tid} qualifies={i < 8} />
                  {i === 7 && orderedTeamIds.length > 8 ? (
                    <li
                      className="pointer-events-none list-none py-1"
                      aria-hidden
                    >
                      <div className="border-border/70 border-t border-dashed" />
                      <p className="text-muted-foreground px-1 pt-2 text-center text-[0.65rem] leading-snug font-medium tracking-wide uppercase">
                        Abaixo: fora dos 8 — arraste para subir ou descer e mudar
                        quem classifica
                      </p>
                    </li>
                  ) : null}
                </Fragment>
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      </CardContent>
    </Card>
  )
}
