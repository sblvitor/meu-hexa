import { flagUrl, getSelecao } from "@/data/copa2026"
import { cn } from "@/lib/utils"

export function TeamFlag({
  teamId,
  className,
  size = 22,
}: {
  teamId: string
  className?: string
  size?: number
}) {
  const t = getSelecao(teamId)
  if (!t) return null
  const w = Math.round(size * 1.4)
  return (
    <img
      src={flagUrl(t.iso2, w)}
      alt={`Bandeira ${t.nome}`}
      width={size}
      height={size}
      className={cn(
        "shrink-0 rounded-sm border border-border/60 object-cover",
        className,
      )}
      loading="lazy"
    />
  )
}
