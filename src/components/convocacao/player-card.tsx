import { CheckIcon } from "lucide-react"

import type { Jogador } from "@/data/jogadores"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type PlayerCardProps = {
  jogador: Jogador
  selected: boolean
  onToggle: () => void
}

export function PlayerCard({ jogador, selected, onToggle }: PlayerCardProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      className={cn(
        "group relative w-full overflow-hidden rounded-lg border-2 border-border bg-card text-left outline-none transition-shadow",
        "focus-visible:ring-3 focus-visible:ring-ring/50",
        selected && "border-primary",
      )}
    >
      <Card className="gap-0 border-0 py-0 shadow-none ring-0">
        <div className="relative aspect-3/4 w-full shrink-0 overflow-hidden rounded-none">
          <img
            src={jogador.foto}
            alt={`Imagem do jogador ${jogador.nome}`}
            width={300}
            height={400}
            decoding="async"
            className={cn(
              "size-full object-cover transition-[filter,opacity] duration-300",
              "grayscale opacity-90",
              "group-hover:grayscale-0 group-hover:opacity-100",
              selected && "grayscale-0 opacity-100",
            )}
            loading="lazy"
          />
          {selected ? (
            <span
              className="absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md"
              aria-hidden
            >
              <CheckIcon />
            </span>
          ) : null}
        </div>
        <CardHeader className="flex flex-row items-start gap-2 px-2.5 pt-2 pb-2.5 sm:px-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded border border-border/60 bg-card p-0.5 sm:size-9">
            <img
              src={jogador.escudo}
              alt={`Imagem do escudo do ${jogador.clube}`}
              width={28}
              height={28}
              decoding="async"
              className="max-h-6 max-w-full object-contain sm:max-h-7"
              loading="lazy"
            />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <CardTitle className="text-xs leading-snug sm:text-sm">{jogador.nome}</CardTitle>
            <CardDescription className="line-clamp-2 text-[0.65rem] leading-snug sm:text-xs">
              {jogador.clube}
            </CardDescription>
          </div>
        </CardHeader>
      </Card>

      <span className="sr-only">
        {selected ? "Remover da seleção" : "Incluir na seleção"}: {jogador.nome}
      </span>
    </button>
  )
}
