import { createFileRoute } from "@tanstack/react-router"
import { motion } from "motion/react"

import { TierListBoard } from "@/components/tier-list/tier-list-board"
import {
  TierListBackdrop,
  TierListLettersStrip,
} from "@/components/tier-list/tier-list-page-decor"
import { buildSeoHead, buildWebPageSchema } from "@/lib/seo"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const Route = createFileRoute("/tier-list")({
  head: () =>
    buildSeoHead({
      title: "Tier List das Selecoes",
      description:
        "Monte sua tier list da Copa do Mundo 2026 com as 48 selecoes do torneio, arraste os times entre tiers e compartilhe seu ranking.",
      path: "/tier-list",
      schema: [
        buildWebPageSchema({
          title: "Tier List das Selecoes",
          description:
            "Monte sua tier list da Copa do Mundo 2026 com as 48 selecoes do torneio, arraste os times entre tiers e compartilhe seu ranking.",
          path: "/tier-list",
        }),
      ],
    }),
  component: TierListPage,
})

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.48, ease: "easeOut" as const },
  },
}

function TierListPage() {
  return (
    <div className="relative overflow-x-hidden pb-24">
      <TierListBackdrop />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-5">
        <motion.header
          className="relative mb-10 max-w-3xl"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          <motion.div
            variants={fadeUp}
            className="mb-3 flex items-center gap-2 sm:mb-4"
          >
            <span className="h-1 w-6 shrink-0 rounded-full bg-secondary sm:w-8" />
            <span className="font-heading text-xs font-medium tracking-[0.28em] text-secondary uppercase">
              Seu ranking
            </span>
            <span className="h-px flex-1 max-w-24 rounded-full bg-linear-to-r from-secondary/55 to-transparent sm:max-w-32" />
          </motion.div>

          <motion.div variants={fadeUp}>
            <TierListLettersStrip />
          </motion.div>

          <motion.p
            variants={fadeUp}
            className="font-heading text-xs font-medium tracking-widest text-primary uppercase"
          >
            Tier list · Copa 2026
          </motion.p>
          <motion.h1
            variants={fadeUp}
            className="mt-1 font-heading text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            Organize as seleções
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base"
          >
            Arraste as 48 seleções da Copa 2026 entre os tiers (S no topo até D)
            ou deixe-as em{" "}
            <strong className="text-foreground">Sem tier</strong>. Renomeie
            linhas, crie novos tiers ou remova um tier — as seleções da linha
            voltam para o banco.
          </motion.p>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12, ease: "easeOut" }}
        >
          <Card className="relative overflow-hidden border-2 border-border shadow-[4px_4px_0_var(--foreground)]">
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-linear-to-r from-primary/70 via-secondary/80 to-accent/60"
              aria-hidden
            />
            <CardHeader className="relative pb-2">
              <CardTitle className="font-heading text-lg">
                Ranking das seleções
              </CardTitle>
              <p className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
                Cada linha é um tier: arraste bandeiras entre elas ou solte no
                banco inferior.
              </p>
            </CardHeader>
            <CardContent className="relative pt-2">
              <TierListBoard />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
