import { Suspense, lazy } from "react"
import { createFileRoute } from "@tanstack/react-router"

import { Spinner } from "@workspace/ui/components/spinner"
import { ClientOnly } from "@/components/client-only"

const WaterSourcesPage = lazy(async () => {
  const module = await import(
    "@/modules/water-sources/components/water-sources-page"
  )

  return { default: module.WaterSourcesPage }
})

const pageFallback = (
  <div className="flex size-full items-center justify-center">
    <Spinner className="size-6 text-muted-foreground" />
  </div>
)

function WaterSourcesRoute() {
  return (
    <ClientOnly fallback={pageFallback}>
      <Suspense fallback={pageFallback}>
        <WaterSourcesPage />
      </Suspense>
    </ClientOnly>
  )
}

export const Route = createFileRoute("/water-sources/")({
  head: () => ({
    meta: [
      {
        title: "Fountains · Barcelona",
      },
    ],
  }),
  component: WaterSourcesRoute,
})
