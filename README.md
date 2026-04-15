# Meu Hexa

Plataforma web interativa sobre a **Copa do Mundo FIFA 2026**, pensada para torcedores brasileiros: montar a convocação, simular o torneio e classificar as 48 seleções em uma tier list — com cartões prontos para compartilhar.

**Site:** [meuhexa.vlira.workers.dev](https://meuhexa.vlira.workers.dev/)

## Funcionalidades

1. **Convocação** — Escolha 26 jogadores da lista oficial, com filtros por posição e busca por nome. Ao final, gere um cartão estilizado para compartilhar.
2. **Simulador** — Preencha placares da fase de grupos (com classificação automática) e do mata-mata (oitavas à final), incluindo pênaltis quando necessário. Resumo visual da campanha para compartilhar.
3. **Tier list** — Organize as 48 seleções em níveis personalizáveis (S, A, B, C, D, F) com arrastar e soltar. Cartão completo da tier list para compartilhar.

## Stack

- [Bun](https://bun.sh) — gerenciador de pacotes e runtime dos scripts
- [TanStack Start](https://tanstack.com/start) + React 19 + TypeScript
- [Vite](https://vitejs.dev) 7
- [Tailwind CSS](https://tailwindcss.com) 4
- [shadcn/ui](https://ui.shadcn.com) (Radix)
- Deploy em [Cloudflare Workers](https://workers.cloudflare.com/) (`wrangler`)

## Requisitos

- [Bun](https://bun.sh) (versão alinhada ao `packageManager` do `package.json`, ex.: 1.3.x)

## Como rodar

```bash
bun install
bun run dev
```

O app sobe em **http://localhost:3000** (porta definida no script `dev`).

### Scripts úteis

| Comando | Descrição |
|--------|-----------|
| `bun run dev` | Servidor de desenvolvimento |
| `bun run build` | Build de produção |
| `bun run preview` | Preview do build |
| `bun run test` | Testes (Vitest) |
| `bun run lint` | ESLint |
| `bun run typecheck` | TypeScript (`tsc --noEmit`) |
| `bun run format` | Prettier |
| `bun run deploy` | Build + deploy Cloudflare (`wrangler deploy`) |

## Estrutura (visão geral)

- `src/routes/` — páginas principais (`index`, `convocacao`, `simulador`, `tier-list`)
- `src/components/` — UI por feature (`convocacao`, `simulador`, `tier-list`) e `components/ui` (shadcn)
- `src/data/` — dados de jogadores e do calendário/formato da Copa 2026
- `src/lib/` — lógica (bracket, SEO, armazenamento local, etc.)
