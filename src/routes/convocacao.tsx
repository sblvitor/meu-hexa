import * as React from "react"
import { createFileRoute } from "@tanstack/react-router"
import { motion } from "motion/react"
import { UsersIcon } from "lucide-react"

import { toast } from "sonner"
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

const TOAST_LIMITE_ID = "convocado-limite-26"

const jogadorMap = new Map(JOGADORES.map((j) => [j.id, j]))

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
}

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
  const prevConvocadosLenRef = React.useRef(0)
  const addBlockedAtLimitRef = React.useRef(false)

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

  React.useEffect(() => {
    if (orderedIds.length > prevConvocadosLenRef.current) {
      const lastId = orderedIds[orderedIds.length - 1]
      const prefix = window.matchMedia("(min-width: 1024px)").matches ? "sidebar" : "drawer"
      requestAnimationFrame(() => {
        document
          .getElementById(`${prefix}-convocado-row-${lastId}`)
          ?.scrollIntoView({ behavior: "smooth", block: "nearest" })
      })
    }
    prevConvocadosLenRef.current = orderedIds.length
  }, [orderedIds])

  React.useEffect(() => {
    if (orderedIds.length < MAX_CONVOCADOS) {
      toast.dismiss(TOAST_LIMITE_ID)
    }
  }, [orderedIds.length])

  function toggleId(id: string) {
    addBlockedAtLimitRef.current = false
    setOrderedIds((prev) => {
      const i = prev.indexOf(id)
      if (i >= 0) return prev.filter((x) => x !== id)
      if (prev.length >= MAX_CONVOCADOS) {
        addBlockedAtLimitRef.current = true
        return prev
      }
      return [...prev, id]
    })
    queueMicrotask(() => {
      if (!addBlockedAtLimitRef.current) return
      addBlockedAtLimitRef.current = false
      toast.warning("Limite de 26 convocados", {
        id: TOAST_LIMITE_ID,
        description: "Remova alguém da lista para adicionar outro jogador.",
      })
    })
  }

  function removeId(id: string) {
    setOrderedIds((prev) => prev.filter((x) => x !== id))
  }

  return (
    <div className="relative overflow-x-hidden pb-20">
      <div
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
        aria-hidden
      >
        <div className="absolute top-[8%] left-1/2 h-18 w-[220vw] max-w-none -translate-x-1/2 -rotate-11 bg-secondary/18 sm:h-22 md:h-26" />
        <div className="absolute -top-24 -left-20 size-[min(85vw,24rem)] rounded-full bg-primary/10 blur-3xl md:size-112" />
        <div className="absolute right-0 bottom-[10%] size-[min(70vw,18rem)] translate-x-1/4 rounded-full bg-accent/12 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 size-[min(110vw,48rem)] -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-primary/8 md:size-224" />
        <div className="absolute top-1/2 left-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15" />
        <span className="absolute top-24 right-[12%] font-heading text-[18vw] leading-none text-foreground/2.5 select-none sm:text-[14vw] lg:text-[min(12rem,11vw)]">
          26
        </span>
      </div>

      <div className="relative mx-auto max-w-[1600px] px-4 lg:pr-80">
        <motion.header
          className="relative mb-10 max-w-2xl"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={fadeUp} className="mb-2 flex items-center gap-2">
            <span className="h-1 w-8 shrink-0 rounded-full bg-primary sm:w-10" />
            <span className="text-secondary drop-shadow-[0_1px_0_rgba(0,0,0,.12)]">★★★★★</span>
            <span className="h-1 flex-1 max-w-16 rounded-full bg-linear-to-r from-primary/40 to-transparent sm:max-w-20" />
          </motion.div>
          <motion.p
            variants={fadeUp}
            className="font-heading text-xs font-medium tracking-widest text-primary uppercase"
          >
            Copa do Mundo 2026
          </motion.p>
          <motion.h1
            variants={fadeUp}
            className="mt-1 font-heading text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl"
          >
            Convocação
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base"
          >
            Monte os 26 nomes a partir do elenco abaixo. Use busca e posição para achar jogadores; a lista à direita
            acompanha cada escolha — no celular, ela abre no painel inferior.
          </motion.p>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2, ease: "easeOut" }}
        >
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
                    instanceId="drawer"
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
        </motion.div>

      <motion.div
        className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 md:gap-3 lg:grid-cols-5 lg:gap-3 xl:grid-cols-5"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.28, ease: "easeOut" }}
      >
        {filtered.map((j) => (
          <PlayerCard
            key={j.id}
            jogador={j}
            selected={selectedSet.has(j.id)}
            onToggle={() => toggleId(j.id)}
          />
        ))}
      </motion.div>

      {filtered.length === 0 ? (
        <p className="mt-10 text-center text-sm text-muted-foreground">
          Nenhum jogador encontrado com esses filtros.
        </p>
      ) : null}

      <aside
        className={cn(
          "fixed top-24 right-8 z-40 hidden h-[calc(100svh-6.5rem)] w-[min(18rem,calc(100vw-2rem))] lg:flex lg:flex-col",
        )}
      >
        <SelectedPanel
          instanceId="sidebar"
          jogadores={selectedJogadores}
          count={orderedIds.length}
          onRemove={removeId}
          listClassName="min-h-0"
        />
      </aside>
      </div>
    </div>
  )
}
