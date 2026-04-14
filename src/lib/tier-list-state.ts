import { arrayMove } from "@dnd-kit/sortable"
import type { UniqueIdentifier } from "@dnd-kit/core"

import { SELECOES } from "@/data/copa2026"

export type TierDefinition = {
  id: string
  label: string
  /** Cor de fundo do rótulo (hex). Se ausente, usa `TIER_DEFAULT_LABEL_BACKGROUNDS` por índice. */
  labelBg?: string
}

export const POOL_ID = "pool"

/** Limite de linhas de tier no quadro (inclui todas as linhas, exceto o pool “Sem tier”). */
export const MAX_TIERS = 10

/**
 * Cores padrão dos rótulos (S→F clássico), em ciclo por posição.
 * Mantém o visual original quando `labelBg` não está definido.
 */
export const TIER_DEFAULT_LABEL_BACKGROUNDS = [
  "#FF7F7F",
  "#FFBF7F",
  "#FFDF7F",
  "#FFFF7F",
  "#BFFF7F",
  "#7FFF7F",
] as const

/**
 * Paleta circular (referência tier list): salmão → branco.
 * Ordem alinhada à imagem de referência do usuário.
 */
export const TIER_COLOR_SWATCHES = [
  { hex: "#FA8072", label: "Salmão" },
  { hex: "#FFBF7F", label: "Pêssego" },
  { hex: "#FFC84D", label: "Dourado" },
  { hex: "#FFF9A5", label: "Amarelo pálido" },
  { hex: "#B8E986", label: "Lima" },
  { hex: "#6EE7B7", label: "Menta" },
  { hex: "#7FE8FF", label: "Ciano" },
  { hex: "#59B4FF", label: "Azul céu" },
  { hex: "#A8B2FF", label: "Azul lavanda" },
  { hex: "#FF5CB8", label: "Rosa magenta" },
  { hex: "#E0AFFF", label: "Orquídea" },
  { hex: "#2F2F2F", label: "Carvão" },
  { hex: "#8E8E8E", label: "Cinza médio" },
  { hex: "#D4D4D4", label: "Prata" },
  { hex: "#FFFFFF", label: "Branco" },
] as const

function parseHexRgb(hex: string): { r: number; g: number; b: number } | null {
  const h = hex.replace("#", "").trim()
  if (h.length !== 6) return null
  const r = Number.parseInt(h.slice(0, 2), 16)
  const g = Number.parseInt(h.slice(2, 4), 16)
  const b = Number.parseInt(h.slice(4, 6), 16)
  if ([r, g, b].some((x) => Number.isNaN(x))) return null
  return { r, g, b }
}

function relativeLuminance(rgb: { r: number; g: number; b: number }): number {
  const lin = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * lin(rgb.r) + 0.7152 * lin(rgb.g) + 0.0722 * lin(rgb.b)
}

/**
 * Escolhe texto escuro vs claro pela maior razão de contraste (WCAG) com o fundo.
 * Evita falsos negativos em vermelhos/salmões saturados (luminância relativa baixa).
 */
export function isLightLabelBackground(hex: string): boolean {
  const rgb = parseHexRgb(hex)
  if (!rgb) return true
  const L = relativeLuminance(rgb)
  const contrastWithBlack = (L + 0.05) / 0.05
  const contrastWithWhite = 1.05 / (L + 0.05)
  return contrastWithBlack >= contrastWithWhite
}

export function resolveTierLabelBg(
  tier: TierDefinition,
  index: number,
): string {
  return (
    tier.labelBg ??
    TIER_DEFAULT_LABEL_BACKGROUNDS[
      index % TIER_DEFAULT_LABEL_BACKGROUNDS.length
    ]
  )
}

export function tierLabelInputTextClass(hex: string): string {
  return isLightLabelBackground(hex)
    ? "text-neutral-900 placeholder:text-neutral-500"
    : "text-neutral-100 placeholder:text-neutral-400"
}

