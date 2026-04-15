import { Link, useRouterState } from "@tanstack/react-router"
import { ExternalLink } from "lucide-react"

import { navItems } from "@/components/floating-nav"
import { siteFooterCredit } from "@/config/site"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

export function SiteFooter() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const { authorName, authorUrl, sourceUrl } = siteFooterCredit

  return (
    <footer className="mt-auto border-t-2 border-border bg-card/70 px-4 pt-8 pb-6 backdrop-blur-sm md:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3 lg:gap-8">
          <div className="space-y-2">
            <p className="font-heading text-sm tracking-wider uppercase">Meu Hexa</p>
            <p className="max-w-xs text-sm leading-snug text-muted-foreground">
              Ferramentas pra torcer, simular e ranquear a Copa do Mundo de 2026 — feito pra quem vive o
              hexa.
            </p>
          </div>

          <nav aria-label="Mapa do site" className="space-y-2">
            <p className="font-heading text-xs tracking-wider uppercase text-foreground">Navegação</p>
            <ul className="flex flex-col gap-1.5">
              {navItems.map(({ to, label, exact }) => {
                const active = exact ? pathname === to : pathname === to || pathname.startsWith(`${to}/`)
                return (
                  <li key={to}>
                    <Link
                      to={to}
                      className={cn(
                        "inline-flex rounded-sm text-sm text-muted-foreground transition-colors hover:text-foreground",
                        "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                        active && "font-medium text-foreground",
                      )}
                      aria-current={active ? "page" : undefined}
                    >
                      {label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="space-y-2 sm:col-span-2 lg:col-span-1">
            <p className="font-heading text-xs tracking-wider uppercase text-foreground">Projeto</p>
            <ul className="flex flex-col gap-2 text-sm">
              {sourceUrl ? (
                <li>
                  <a
                    href={sourceUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Código-fonte
                    <ExternalLink className="size-3.5 shrink-0 opacity-70" aria-hidden />
                  </a>
                </li>
              ) : null}
              {authorName ? (
                <li className="text-muted-foreground">
                  {authorUrl ? (
                    <a
                      href={authorUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-1.5 underline decoration-border underline-offset-4 transition-colors hover:text-foreground"
                    >
                      Feito por {authorName}
                      <ExternalLink className="size-3.5 shrink-0 opacity-70" aria-hidden />
                    </a>
                  ) : (
                    <span>Feito por {authorName}</span>
                  )}
                </li>
              ) : null}
              {!sourceUrl && !authorName ? (
                <li className="text-sm leading-snug text-muted-foreground">
                  Projeto independente sobre a Copa do Mundo 2026.
                </li>
              ) : null}
            </ul>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <p className="max-w-xl text-xs leading-snug text-muted-foreground">
            Meu Hexa não tem vínculo com a FIFA, a CBF ou patrocinadores oficiais.
            Marcas e escudos citados pertencem aos respectivos titulares.
          </p>
          <p className="shrink-0 text-xs text-muted-foreground">FIFA World Cup 2026 · conteúdo ilustrativo</p>
        </div>
      </div>
    </footer>
  )
}
