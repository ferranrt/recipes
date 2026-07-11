import { useState } from "react"
import { IconList } from "@tabler/icons-react"
import { Button } from "@workspace/ui/components/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet"

import { barcelonaWaterSources } from "../data"
import type { WaterSource } from "../types"
import { WaterSourcesList } from "./water-sources-list"
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
    <div className="flex h-full min-h-0 flex-1 overflow-hidden md:flex-row">
      <WaterSourcesList
        sources={barcelonaWaterSources}
        selectedCode={selectedSource?.code ?? null}
        onSelect={handleSelect}
        className="hidden h-full w-full shrink-0 border-r md:flex md:w-80 lg:w-96"
      />

      <div className="relative min-h-0 min-w-0 flex-1">
        <WaterSourcesMap
          className="absolute inset-0"
          sources={barcelonaWaterSources}
          selectedSource={selectedSource}
          onSelect={handleMapSelect}
        />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-3 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden">
          <Button
            className="pointer-events-auto shadow-md"
            onClick={() => setListOpen(true)}
          >
            <IconList data-icon="inline-start" />
            Browse
          </Button>
        </div>
      </div>

      <Sheet open={listOpen} onOpenChange={setListOpen}>
        <SheetContent
          side="bottom"
          className="flex h-[min(88dvh,42rem)] flex-col gap-0 rounded-t-2xl p-0"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Barcelona fountains</SheetTitle>
            <SheetDescription>
              Browse and search public water sources in Barcelona.
            </SheetDescription>
          </SheetHeader>
          <div
            aria-hidden
            className="mx-auto mt-2 h-1 w-12 shrink-0 rounded-full bg-muted-foreground/30"
          />
          <WaterSourcesList
            sources={barcelonaWaterSources}
            selectedCode={selectedSource?.code ?? null}
            onSelect={handleSelect}
            compact
            className="min-h-0 flex-1"
          />
        </SheetContent>
      </Sheet>
    </div>
  )
}
