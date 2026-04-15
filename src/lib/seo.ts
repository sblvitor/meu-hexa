import { siteConfig, siteFooterCredit } from "@/config/site"

type JsonLd = Record<string, unknown>

type SeoInput = {
  title: string
  description: string
  path: string
  keywords?: ReadonlyArray<string>
  imagePath?: string
  imageAlt?: string
  type?: "website" | "article"
  includeCanonical?: boolean
  includeUrlMeta?: boolean
  noIndex?: boolean
  schema?: Array<JsonLd>
}

export const publicSiteRoutes = ["/", "/convocacao", "/simulador", "/tier-list"] as const

function normalizePath(path: string) {
  if (path === "/") {
    return path
  }

  return path.startsWith("/") ? path : `/${path}`
}

function trimTrailingSlash(url: string) {
  return url.replace(/\/+$/, "")
}

export function buildAbsoluteUrl(pathOrUrl: string) {
  if (/^https?:\/\//.test(pathOrUrl)) {
    return pathOrUrl
  }

  return `${trimTrailingSlash(siteConfig.siteUrl)}${normalizePath(pathOrUrl)}`
}

export function buildPageTitle(title: string) {
  return title.includes(siteConfig.name) ? title : `${title} | ${siteConfig.name}`
}

export function buildWebPageSchema(input: Pick<SeoInput, "title" | "description" | "path">): JsonLd {
  const pageUrl = buildAbsoluteUrl(input.path)

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: buildPageTitle(input.title),
    description: input.description,
    url: pageUrl,
    inLanguage: siteConfig.language,
    isPartOf: {
      "@type": "WebSite",
      name: siteConfig.name,
      url: siteConfig.siteUrl,
    },
  }
}

export function buildSiteSchemas(): Array<JsonLd> {
  const sameAs = [siteFooterCredit.sourceUrl, siteFooterCredit.authorUrl].filter(Boolean)

  return [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: siteConfig.name,
      url: siteConfig.siteUrl,
      inLanguage: siteConfig.language,
      description: siteConfig.defaultDescription,
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: siteConfig.name,
      applicationCategory: "SportsApplication",
      operatingSystem: "Web",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "BRL",
      },
      inLanguage: siteConfig.language,
      url: siteConfig.siteUrl,
      description: siteConfig.defaultDescription,
      image: buildAbsoluteUrl(siteConfig.ogImagePath),
      publisher: {
        "@type": "Organization",
        name: siteConfig.organization.name,
        foundingDate: siteConfig.organization.foundingDate,
        sameAs,
      },
    },
  ]
}

export function buildSeoHead({
  title,
  description,
  path,
  keywords = siteConfig.keywords,
  imagePath = siteConfig.ogImagePath,
  imageAlt = siteConfig.ogImageAlt,
  type = "website",
  includeCanonical = true,
  includeUrlMeta = true,
  noIndex = false,
  schema = [],
}: SeoInput) {
  const pageTitle = buildPageTitle(title)
  const pageUrl = buildAbsoluteUrl(path)
  const imageUrl = buildAbsoluteUrl(imagePath)

  return {
    meta: [
      { title: pageTitle },
      { name: "description", content: description },
      { name: "keywords", content: keywords.join(", ") },
      { name: "theme-color", content: siteConfig.themeColor },
      { name: "application-name", content: siteConfig.name },
      { name: "robots", content: noIndex ? "noindex, nofollow" : "index, follow" },
      { property: "og:locale", content: siteConfig.locale },
      { property: "og:site_name", content: siteConfig.name },
      { property: "og:type", content: type },
      { property: "og:title", content: pageTitle },
      { property: "og:description", content: description },
      { property: "og:image", content: imageUrl },
      { property: "og:image:alt", content: imageAlt },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: pageTitle },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: imageUrl },
      ...(includeUrlMeta ? ([{ property: "og:url", content: pageUrl }] as const) : []),
    ],
    links: includeCanonical ? [{ rel: "canonical", href: pageUrl }] : [],
    scripts: schema.map((entry) => ({
      type: "application/ld+json",
      children: JSON.stringify(entry),
    })),
  }
}

export function buildSitemapXml() {
  const urls = publicSiteRoutes.map((routePath) => {
    const url = buildAbsoluteUrl(routePath)

    return [
      "  <url>",
      `    <loc>${url}</loc>`,
      routePath === "/" ? "    <priority>1.0</priority>" : "    <priority>0.8</priority>",
      "  </url>",
    ].join("\n")
  })

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    "</urlset>",
  ].join("\n")
}
