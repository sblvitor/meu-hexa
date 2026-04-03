import * as React from "react"
import { Link, createFileRoute } from "@tanstack/react-router"
import { motion } from "motion/react"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { useCountdown } from "@/hooks/use-countdown"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export const Route = createFileRoute("/")({ component: LandingPage })

const BRAZIL_DEBUT = new Date("2026-06-13T19:00:00-03:00")

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.13 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
}

const FEATURES = [
  {
    num: "01",
    title: "Convocação",
    desc: "Escale os 26 convocados da seleção brasileira. Filtre por posição, busque por nome e gere um card estilizado pra compartilhar com a galera.",
    cta: "Montar seleção",
    to: "/convocacao",
    border: "border-primary",
  },
  {
    num: "02",
    title: "Simulador",
    desc: "Preencha os placares da fase de grupos até a grande final. Penaltis incluídos. Veja o resumo visual da campanha completa.",
    cta: "Simular Copa",
    to: "/simulador",
    border: "border-secondary",
  },
  {
    num: "03",
    title: "Tier List",
    desc: "Organize as 48 seleções em tiers de S a F com drag-and-drop. Monte seu ranking e compartilhe.",
    cta: "Criar ranking",
    to: "/tier-list",
    border: "border-accent",
  },
] as const

function LandingPage() {
  const { days, hours, minutes, seconds } = useCountdown(BRAZIL_DEBUT)

  return (
    <div className="overflow-x-hidden">
      {/* ════════ HERO ════════ */}
      <section className="relative flex min-h-[calc(100svh-5rem)] flex-col items-center justify-center overflow-hidden px-4 pb-16">
        {/* bg: diagonal stripe (flag sash) + field center circle + year watermark */}
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
        >
          <div className="absolute top-1/2 left-1/2 h-[100px] w-[250vw] -translate-x-1/2 -translate-y-1/2 -rotate-12 bg-secondary/13 md:h-[160px]" />
          <div className="absolute top-1/2 left-1/2 size-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-primary/5 md:size-[700px]" />
          <div className="absolute top-1/2 left-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/8" />
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-heading text-[28vw] leading-none text-foreground/[1.8%] select-none">
            2026
          </span>
        </div>

        <motion.div
          className="relative flex flex-col items-center"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          {/* ★★★★★☆ — five won, sixth loading */}
          <motion.div
            variants={fadeUp}
            className="flex items-center gap-1 sm:gap-1.5"
          >
            {[1, 2, 3, 4, 5].map((i) => (
              <span
                key={i}
                className="text-xl text-secondary drop-shadow-[0_1px_0_rgba(0,0,0,.15)] sm:text-2xl md:text-3xl"
              >
                ★
              </span>
            ))}
            <span className="text-xl text-secondary/25 sm:text-2xl md:text-3xl">
              ★
            </span>
          </motion.div>

          {/* MEU HEXA */}
          <motion.h1
            variants={fadeUp}
            className="mt-3 text-center text-[clamp(5rem,18vw,15rem)] leading-[0.82] tracking-[-0.06em]"
          >
            <span className="block">MEU</span>
            <span className="relative block text-primary">
              HEXA
              <span
                className="absolute -bottom-1 left-0 h-[0.12em] w-full -rotate-[0.8deg] bg-secondary/40"
                aria-hidden="true"
              />
            </span>
          </motion.h1>

          {/* Rotated accent — desktop */}
          <span
            className="pointer-events-none absolute top-1/2 -right-20 hidden -translate-y-1/2 -rotate-90 font-heading text-[0.6rem] tracking-[0.4em] text-muted-foreground/25 select-none lg:block"
            aria-hidden="true"
          >
            O SEXTO VEM · 2026
          </span>

          {/* Tagline */}
          <motion.p
            variants={fadeUp}
            className="mt-8 max-w-md text-center text-base leading-relaxed text-muted-foreground md:text-lg"
          >
            Chega de arquibancada. Escale o time, simule a campanha e prove que
            você entende mais que o técnico.
          </motion.p>

          {/* CTA */}
          <motion.div variants={fadeUp} className="mt-8">
            <Button asChild size="lg">
              <Link to="/convocacao">
                Começar
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          </motion.div>

          {/* ── Match-ticket countdown ── */}
          <motion.div variants={fadeUp} className="mt-16 w-full max-w-88">
            <Card className="gap-0 rounded-none py-0">
              <CardHeader className="flex flex-row items-center justify-between rounded-none border-b-2 border-dashed border-border/40 px-5 py-3">
                <CardTitle className="text-[0.6rem] tracking-[0.2em] sm:text-xs">
                  ESTREIA DO BRASIL
                </CardTitle>
                <CardDescription className="font-heading text-[0.6rem] tracking-wider sm:text-xs">
                  13 JUN 2026
                </CardDescription>
              </CardHeader>

              <CardContent className="flex items-center justify-center gap-2.5 px-5 py-5 sm:gap-3.5">
                {(
                  [
                    [days, "DIAS"],
                    [hours, "HRS"],
                    [minutes, "MIN"],
                    [seconds, "SEG"],
                  ] as const
                ).map(([v, l], i) => (
                  <React.Fragment key={l}>
                    {i > 0 && (
                      <span className="mb-3 font-heading text-lg text-border/40 sm:text-xl">
                        :
                      </span>
                    )}
                    <div className="flex flex-col items-center">
                      <span className="font-heading text-2xl tabular-nums sm:text-3xl md:text-4xl">
                        {String(v).padStart(2, "0")}
                      </span>
                      <span className="mt-0.5 text-[0.5rem] tracking-[0.2em] text-muted-foreground uppercase sm:text-[0.6rem]">
                        {l}
                      </span>
                    </div>
                  </React.Fragment>
                ))}
              </CardContent>

              <CardFooter className="justify-center rounded-none border-dashed border-border/30 bg-transparent p-2">
                <span className="text-[0.55rem] tracking-[0.3em] text-muted-foreground/50">
                  ★★★★★☆
                </span>
              </CardFooter>
            </Card>
          </motion.div>
        </motion.div>
      </section>

      {/* ════════ FEATURES ════════ */}
      <section className="px-4 py-20 md:px-8 lg:py-28">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="mb-16 md:mb-20"
          >
            <h2 className="text-4xl leading-[1.1] md:text-6xl">
              Três jogadas
              <br />
              <span className="text-primary">pro hexa</span>
            </h2>
          </motion.div>

          <div className="flex flex-col">
            {FEATURES.map((feat, i) => (
              <React.Fragment key={feat.num}>
                {i > 0 && (
                  <div
                    className="flex items-center justify-center py-6"
                    aria-hidden="true"
                  >
                    <span className="text-xs text-secondary/50">★</span>
                  </div>
                )}

                <motion.article
                  className={cn(
                    "relative border-l-[6px] py-10 pl-8 md:py-14 md:pl-12",
                    feat.border,
                    i === 1 && "md:ml-auto md:max-w-[80%]",
                    i === 2 && "md:max-w-[75%]"
                  )}
                  initial={{ opacity: 0, x: i === 1 ? 30 : -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5 }}
                >
                  <span
                    className="pointer-events-none absolute top-2 -left-3 font-heading text-[7rem] leading-none text-foreground/[0.035] select-none md:-top-4 md:-left-6 md:text-[11rem]"
                    aria-hidden="true"
                  >
                    {feat.num}
                  </span>
                  <div className="relative">
                    <h3 className="text-2xl md:text-4xl">{feat.title}</h3>
                    <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground md:text-base">
                      {feat.desc}
                    </p>
                    <Link
                      to={feat.to}
                      className="group/link mt-6 inline-flex items-center gap-2 font-heading text-sm tracking-wider uppercase transition-all hover:gap-3"
                    >
                      {feat.cta}
                      <ArrowRight className="size-4 transition-transform group-hover/link:translate-x-0.5" />
                    </Link>
                  </div>
                </motion.article>
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ FOOTER ════════ */}
      <footer className="px-4 pt-16 pb-8 md:px-8">
        <div className="mx-auto max-w-5xl">
          <Separator className="mb-8" />
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="font-heading text-sm tracking-wider">Meu Hexa</p>
            <p className="text-xs text-muted-foreground">
              Feito com paixão pelo hexa · FIFA 2026
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
