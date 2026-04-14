import { flagUrl, getSelecao } from "@/data/copa2026"
import { cn } from "@/lib/utils"

export function TeamFlag({
  teamId,
  className,
  size = 22,
  /** Caixa quadrada com recorte (tier list). O simulador usa o default: `<img>` inline. */
  framed = false,
}: {
  teamId: string
  className?: string
  size?: number
  framed?: boolean
}) {
  const t = getSelecao(teamId)
  if (!t) return null
  const s = Math.round(size)
  const srcW = Math.round(s * 1.4)

  if (framed) {
    return (
      <span
        className={cn(
          "inline-block shrink-0 overflow-hidden rounded-sm border border-border/60 align-middle",
          className,
        )}
        style={{ width: s, height: s }}
      >
        <img
          src={flagUrl(t.iso2, srcW)}
          alt={`Bandeira ${t.nome}`}
          width={s}
          height={s}
          className="size-full object-cover"
          loading="lazy"
          decoding="async"
        />
      </span>
    )
  }

  return (
    <img
      src={flagUrl(t.iso2, srcW)}
      alt={`Bandeira ${t.nome}`}
      width={s}
      height={s}
      className={cn(
        "shrink-0 rounded-sm border border-border/60 object-cover",
        className,
      )}
      loading="lazy"
      decoding="async"
    />
  )
}
