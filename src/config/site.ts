/**
 * Créditos opcionais no rodapé. Preencha as URLs/nome que quiser exibir;
 * strings vazias ocultam cada trecho.
 */
export const siteFooterCredit: {
  authorName: string
  /** Ex.: perfil no LinkedIn, site pessoal ou portfolio */
  authorUrl: string
  /** Ex.: repositório do projeto no GitHub */
  sourceUrl: string
} = {
  authorName: "Vitor Lira",
  authorUrl: "https://www.linkedin.com/in/vitor-lira/",
  sourceUrl: "https://github.com/sblvitor/meu-hexa",
}

export const siteConfig = {
  name: "Meu Hexa",
  siteUrl: "https://meuhexa.vlira.workers.dev/",
  locale: "pt_BR",
  language: "pt-BR",
  defaultTitle: "Meu Hexa | Copa do Mundo 2026",
  defaultDescription:
    "Monte a convocacao do Brasil, simule a Copa do Mundo 2026 e crie sua tier list das 48 selecoes em uma experiencia feita para torcedores brasileiros.",
  themeColor: "#0f5132",
  ogImagePath: "/og-default.svg",
  ogImageAlt: "Meu Hexa, plataforma interativa sobre a Copa do Mundo 2026",
  keywords: [
    "Meu Hexa",
    "Copa do Mundo 2026",
    "selecao brasileira",
    "convocacao do Brasil",
    "simulador da Copa",
    "tier list de selecoes",
    "futebol",
  ],
  organization: {
    name: "Meu Hexa",
    foundingDate: "2026",
  },
  googleSiteVerification: "kC1yO05E6veB5C2tff9ndvxSajp5jU98eAurVYIeL0I" as string,
} as const
