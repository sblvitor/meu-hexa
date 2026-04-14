import { createFileRoute } from "@tanstack/react-router"

import { TierListBoard } from "@/components/tier-list/tier-list-board"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const Route = createFileRoute("/tier-list")({
  component: TierListPage,
})

function TierListPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-16">
      <header className="mb-8 border-b-2 border-border pb-6">
        <h1 className="font-heading text-2xl uppercase tracking-wide md:text-3xl">
          Tier list
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed">
          Arraste as 48 seleções da Copa 2026 entre os tiers (S no topo até D) ou
          deixe-as em <strong className="text-foreground">Sem tier</strong>.
          Renomeie linhas, crie novos tiers ou remova um tier — as seleções da
          linha voltam para o banco.
        </p>
      </header>

      <Card className="border-2 border-border shadow-[4px_4px_0_var(--foreground)]">
        <CardHeader>
          <CardTitle className="font-heading text-lg">
            Ranking das seleções
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TierListBoard />
        </CardContent>
      </Card>
    </div>
  )
}
