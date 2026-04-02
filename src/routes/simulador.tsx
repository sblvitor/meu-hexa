import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/simulador")({
  component: SimuladorPage,
})

function SimuladorPage() {
  return (
    <div className="p-6">
      <h1 className="text-xl">Simulador da Copa</h1>
      <p className="mt-2 text-sm text-muted-foreground">Simule jogos da Copa do Mundo 2026.</p>
    </div>
  )
}