export function tierLabelInputFocusRingClass(hex: string): string {
  return isLightLabelBackground(hex)
    ? "focus-visible:ring-neutral-900/30"
    : "focus-visible:ring-white/35"
}

/** Tiers top → bottom on screen: S (best) … D (worst). */
export const INITIAL_TIER_DEFINITIONS: Array<TierDefinition> = [
  { id: "t-s", label: "S" },
  { id: "t-a", label: "A" },
  { id: "t-b", label: "B" },
  { id: "t-c", label: "C" },
  { id: "t-d", label: "D" },
]

/** teamId → which container holds it */
export type ItemsByContainer = Record<string, Array<string>>
export type ContainerById = Record<string, string>

/**
 * Accent-fold + case-fold for stable ordering. `String.prototype.localeCompare`
 * can differ between SSR (workerd/Node) and the browser, which breaks hydration
 * when the pool order is rendered on the server.
 */
function nomeSortKey(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
}

export function defaultTeamIdsOrdered(): Array<string> {
  return [...SELECOES]
    .sort((a, b) => {
      const ka = nomeSortKey(a.nome)
      const kb = nomeSortKey(b.nome)
      if (ka < kb) return -1
      if (ka > kb) return 1
      return a.id.localeCompare(b.id)
    })
    .map((t) => t.id)
}

export function createInitialTiers(): Array<TierDefinition> {
  return INITIAL_TIER_DEFINITIONS.map((t) => ({ ...t }))
}

export function createInitialItems(tiers: Array<TierDefinition>): ItemsByContainer {
  const items: ItemsByContainer = {
    [POOL_ID]: defaultTeamIdsOrdered(),
  }
  for (const t of tiers) {
    items[t.id] = []
  }
  return items
}

export function findContainer(
  items: ItemsByContainer,
  id: UniqueIdentifier,
): string | undefined {
  const sid = String(id)
  if (Object.prototype.hasOwnProperty.call(items, sid)) return sid
  for (const [containerId, list] of Object.entries(items)) {
    if (list.includes(sid)) return containerId
  }
  return undefined
}

export function createContainerLookup(items: ItemsByContainer): ContainerById {
  const lookup: ContainerById = {}

  for (const [containerId, list] of Object.entries(items)) {
    lookup[containerId] = containerId
    for (const itemId of list) {
      lookup[itemId] = containerId
    }
  }

  return lookup
}

export function isContainerId(
  items: ItemsByContainer,
  id: UniqueIdentifier,
): boolean {
  return Object.prototype.hasOwnProperty.call(items, String(id))
}

/** Reorder within one container after drop. */
export function reorderWithinContainer(
  items: ItemsByContainer,
  containerId: string,
  activeId: string,
  targetIndex: number,
): ItemsByContainer {
  const list = items[containerId]
  const oldIndex = list.indexOf(activeId)
  const newIndex = Math.max(0, Math.min(targetIndex, list.length - 1))
  if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return items
  return {
    ...items,
    [containerId]: arrayMove(list, oldIndex, newIndex),
  }
}

export function moveItemToContainerAtIndex(
  items: ItemsByContainer,
  activeContainer: string,
  overContainer: string,
  activeId: string,
  overId: UniqueIdentifier,
  targetIndex?: number,
): ItemsByContainer {
  const activeItems = [...items[activeContainer]]
  const overItems = [...items[overContainer]]
  const activeIndex = activeItems.indexOf(activeId)
  if (activeIndex < 0) return items

  const [removed] = activeItems.splice(activeIndex, 1)
  const overSid = String(overId)

  let newIndex: number
  if (typeof targetIndex === "number") {
    newIndex = Math.max(0, Math.min(targetIndex, overItems.length))
  } else if (isContainerId(items, overId)) {
    newIndex = overItems.length
  } else {
    const overIndex = overItems.indexOf(overSid)
    newIndex = overIndex < 0 ? overItems.length : overIndex
  }

  overItems.splice(newIndex, 0, removed)

  return {
    ...items,
    [activeContainer]: activeItems,
    [overContainer]: overItems,
  }
}
