import * as React from "react"
import { Link, useRouterState } from "@tanstack/react-router"

import tacaCopa from "@/assets/taca_copa.png"
import { cn } from "@/lib/utils"

const SCROLL_DELTA = 10
const TOP_REVEAL_PX = 32

const navItems = [
  { to: "/", label: "Home", exact: true },
  { to: "/convocacao", label: "Convocação", exact: false },
  { to: "/simulador", label: "Simulador (da Copa)", exact: false },
  { to: "/tier-list", label: "Tier list", exact: false },
] as const

export function FloatingNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const [visible, setVisible] = React.useState(true)
  const lastScrollY = React.useRef(0)

  React.useEffect(() => {
    lastScrollY.current = window.scrollY

    const onScroll = () => {
      const y = window.scrollY
      const prev = lastScrollY.current
      const delta = y - prev

      if (y <= TOP_REVEAL_PX) {
        setVisible(true)
      } else if (delta < -SCROLL_DELTA) {
        setVisible(true)
      } else if (delta > SCROLL_DELTA) {
        setVisible(false)
      }

      lastScrollY.current = y
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={cn(
        "pointer-events-none fixed top-4 left-1/2 z-50 px-3 transition-transform duration-200 ease-out will-change-transform",
        "-translate-x-1/2",
        visible ? "translate-y-0" : "-translate-y-[calc(100%+2rem)]",
      )}
    >
      <nav
        className={cn(
          "pointer-events-auto flex items-center gap-2 border-2 border-border bg-card/95 px-2 py-2 shadow-[4px_4px_0_var(--foreground)] backdrop-blur-md sm:gap-3 sm:px-4 sm:py-2.5",
          "max-w-[calc(100vw-1.5rem)]",
        )}
        aria-label="Navegação principal"
        aria-hidden={!visible}
        inert={!visible ? true : undefined}
      >
        <Link
          to="/"
          className="mr-1 shrink-0 rounded-sm focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
          aria-label="Início — Meu Hexa"
        >
          <img
            src={tacaCopa}
            alt=""
            width={40}
            height={40}
            className="size-9 object-contain sm:size-10"
            decoding="async"
          />
        </Link>
        <ul className="flex min-w-0 flex-wrap items-center justify-center gap-x-1 gap-y-1 sm:gap-x-2">
          {navItems.map(({ to, label, exact }) => {
            const active = exact ? pathname === to : pathname === to || pathname.startsWith(`${to}/`)

            return (
              <li key={to}>
                <Link
                  to={to}
                  className={cn(
                    "font-heading block rounded-sm px-2 py-1.5 text-[0.65rem] uppercase tracking-wide no-underline transition-colors sm:px-3 sm:text-xs",
                    "outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted",
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
    </header>
  )
}
