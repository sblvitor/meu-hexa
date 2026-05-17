import placeholderUrl from "@/assets/jogadores/placeholder.svg"

export const POSICOES = ["GOL", "ZAG", "LAT", "VOL", "MEI", "ATA"] as const
export type Posicao = (typeof POSICOES)[number]

export const POSICAO_LABEL: Record<Posicao, string> = {
  GOL: "Goleiro",
  ZAG: "Zagueiro",
  LAT: "Lateral",
  VOL: "Volante",
  MEI: "Meia",
  ATA: "Atacante",
}

export type Jogador = {
  id: string
  nome: string
  clube: string
  posicao: Posicao
  foto: string
  escudo: string
}

const fotoModules = import.meta.glob<string>(
  [
    "../assets/jogadores/**/*.webp",
    "../assets/jogadores/**/*.png",
    "../assets/jogadores/**/*.jpg",
    "../assets/jogadores/**/*.jpeg",
  ],
  { eager: true, import: "default" },
)

function resolveFoto(slug: string): string {
  const key = slug.toLowerCase()
  for (const [path, url] of Object.entries(fotoModules)) {
    const file = path.split("/").pop()
    if (!file) continue
    const base = file.replace(/\.[^.]+$/i, "").toLowerCase()
    if (base && base !== "placeholder" && base === key) return url
  }
  return placeholderUrl
}

const escudoModules = import.meta.glob<string>(
  ["../assets/clubes/*.png", "../assets/clubes/*.webp", "../assets/clubes/*.svg"],
  { eager: true, import: "default" },
)

function resolveEscudo(slug: string): string {
  const key = slug.toLowerCase()
  for (const [path, url] of Object.entries(escudoModules)) {
    const file = path.split("/").pop()
    if (!file) continue
    const base = file.replace(/\.[^.]+$/i, "").toLowerCase()
    if (base === key) return url
  }
  return placeholderUrl
}

/** Nome do clube (como em `JOGADORES_META`) → slug do arquivo em `src/assets/clubes/`. */
const ESCUDO_SLUG_POR_CLUBE: Record<string, string> = {
  "Al-Ahli": "al-ahli",
  "Al-Ittihad": "al-ittihad",
  "Al Nassr": "al-nassr",
  Arsenal: "arsenal",
  Atalanta: "atalanta",
  Bahia: "bahia",
  Barcelona: "barcelona",
  Botafogo: "botafogo",
  Bournemouth: "bournemouth",
  Brentford: "brentford",
  Chelsea: "chelsea",
  Corinthians: "corinthians",
  Cruzeiro: "cruzeiro",
  "Fenerbahçe": "fenerbahce",
  Flamengo: "flamengo",
  Galatasaray: "galatasaray",
  Girona: "girona",
  Grêmio: "gremio",
  Internazionale: "internazionale",
  Juventus: "juventus",
  "LOSC Lille": "lille",
  Liverpool: "liverpool",
  Lyon: "lyon",
  "Manchester United": "manchester-united",
  "Newcastle United": "newcastle",
  "Nottingham Forest": "nottingham-forest",
  Palmeiras: "palmeiras",
  "Paris Saint-Germain": "psg",
  Porto: "porto",
  "Real Betis": "real-betis",
  "Real Madrid": "real-madrid",
  Roma: "roma",
  Santos: "santos",
  Tottenham: "tottenham",
  Vasco: "vasco",
  Wolverhampton: "wolves",
  Zenit: "zenit",
}

/**
 * Pré-lista de 55 jogadores enviada pela CBF à Fifa — Copa 2026 (divulgação GE, atualizada em 13/05/2026).
 * Fotos em `src/assets/jogadores/` — `id` deve coincidir com o nome do arquivo (sem extensão).
 */
