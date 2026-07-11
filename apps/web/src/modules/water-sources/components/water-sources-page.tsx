import { useEffect, useState } from "react"

import { barcelonaWaterSources } from "../data"
import { useRouteBuilder } from "../route-builder/hooks/use-route-builder"
import {
  RouteReportDrawer,
  RouteReportToggle,
} from "../route-builder/components/route-report-drawer"
import { RouteBuilderToolbar } from "../route-builder/components/route-builder-toolbar"
import type { WaterSource } from "../types"
import {
  WaterSourcesListDrawer,
  WaterSourcesListToggle,
} from "./water-sources-list-drawer"
import { findWaterSourceByCode, WaterSourcesMap } from "./water-sources-map"

export function WaterSourcesPage() {
  const [selectedSource, setSelectedSource] = useState<WaterSource | null>(null)
  const [listOpen, setListOpen] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const routeBuilder = useRouteBuilder(barcelonaWaterSources)

  useEffect(() => {
    if (routeBuilder.isComplete) {
      setReportOpen(true)
    }
  }, [routeBuilder.isComplete])

  const handleSelect = (source: WaterSource) => {
    setSelectedSource((current) =>
      current?.code === source.code ? null : source
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

  const handleReportFountainSelect = (source: WaterSource) => {
    setSelectedSource(source)
    setReportOpen(false)
  }

  return (
    <div className="relative h-full min-h-0 flex-1 overflow-hidden">
      <WaterSourcesMap
        className="absolute inset-0"
        sources={barcelonaWaterSources}
        selectedSource={selectedSource}
        onSelect={handleMapSelect}
        routeBuilder={routeBuilder}
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 p-3 md:p-4">
        <WaterSourcesListToggle
          sourceCount={barcelonaWaterSources.length}
          selectedCode={selectedSource?.code ?? null}
          open={listOpen}
          onOpenChange={setListOpen}
          className="max-md:hidden"
        />
        <RouteBuilderToolbar routeBuilder={routeBuilder} />
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-3 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden">
        <WaterSourcesListToggle
          sourceCount={barcelonaWaterSources.length}
          selectedCode={selectedSource?.code ?? null}
          open={listOpen}
          onOpenChange={setListOpen}
        />
        {routeBuilder.isComplete ? (
          <RouteReportToggle
            fountainCount={routeBuilder.report?.entries.length ?? 0}
            open={reportOpen}
            onOpenChange={setReportOpen}
          />
        ) : null}
      </div>

      {routeBuilder.isComplete ? (
        <div className="pointer-events-none absolute top-3 right-3 z-10 hidden md:block">
          <RouteReportToggle
            fountainCount={routeBuilder.report?.entries.length ?? 0}
            open={reportOpen}
            onOpenChange={setReportOpen}
          />
        </div>
      ) : null}

      <WaterSourcesListDrawer
        sources={barcelonaWaterSources}
        selectedCode={selectedSource?.code ?? null}
        open={listOpen}
        onOpenChange={setListOpen}
        onSelect={handleSelect}
      />

      <RouteReportDrawer
        routeBuilder={routeBuilder}
        open={reportOpen}
        onOpenChange={setReportOpen}
        onSelectFountain={handleReportFountainSelect}
      />
    </div>
  )
}
