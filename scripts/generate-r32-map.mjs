/**
 * Gera src/data/r32-third-place-map.json a partir da tabela Wikipédia
 * (Anexo C / "Combinations of matches in the round of 32").
 * Uso: node scripts/generate-r32-map.mjs [caminho-para-markdown-opcional]
 */
import { writeFileSync, readFileSync } from "node:fs"
import { resolve } from "node:path"

const WINNER_KEYS = ["A", "B", "D", "E", "G", "I", "K", "L"]

function parseThird(cell) {
  const s = cell.trim()
  const m = s.match(/^3([A-L])$/i)
  if (!m) throw new Error(`Célula 3º inválida: ${cell}`)
  return m[1].toUpperCase()
}

function parseRow(line) {
  const trimmed = line.trim()
  if (!trimmed.startsWith("|")) return null
  const cells = trimmed
    .split("|")
    .map((c) => c.trim())
    .slice(1, -1)
  // | 1 | E | F | ... | 3E | ... | → 17 células
  if (cells.length < 17) return null
  const num = Number(cells[0])
  if (!Number.isInteger(num) || num < 1 || num > 495) return null
  const eightLetters = cells.slice(1, 9).map((c) => c.toUpperCase())
  const eightThirds = cells.slice(9, 17).map(parseThird)
  if (eightLetters.some((c) => !/^[A-L]$/.test(c))) return null
  const sortedKey = [...eightLetters].sort().join("")
  const thirdByWinner = {}
  for (let i = 0; i < 8; i++) {
    thirdByWinner[WINNER_KEYS[i]] = eightThirds[i]
  }
  return { num, advancing: sortedKey, thirdByWinner }
}

async function main() {
  let text
  const argPath = process.argv[2]
  if (argPath) {
    text = readFileSync(argPath, "utf8")
  } else {
    const url =
      "https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_knockout_stage"
    const res = await fetch(url, {
      headers: {
        "User-Agent": "meu-hexa-bracket-generator/1.0",
      },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    text = await res.text()
  }
  /** Markdown simplificado: linhas | num | ... */
  const rows = /** @type {{ num: number, advancing: string, thirdByWinner: Record<string, string> }[]} */ (
    []
  )
  for (const line of text.split("\n")) {
    const parsed = parseRow(line)
    if (parsed) rows.push(parsed)
  }
  if (rows.length !== 495) {
    throw new Error(`Esperado 495 linhas, obtido ${rows.length}`)
  }
  const byKey = /** @type {Record<string, Record<string, string>>} */ ({})
  for (const r of rows) {
    if (byKey[r.advancing]) {
      throw new Error(`Chave duplicada: ${r.advancing}`)
    }
    byKey[r.advancing] = r.thirdByWinner
  }
  const outPath = resolve("src/data/r32-third-place-map.json")
  writeFileSync(outPath, JSON.stringify(byKey, null, 0) + "\n", "utf8")
  console.log(`Escrito ${outPath} (${Object.keys(byKey).length} chaves)`)
}

main()
