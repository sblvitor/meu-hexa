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
        "group relative w-full overflow-hidden rounded-xl border-2 border-border bg-card text-left shadow-[3px_3px_0_var(--foreground)] outline-none transition-shadow",
        "focus-visible:ring-3 focus-visible:ring-ring/50",
        selected && "border-primary ring-2 ring-primary ring-offset-2 ring-offset-background",
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
              className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md"
              aria-hidden
            >
              <CheckIcon />
            </span>
          ) : null}
        </div>
        <CardHeader className="flex flex-row items-start gap-3 pt-3 pb-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md border border-border/60 bg-card p-1">
            <img
              src={jogador.escudo}
              alt={`Imagem do escudo do ${jogador.clube}`}
              width={32}
              height={32}
              decoding="async"
              className="max-h-7 max-w-full object-contain"
              loading="lazy"
            />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <CardTitle className="text-sm leading-tight">{jogador.nome}</CardTitle>
            <CardDescription className="line-clamp-2 text-xs">{jogador.clube}</CardDescription>
          </div>
        </CardHeader>
      </Card>

      <span className="sr-only">
        {selected ? "Remover da seleção" : "Incluir na seleção"}: {jogador.nome}
      </span>
    </button>
  )
}
