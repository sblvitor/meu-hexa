import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/tier-list")({
  component: TierListPage,
})

function TierListPage() {
  return (
    <div className="p-6">
      <h1 className="text-xl">Tier list</h1>
      <p className="mt-2 text-sm text-muted-foreground">Organize as 48 seleções em tiers.</p>
    </div>
  )
}
