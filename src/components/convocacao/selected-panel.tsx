import { Share2Icon, XIcon } from "lucide-react"

import type { Jogador } from "@/data/jogadores"
import { POSICAO_LABEL, POSICOES } from "@/data/jogadores"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

const MAX_CONVOCADOS = 26

type SelectedPanelProps = {
  jogadores: Array<Jogador>
  count: number
  onRemove: (id: string) => void
  /** Evita ids duplicados quando sidebar e drawer coexistem no DOM (ex.: `sidebar` | `drawer`). */
  instanceId: "sidebar" | "drawer"
  className?: string
  listClassName?: string
  /** Chamado quando a lista atinge o mínimo de convocados; exibe CTA de compartilhar. */
  onShareClick?: () => void
}

export function SelectedPanel({
  jogadores,
  count,
  onRemove,
  instanceId,
  className,
  listClassName,
  onShareClick,
}: SelectedPanelProps) {
  const rowId = (playerId: string) => `${instanceId}-convocado-row-${playerId}`

  return (
    <div
      className={cn(
        "flex h-full min-h-0 flex-col overflow-hidden rounded-xl border-2 border-border bg-card/95 shadow-[4px_4px_0_var(--foreground)] backdrop-blur-md",
        className,
      )}
    >
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
        <h2 className="font-heading text-sm font-medium tracking-wide uppercase">Convocados</h2>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <span className="text-xs tabular-nums text-muted-foreground">
            {count}/{MAX_CONVOCADOS}
          </span>
          {count === MAX_CONVOCADOS && onShareClick ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="gap-1.5"
              onClick={onShareClick}
            >
              <Share2Icon data-icon="inline-start" />
              Compartilhar
            </Button>
          ) : null}
        </div>
      </div>
      {jogadores.length === 0 ? (
        <p className="px-4 py-6 text-sm text-muted-foreground">
          Nenhum jogador selecionado. Toque nos cards para montar os 26.
        </p>
      ) : (
        <ScrollArea className={cn("h-full min-h-0 flex-1", listClassName)}>
          <div className="flex flex-col gap-0 p-2">
            {POSICOES.map((p) => ({
              posicao: p,
              items: jogadores.filter((j) => j.posicao === p),
            }))
              .filter((g) => g.items.length > 0)
              .map((g, groupIndex) => (
                <section key={g.posicao} className="flex flex-col">
                  {groupIndex > 0 ? <Separator className="mb-2 opacity-60" /> : null}
                  <h3 className="px-2 pb-1.5 font-heading text-[0.65rem] font-medium tracking-wider text-muted-foreground uppercase">
                    {POSICAO_LABEL[g.posicao]}
                  </h3>
                  <ul className="flex flex-col gap-0">
                    {g.items.map((j) => (
                      <li key={j.id} id={rowId(j.id)}>
                        <div className="flex items-center gap-2 rounded-lg py-1.5 pr-1 pl-2 hover:bg-muted/60">
                          <img
                            src={j.foto}
                            alt=""
                            width={40}
                            height={40}
                            className="size-10 shrink-0 rounded-md object-cover"
                            decoding="async"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium leading-tight">{j.nome}</p>
                            <div className="mt-0.5 flex min-w-0 items-center gap-1.5">
                              <img
                                src={j.escudo}
                                alt=""
                                width={16}
                                height={16}
                                decoding="async"
                                className="size-4 shrink-0 object-contain opacity-90"
                              />
                              <p className="truncate text-xs text-muted-foreground">{j.clube}</p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="shrink-0"
                            onClick={() => onRemove(j.id)}
                            aria-label={`Remover ${j.nome} da seleção`}
                          >
                            <XIcon data-icon="inline-start" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}

export { MAX_CONVOCADOS }
