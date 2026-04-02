import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/convocacao")({
  component: ConvocacaoPage,
})

function ConvocacaoPage() {
  return (
    <div className="p-6">
      <h1 className="text-xl">Convocação</h1>
      <p className="mt-2 text-sm text-muted-foreground">Monte a sua seleção de 26 jogadores.</p>
    </div>
  )
}