const JOGADORES_META = [
  // Goleiros (6)
  { id: "alisson", nome: "Alisson", clube: "Liverpool", posicao: "GOL" },
  { id: "bento", nome: "Bento", clube: "Al Nassr", posicao: "GOL" },
  { id: "ederson", nome: "Ederson", clube: "Fenerbahçe", posicao: "GOL" },
  { id: "hugo-souza", nome: "Hugo Souza", clube: "Corinthians", posicao: "GOL" },
  { id: "john", nome: "John", clube: "Nottingham Forest", posicao: "GOL" },
  { id: "weverton", nome: "Weverton", clube: "Grêmio", posicao: "GOL" },
  // Zaga (11)
  { id: "alexsandro", nome: "Alexsandro Ribeiro", clube: "LOSC Lille", posicao: "ZAG" },
  { id: "bremer", nome: "Bremer", clube: "Juventus", posicao: "ZAG" },
  { id: "fabricio-bruno", nome: "Fabrício Bruno", clube: "Cruzeiro", posicao: "ZAG" },
  { id: "gabriel-magalhaes", nome: "Gabriel Magalhães", clube: "Arsenal", posicao: "ZAG" },
  { id: "ibanez", nome: "Roger Ibañez", clube: "Al-Ahli", posicao: "ZAG" },
  { id: "leo-ortiz", nome: "Léo Ortiz", clube: "Flamengo", posicao: "ZAG" },
  { id: "leo-pereira", nome: "Léo Pereira", clube: "Flamengo", posicao: "ZAG" },
  { id: "marquinhos", nome: "Marquinhos", clube: "Paris Saint-Germain", posicao: "ZAG" },
  { id: "natan", nome: "Natan", clube: "Real Betis", posicao: "ZAG" },
  { id: "thiago-silva", nome: "Thiago Silva", clube: "Porto", posicao: "ZAG" },
  { id: "vitor-reis", nome: "Vitor Reis", clube: "Girona", posicao: "ZAG" },
  // Laterais (9)
  { id: "alex-sandro", nome: "Alex Sandro", clube: "Flamengo", posicao: "LAT" },
  { id: "carlos-augusto", nome: "Carlos Augusto", clube: "Internazionale", posicao: "LAT" },
  { id: "danilo-ld", nome: "Danilo", clube: "Flamengo", posicao: "LAT" },
  { id: "douglas-santos", nome: "Douglas Santos", clube: "Zenit", posicao: "LAT" },
  { id: "kaiki-bruno", nome: "Kaiki Bruno", clube: "Cruzeiro", posicao: "LAT" },
  { id: "luciano-juba", nome: "Luciano Juba", clube: "Bahia", posicao: "LAT" },
  { id: "paulo-henrique", nome: "Paulo Henrique", clube: "Vasco", posicao: "LAT" },
  { id: "vitinho", nome: "Vitinho", clube: "Botafogo", posicao: "LAT" },
  { id: "wesley", nome: "Wesley", clube: "Roma", posicao: "LAT" },
  // Volantes (6)
  { id: "andrey-santos", nome: "Andrey Santos", clube: "Chelsea", posicao: "VOL" },
  { id: "bruno-guimaraes", nome: "Bruno Guimarães", clube: "Newcastle United", posicao: "VOL" },
  { id: "casemiro", nome: "Casemiro", clube: "Manchester United", posicao: "VOL" },
  { id: "danilo-meia", nome: "Danilo", clube: "Botafogo", posicao: "VOL" },
  { id: "fabinho", nome: "Fabinho", clube: "Al-Ittihad", posicao: "VOL" },
  { id: "joao-gomes", nome: "João Gomes", clube: "Wolverhampton", posicao: "VOL" },
  // Meias (6)
  { id: "andreas-pereira", nome: "Andreas Pereira", clube: "Palmeiras", posicao: "MEI" },
  { id: "ederson-meia", nome: "Éderson", clube: "Atalanta", posicao: "MEI" },
  { id: "gabriel-sara", nome: "Gabriel Sara", clube: "Galatasaray", posicao: "MEI" },
  { id: "gerson", nome: "Gerson", clube: "Cruzeiro", posicao: "MEI" },
  { id: "matheus-pereira", nome: "Matheus Pereira", clube: "Cruzeiro", posicao: "MEI" },
  { id: "paqueta", nome: "Lucas Paquetá", clube: "Flamengo", posicao: "MEI" },
  // Atacantes (17)
  { id: "antony", nome: "Antony", clube: "Real Betis", posicao: "ATA" },
  { id: "endrick", nome: "Endrick", clube: "Lyon", posicao: "ATA" },
  { id: "gabriel-jesus", nome: "Gabriel Jesus", clube: "Arsenal", posicao: "ATA" },
  { id: "igor-jesus", nome: "Igor Jesus", clube: "Nottingham Forest", posicao: "ATA" },
  { id: "igor-thiago", nome: "Igor Thiago", clube: "Brentford", posicao: "ATA" },
  { id: "joao-pedro", nome: "João Pedro", clube: "Chelsea", posicao: "ATA" },
  { id: "kaio-jorge", nome: "Kaio Jorge", clube: "Cruzeiro", posicao: "ATA" },
  { id: "luiz-henrique", nome: "Luiz Henrique", clube: "Zenit", posicao: "ATA" },
  { id: "martinelli", nome: "Gabriel Martinelli", clube: "Arsenal", posicao: "ATA" },
  { id: "matheus-cunha", nome: "Matheus Cunha", clube: "Manchester United", posicao: "ATA" },
  { id: "neymar", nome: "Neymar", clube: "Santos", posicao: "ATA" },
  { id: "pedro", nome: "Pedro", clube: "Flamengo", posicao: "ATA" },
  { id: "raphinha", nome: "Raphinha", clube: "Barcelona", posicao: "ATA" },
  { id: "rayan", nome: "Rayan", clube: "Bournemouth", posicao: "ATA" },
  { id: "richarlison", nome: "Richarlison", clube: "Tottenham", posicao: "ATA" },
  { id: "samuel-lino", nome: "Samuel Lino", clube: "Flamengo", posicao: "ATA" },
  { id: "vini-jr", nome: "Vinícius Júnior", clube: "Real Madrid", posicao: "ATA" },
] as const satisfies ReadonlyArray<{
  id: string
  nome: string
  clube: string
  posicao: Posicao
}>

export const JOGADORES: Array<Jogador> = JOGADORES_META.map((j) => {
  const escudoSlug = ESCUDO_SLUG_POR_CLUBE[j.clube]
  return {
    ...j,
    foto: resolveFoto(j.id),
    escudo: escudoSlug ? resolveEscudo(escudoSlug) : placeholderUrl,
  }
})
