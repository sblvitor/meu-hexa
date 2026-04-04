import * as React from "react"
import { createFileRoute } from "@tanstack/react-router"
import { UsersIcon } from "lucide-react"

import type { Posicao } from "@/data/jogadores"
import { JOGADORES, POSICAO_LABEL, POSICOES } from "@/data/jogadores"
import { PlayerCard } from "@/components/convocacao/player-card"
import { MAX_CONVOCADOS, SelectedPanel } from "@/components/convocacao/selected-panel"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/convocacao")({
  component: ConvocacaoPage,
})

const ALL = "all"

const jogadorMap = new Map(JOGADORES.map((j) => [j.id, j]))

function stripAccents(s: string) {
  return s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
}

function ConvocacaoPage() {
  const [search, setSearch] = React.useState("")
  const [posicao, setPosicao] = React.useState<string>(ALL)
  const [orderedIds, setOrderedIds] = React.useState<Array<string>>([])
  const [drawerOpen, setDrawerOpen] = React.useState(false)

  const selectedSet = React.useMemo(() => new Set(orderedIds), [orderedIds])

  const selectedJogadores = React.useMemo(
    () => orderedIds.map((id) => jogadorMap.get(id)).filter(Boolean) as typeof JOGADORES,
    [orderedIds],
  )

  const searchNorm = stripAccents(search.trim())

  const filtered = React.useMemo(() => {
    return JOGADORES.filter((j) => {
      if (posicao !== ALL && j.posicao !== (posicao as Posicao)) return false
      if (!searchNorm) return true
      return stripAccents(j.nome).includes(searchNorm)
    })
  }, [posicao, searchNorm])

  function toggleId(id: string) {
    setOrderedIds((prev) => {
      const i = prev.indexOf(id)
      if (i >= 0) return prev.filter((x) => x !== id)
      if (prev.length >= MAX_CONVOCADOS) return prev
      return [...prev, id]
    })
  }

  function removeId(id: string) {
    setOrderedIds((prev) => prev.filter((x) => x !== id))
  }

  return (
    <div className="relative mx-auto max-w-[1600px] px-4 pb-20 lg:pr-80">
      <header className="mb-8 max-w-2xl">
        <p className="font-heading text-xs font-medium tracking-widest text-muted-foreground uppercase">
          Copa do Mundo 2026
        </p>
        <h1 className="mt-1 font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
          Convocação
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Monte os 26 nomes a partir do elenco abaixo. Use busca e posição para achar jogadores; a lista à direita
          acompanha cada escolha — no celular, ela abre no painel inferior.
        </p>
      </header>

      <FieldGroup className="mb-8">
        <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-end md:gap-x-4 md:gap-y-3">
          <Field className="min-w-0 w-full shrink-0 md:w-56 lg:w-64">
            <FieldLabel htmlFor="convocacao-busca">Buscar por nome</FieldLabel>
            <Input
              id="convocacao-busca"
              placeholder="Ex.: Vinícius, Marquinhos…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoComplete="off"
            />
          </Field>
          <Field className="min-w-0 w-full flex-1 md:min-w-0">
            <FieldLabel id="convocacao-posicao-label">Posição</FieldLabel>
            <ToggleGroup
              type="single"
              value={posicao}
              onValueChange={(v) => {
                if (v) setPosicao(v)
              }}
              variant="outline"
              size="sm"
              spacing={2}
              aria-labelledby="convocacao-posicao-label"
              className="flex w-full flex-wrap content-start gap-2"
            >
              <ToggleGroupItem value={ALL} className="text-xs sm:text-sm">
                Todas
              </ToggleGroupItem>
              {POSICOES.map((p) => (
                <ToggleGroupItem key={p} value={p} className="text-xs sm:text-sm">
                  {POSICAO_LABEL[p]}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </Field>
          <div className="flex w-full shrink-0 md:w-auto lg:hidden">
            <Drawer direction="bottom" open={drawerOpen} onOpenChange={setDrawerOpen}>
              <DrawerTrigger asChild>
                <Button type="button" variant="outline" className="w-full gap-2 md:w-auto">
                  <UsersIcon data-icon="inline-start" />
                  Convocados ({orderedIds.length})
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle className="sr-only">Jogadores convocados</DrawerTitle>
                </DrawerHeader>
                <div className="px-4 pb-8">
                  <SelectedPanel
                    jogadores={selectedJogadores}
                    count={orderedIds.length}
                    onRemove={removeId}
                    listClassName="max-h-[55vh]"
                  />
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        </div>
      </FieldGroup>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 md:gap-3 lg:grid-cols-5 lg:gap-3 xl:grid-cols-5">
        {filtered.map((j) => (
          <PlayerCard
            key={j.id}
            jogador={j}
            selected={selectedSet.has(j.id)}
            onToggle={() => toggleId(j.id)}
          />
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-10 text-center text-sm text-muted-foreground">
          Nenhum jogador encontrado com esses filtros.
        </p>
      ) : null}

      <aside
        className={cn(
          "fixed top-24 right-4 z-40 hidden h-[calc(100svh-6.5rem)] w-[min(18rem,calc(100vw-2rem))] lg:flex lg:flex-col",
        )}
      >
        <SelectedPanel
          jogadores={selectedJogadores}
          count={orderedIds.length}
          onRemove={removeId}
          listClassName="min-h-0"
        />
      </aside>
    </div>
  )
}
