import { XIcon } from "lucide-react"

import type { Jogador } from "@/data/jogadores"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

const MAX_CONVOCADOS = 26

type SelectedPanelProps = {
  jogadores: Array<Jogador>
  count: number
  onRemove: (id: string) => void
  className?: string
  listClassName?: string
}

export function SelectedPanel({
  jogadores,
  count,
  onRemove,
  className,
  listClassName,
}: SelectedPanelProps) {
  return (
    <div
      className={cn(
        "flex h-full min-h-0 flex-col overflow-hidden rounded-xl border-2 border-border bg-card/95 shadow-[4px_4px_0_var(--foreground)] backdrop-blur-md",
        className,
      )}
    >
      <div className="flex shrink-0 items-baseline justify-between gap-2 border-b border-border px-4 py-3">
        <h2 className="font-heading text-sm font-medium tracking-wide uppercase">Convocados</h2>
        <span className="text-xs tabular-nums text-muted-foreground">
          {count}/{MAX_CONVOCADOS}
        </span>
      </div>
      {jogadores.length === 0 ? (
        <p className="px-4 py-6 text-sm text-muted-foreground">
          Nenhum jogador selecionado. Toque nos cards para montar os 26.
        </p>
      ) : (
        <ScrollArea className={cn("h-full min-h-0 flex-1", listClassName)}>
          <ul className="flex flex-col gap-0 p-2">
            {jogadores.map((j, index) => (
              <li key={j.id}>
                {index > 0 ? <Separator className="my-1" /> : null}
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
        </ScrollArea>
      )}
    </div>
  )
}

export { MAX_CONVOCADOS }
