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

/**
 * Lista espelha os arquivos em `src/assets/jogadores/{pasta}/{slug}.webp`.
 * Pastas: goleiros, zaga, ld, le, meia, ata — `id` deve coincidir com o nome do arquivo (sem extensão).
 */
const JOGADORES_META = [
  // Goleiros
  { id: "alisson", nome: "Alisson", clube: "Liverpool", posicao: "GOL" },
  { id: "bento", nome: "Bento", clube: "Al Nassr", posicao: "GOL" },
  { id: "ederson", nome: "Ederson", clube: "Fenerbahçe", posicao: "GOL" },
  { id: "fabio", nome: "Fábio", clube: "Fluminense", posicao: "GOL" },
  { id: "hugo-souza", nome: "Hugo Souza", clube: "Corinthians", posicao: "GOL" },
  { id: "lucas-perri", nome: "Lucas Perri", clube: "Leeds United", posicao: "GOL" },
  // Zaga
  { id: "beraldo", nome: "Lucas Beraldo", clube: "Paris Saint-Germain", posicao: "ZAG" },
  { id: "bremer", nome: "Bremer", clube: "Juventus", posicao: "ZAG" },
  { id: "eder-militao", nome: "Éder Militão", clube: "Real Madrid", posicao: "ZAG" },
  { id: "fabricio-bruno", nome: "Fabrício Bruno", clube: "Cruzeiro", posicao: "ZAG" },
  { id: "gabriel-magalhaes", nome: "Gabriel Magalhães", clube: "Arsenal", posicao: "ZAG" },
  { id: "ibanez", nome: "Roger Ibañez", clube: "Al-Ahli", posicao: "ZAG" },
  { id: "leo-pereira", nome: "Léo Pereira", clube: "Flamengo", posicao: "ZAG" },
  { id: "marquinhos", nome: "Marquinhos", clube: "Paris Saint-Germain", posicao: "ZAG" },
  { id: "vitor-reis", nome: "Vitor Reis", clube: "Girona", posicao: "ZAG" },
  // Laterais (ld / le)
  { id: "alexsandro", nome: "Alexsandro Ribeiro", clube: "LOSC Lille", posicao: "LAT" },
  { id: "danilo-ld", nome: "Danilo", clube: "Flamengo", posicao: "LAT" },
  { id: "vanderson", nome: "Vanderson", clube: "Monaco", posicao: "LAT" },
  { id: "wesley", nome: "Wesley", clube: "Roma", posicao: "LAT" },
  { id: "alex-sandro", nome: "Alex Sandro", clube: "Flamengo", posicao: "LAT" },
  { id: "carlos-augusto", nome: "Carlos Augusto", clube: "Internazionale", posicao: "LAT" },
  { id: "douglas-santos", nome: "Douglas Santos", clube: "Zenit", posicao: "LAT" },
  // Meio: volantes e meias (pasta única no asset; posição refinada abaixo)
  { id: "casemiro", nome: "Casemiro", clube: "Manchester United", posicao: "VOL" },
  { id: "fabinho", nome: "Fabinho", clube: "Al-Ittihad", posicao: "VOL" },
  { id: "joelinton", nome: "Joelinton", clube: "Newcastle United", posicao: "VOL" },
  { id: "bruno-guimaraes", nome: "Bruno Guimarães", clube: "Newcastle United", posicao: "VOL" },
  { id: "andrey-santos", nome: "Andrey Santos", clube: "Chelsea", posicao: "VOL" },
  { id: "paqueta", nome: "Lucas Paquetá", clube: "Flamengo", posicao: "MEI" },
  { id: "gerson", nome: "Gerson", clube: "Cruzeiro", posicao: "MEI" },
  { id: "andreas-pereira", nome: "Andreas Pereira", clube: "Palmeiras", posicao: "MEI" },
  { id: "danilo-meia", nome: "Danilo (volante)", clube: "Botafogo", posicao: "VOL" },
  { id: "ederson-meia", nome: "Éderson", clube: "Atalanta", posicao: "MEI" },
  { id: "gabriel-sara", nome: "Gabriel Sara", clube: "Galatasaray", posicao: "MEI" },
  // Ataques
  { id: "antony", nome: "Antony", clube: "Real Betis", posicao: "ATA" },
  { id: "endrick", nome: "Endrick", clube: "Lyon", posicao: "ATA" },
  { id: "estevao", nome: "Estêvão", clube: "Chelsea", posicao: "ATA" },
  { id: "igor-jesus", nome: "Igor Jesus", clube: "Nottingham Forest", posicao: "ATA" },
  { id: "igor-thiago", nome: "Igor Thiago", clube: "Brentford", posicao: "ATA" },
  { id: "joao-pedro", nome: "João Pedro", clube: "Chelsea", posicao: "ATA" },
  { id: "luis-henrique", nome: "Luis Henrique", clube: "Zenit", posicao: "ATA" },
  { id: "martinelli", nome: "Gabriel Martinelli", clube: "Arsenal", posicao: "ATA" },
  { id: "matheus-cunha", nome: "Matheus Cunha", clube: "Manchester United", posicao: "ATA" },
  { id: "neymar", nome: "Neymar Jr.", clube: "Santos", posicao: "ATA" },
  { id: "pedro", nome: "Pedro", clube: "Flamengo", posicao: "ATA" },
  { id: "raphinha", nome: "Raphinha", clube: "Barcelona", posicao: "ATA" },
  { id: "rayan", nome: "Rayan", clube: "Bournemouth", posicao: "ATA" },
  { id: "richarlison", nome: "Richarlison", clube: "Tottenham", posicao: "ATA" },
  { id: "savinho", nome: "Savinho", clube: "Manchester City", posicao: "ATA" },
  { id: "vini-jr", nome: "Vinícius Júnior", clube: "Real Madrid", posicao: "ATA" },
] as const satisfies ReadonlyArray<{
  id: string
  nome: string
  clube: string
  posicao: Posicao
}>

export const JOGADORES: Array<Jogador> = JOGADORES_META.map((j) => ({
  ...j,
  foto: resolveFoto(j.id),
}))
