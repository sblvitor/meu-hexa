import * as React from "react"

/** Fundo fixo: linhas de “campo”, arco central e traços de chaveamento (motivos próprios desta tela). */
export function SimuladorBackdrop() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden
    >
      {/* Linhas horizontais — ritmo de campo, sem repetir a faixa diagonal da convocação */}
      <div
        className="absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            180deg,
            transparent 0,
            transparent 44px,
            oklch(0.57 0.14 150 / 0.07) 44px,
            oklch(0.57 0.14 150 / 0.07) 45px
          )`,
        }}
      />
      {/* Arco superior — meia-lua, eco do círculo central da landing, mas só o arco */}
      <div className="absolute -top-40 left-1/2 h-72 w-[min(140vw,72rem)] -translate-x-1/2 rounded-b-[50%] border-x-2 border-b-2 border-primary/15 bg-transparent" />
      {/* Feixes suaves — posições diferentes dos blocos da convocação */}
      <div className="absolute -top-20 right-[-10%] h-48 w-[min(90vw,28rem)] rotate-[8deg] rounded-full bg-accent/14 blur-3xl" />
      <div className="absolute bottom-[15%] -left-16 h-56 w-[min(85vw,26rem)] -rotate-6 rounded-full bg-secondary/18 blur-3xl" />
      {/* “Cantoneiras” de chaveamento — SVG leve, tema eliminatória */}
      <svg
        className="absolute top-16 right-[6%] hidden h-36 w-36 text-muted-foreground/18 sm:block"
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.25}
        strokeLinecap="square"
      >
        <path d="M12 88V52h36M88 12H52v36" />
        <path d="M22 78V62h16M78 22h-16v16" className="text-accent/35" />
      </svg>
      <svg
        className="absolute bottom-28 left-4 h-28 w-28 text-muted-foreground/14 sm:left-[8%] sm:h-32 sm:w-32"
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.25}
        strokeLinecap="square"
      >
        <path d="M88 88H52V52" />
        <path d="M78 78H62V62" className="text-secondary/40" />
      </svg>
      {/* Marca d’água: 48 seleções */}
      <span className="absolute right-[4%] bottom-[8%] font-heading text-[clamp(4.5rem,28vw,14rem)] leading-[0.85] tracking-[-0.07em] text-foreground/4.5 select-none">
        <span className="block">48</span>
        <span className="block text-[0.42em] tracking-[0.25em] text-foreground/6">
          seleções
        </span>
      </span>
    </div>
  )
}

export function SimuladorSectionHeading({
  kicker,
  title,
  hint,
}: {
  kicker: string
  title: string
  hint?: string
}) {
  return (
    <header className="mb-4 max-w-3xl">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-heading rounded-sm border-2 border-foreground bg-background px-2 py-0.5 text-[0.62rem] font-bold tracking-[0.18em] shadow-[2px_2px_0_var(--foreground)]">
          {kicker}
        </span>
        <h2 className="font-heading text-lg font-bold tracking-tight text-foreground sm:text-xl">
          {title}
        </h2>
      </div>
      {hint ? (
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">
          {hint}
        </p>
      ) : null}
    </header>
  )
}

/** Divisória estilo “perforação de ingresso”, diferente do Separator genérico. */
export function SimuladorTicketDivider() {
  return (
    <div
      className="relative my-12 flex items-center gap-2 sm:my-14"
      aria-hidden
    >
      <div className="h-0 flex-1 border-t-2 border-dashed border-border/55" />
      <div className="flex items-center gap-1 px-1">
        {Array.from({ length: 7 }).map((_, i) => (
          <span
            key={i}
            className="size-1.5 shrink-0 rounded-full border border-foreground/25 bg-muted/60 shadow-[1px_1px_0_var(--foreground)]"
          />
        ))}
      </div>
      <div className="h-0 flex-1 border-t-2 border-dashed border-border/55" />
    </div>
  )
}

const pipelineSteps = [
  { id: "01", label: "Grupos" },
  { id: "02", label: "Terceiros" },
  { id: "03", label: "Mata-mata" },
] as const

export function SimuladorPipelineDecor() {
  return (
    <div
      className="mb-6 flex flex-wrap items-center gap-2 text-[0.65rem] font-medium tracking-wide text-muted-foreground uppercase sm:gap-3 sm:text-xs"
      aria-hidden
    >
      {pipelineSteps.map((s, i) => (
        <React.Fragment key={s.id}>
          {i > 0 ? (
            <span className="hidden text-border/50 sm:inline">—</span>
          ) : null}
          <span className="flex items-center gap-2">
            <span className="font-heading text-secondary">✦</span>
            <span className="rounded border border-border/80 bg-muted/30 px-1.5 py-px font-heading text-[0.6rem] tracking-widest">
              {s.id}
            </span>
            <span className="text-foreground/80">{s.label}</span>
          </span>
        </React.Fragment>
      ))}
    </div>
  )
}
