import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/water-sources/")({
  component: WaterSources,
})

function WaterSources() {
  return <div>WaterSources</div>
}
