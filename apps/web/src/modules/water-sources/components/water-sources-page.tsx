import { useState } from "react"

import { barcelonaWaterSources } from "../data"
import type { WaterSource } from "../types"
import {
  WaterSourcesListDrawer,
  WaterSourcesListToggle,
} from "./water-sources-list-drawer"
import {
  findWaterSourceByCode,
  WaterSourcesMap,
} from "./water-sources-map"

export function WaterSourcesPage() {
  const [selectedSource, setSelectedSource] = useState<WaterSource | null>(null)
  const [listOpen, setListOpen] = useState(false)

  const handleSelect = (source: WaterSource) => {
    setSelectedSource((current) =>
      current?.code === source.code ? null : source,
    )
    setListOpen(false)
  }

  const handleMapSelect = (source: WaterSource | null) => {
    if (!source) {
      setSelectedSource(null)
      return
    }

    const matched = findWaterSourceByCode(barcelonaWaterSources, source.code)
    setSelectedSource(matched ?? source)
  }

  return (
    <div className="relative h-full min-h-0 flex-1 overflow-hidden">
      <WaterSourcesMap
        className="absolute inset-0"
        sources={barcelonaWaterSources}
        selectedSource={selectedSource}
        onSelect={handleMapSelect}
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 p-3 md:p-4">
        <WaterSourcesListToggle
          sourceCount={barcelonaWaterSources.length}
          selectedCode={selectedSource?.code ?? null}
          open={listOpen}
          onOpenChange={setListOpen}
          className="max-md:hidden"
        />
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-3 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden">
        <WaterSourcesListToggle
          sourceCount={barcelonaWaterSources.length}
          selectedCode={selectedSource?.code ?? null}
          open={listOpen}
          onOpenChange={setListOpen}
        />
      </div>

      <WaterSourcesListDrawer
        sources={barcelonaWaterSources}
        selectedCode={selectedSource?.code ?? null}
        open={listOpen}
        onOpenChange={setListOpen}
        onSelect={handleSelect}
      />
    </div>
  )
}
