import { describe, expect, it } from "vitest"

import { buildSeoHead, buildSitemapXml } from "@/lib/seo"

describe("buildSeoHead", () => {
  it("gera title, canonical e metadados sociais da rota", () => {
    const head = buildSeoHead({
      title: "Simulador da Copa do Mundo 2026",
      description: "Simule todos os resultados da Copa do Mundo 2026.",
      path: "/simulador",
    })

    expect(head.meta).toContainEqual({
      title: "Simulador da Copa do Mundo 2026 | Meu Hexa",
    })

    expect(head.meta).toContainEqual({
      property: "og:url",
      content: "https://meuhexa.vlira.workers.dev/simulador",
    })

    expect(head.meta).toContainEqual({
      name: "twitter:card",
      content: "summary_large_image",
    })

    expect(head.links).toContainEqual({
      rel: "canonical",
      href: "https://meuhexa.vlira.workers.dev/simulador",
    })
  })
})

describe("buildSitemapXml", () => {
  it("lista todas as rotas publicas do projeto", () => {
    const xml = buildSitemapXml()

    expect(xml).toContain("<loc>https://meuhexa.vlira.workers.dev/</loc>")
    expect(xml).toContain("<loc>https://meuhexa.vlira.workers.dev/convocacao</loc>")
    expect(xml).toContain("<loc>https://meuhexa.vlira.workers.dev/simulador</loc>")
    expect(xml).toContain("<loc>https://meuhexa.vlira.workers.dev/tier-list</loc>")
  })
})
