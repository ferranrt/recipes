import { Suspense, lazy } from "react"
import { createFileRoute } from "@tanstack/react-router"

import { Spinner } from "@workspace/ui/components/spinner"

const WaterSourcesPage = lazy(async () => {
  const module = await import(
    "@/modules/water-sources/components/water-sources-page"
  )

  return { default: module.WaterSourcesPage }
})

function WaterSourcesRoute() {
  return (
    <Suspense
      fallback={
        <div className="flex size-full items-center justify-center">
          <Spinner className="size-6 text-muted-foreground" />
        </div>
      }
    >
      <WaterSourcesPage />
    </Suspense>
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
