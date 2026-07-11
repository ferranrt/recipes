import { createFileRoute } from "@tanstack/react-router"

import { WaterSourcesPage } from "@/modules/water-sources/components/water-sources-page"

export const Route = createFileRoute("/water-sources/")({
  head: () => ({
    meta: [
      {
        title: "Fountains · Barcelona",
      },
    ],
  }),
  component: WaterSourcesPage,
})
