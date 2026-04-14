import * as React from "react"

const TIER_LETTERS = ["S", "A", "B", "C", "D"] as const

/**
 * Fundo fixo: malha leve, trilho de letras, arcos de canto e feixes — motivo visual próprio da tier list.
 */
export function TierListBackdrop() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden
    >
      {/* Malha de pontos — ritmo de “slots” no banco */}
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `radial-gradient(
            circle at center,
            oklch(0.2 0 0 / 0.06) 1px,
            transparent 1px
          )`,
          backgroundSize: "22px 22px",
        }}
      />

      {/* Arcos concêntricos no canto inferior esquerdo — quartos de círculo, leve */}
      <svg
        className="absolute bottom-0 left-0 h-44 w-44 text-primary/22 sm:h-56 sm:w-56"
        viewBox="0 0 120 120"
        fill="none"
      >
        <path
          d="M 96 120 A 96 96 0 0 0 0 24"
          stroke="currentColor"
          strokeWidth={1.15}
          strokeLinecap="round"
        />
        <path
          d="M 68 120 A 68 68 0 0 0 0 52"
          stroke="oklch(0.86 0.21 102 / 0.42)"
          strokeWidth={1.15}
          strokeLinecap="round"
        />
        <path
          d="M 40 120 A 40 40 0 0 0 0 80"
          stroke="oklch(0.53 0.1 250 / 0.32)"
          strokeWidth={1.15}
          strokeLinecap="round"
        />
      </svg>

      {/* Feixes — posições distintas das outras telas */}
      <div className="absolute -top-28 left-1/3 h-64 w-[min(100vw,36rem)] -rotate-[18deg] rounded-full bg-primary/11 blur-3xl" />
      <div className="absolute top-[40%] -right-24 h-72 w-[min(90vw,30rem)] rotate-12 rounded-full bg-accent/13 blur-3xl" />

      {/* Trilho vertical S→D — borda direita */}
      <div className="absolute top-1/2 right-3 hidden -translate-y-1/2 flex-col gap-3 sm:right-6 md:flex">
        {TIER_LETTERS.map((L, i) => (
          <span
            key={L}
            className="font-heading text-[0.65rem] font-bold tracking-[0.35em] text-foreground/18"
            style={{ opacity: 0.35 + i * 0.1 }}
          >
            {L}
          </span>
        ))}
      </div>

      {/* Ícone leve: setas de reordenação (arrastar) */}
      <svg
        className="absolute top-[18%] right-[10%] hidden h-24 w-24 text-muted-foreground/16 sm:block md:right-[14%]"
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.1}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M30 38h40M30 50h28M30 62h36" className="text-foreground/25" />
        <path
          d="M68 34l6 4-6 4M68 58l6 4-6 4"
          className="text-accent/40"
        />
      </svg>

      {/* Marca d’água */}
      <span className="absolute bottom-[12%] right-[6%] font-heading text-[clamp(3.5rem,22vw,11rem)] leading-none tracking-[-0.08em] text-foreground/[0.035] select-none">
        <span className="block">48</span>
        <span className="mt-1 block text-[0.28em] tracking-[0.42em] text-foreground/[0.055]">
          ranqueadas
        </span>
      </span>
    </div>
  )
}

/** Faixa decorativa com letras padrão de tier — eco visual do tabuleiro. */
export function TierListLettersStrip() {
  return (
    <div
      className="mb-6 flex flex-wrap items-center gap-2 sm:gap-3"
      aria-hidden
    >
      {TIER_LETTERS.map((L, i) => (
        <React.Fragment key={L}>
          {i > 0 ? (
            <span className="font-heading text-xs text-border/45">↓</span>
          ) : null}
          <span
            className="flex size-9 items-center justify-center rounded-md border-2 border-foreground/80 bg-background font-heading text-sm font-bold shadow-[2px_2px_0_var(--foreground)] sm:size-10 sm:text-base"
            style={{
              color:
                i === 0
                  ? "oklch(0.45 0.14 150)"
                  : i === 1
                    ? "oklch(0.35 0.06 255)"
                    : undefined,
            }}
          >
            {L}
          </span>
        </React.Fragment>
      ))}
      <span className="ml-1 font-heading text-[0.6rem] tracking-[0.2em] text-muted-foreground/70 uppercase">
        · padrão
      </span>
    </div>
  )
}
