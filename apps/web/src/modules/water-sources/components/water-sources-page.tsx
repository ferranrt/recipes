import { useCallback, useState } from "react"

import { useResponsiveDrawerDirection } from "@/hooks/use-responsive-drawer-direction"

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
  const [listMounted, setListMounted] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [reportMounted, setReportMounted] = useState(false)

  const handleRouteComplete = useCallback(() => {
    setReportMounted(true)
    setReportOpen(true)
  }, [])

  const routeBuilder = useRouteBuilder(barcelonaWaterSources, {
    onRouteComplete: handleRouteComplete,
  })

  const handleListOpenChange = useCallback((open: boolean) => {
    if (open) {
      setListMounted(true)
    }

    setListOpen(open)
  }, [])

  const handleReportOpenChange = useCallback((open: boolean) => {
    setReportOpen(open)
  }, [])

  const handleSelect = useCallback((source: WaterSource) => {
    setSelectedSource((current) =>
      current?.code === source.code ? null : source,
    )
    setListOpen(false)
  }, [])

  const handleMapSelect = useCallback((source: WaterSource | null) => {
    if (!source) {
      setSelectedSource(null)
      return
    }

    const matched = findWaterSourceByCode(source.code)
    setSelectedSource(matched ?? source)
  }, [])

  const handleReportFountainSelect = useCallback((source: WaterSource) => {
    setSelectedSource(source)
    setReportOpen(false)
  }, [])

  const handleNewRoute = useCallback(() => {
    routeBuilder.reset()
    setReportOpen(false)
    setReportMounted(false)
  }, [routeBuilder])

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
          onOpenChange={handleListOpenChange}
          className="max-md:hidden"
        />
        <RouteBuilderToolbar routeBuilder={routeBuilder} />
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-3 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden">
        <WaterSourcesListToggle
          sourceCount={barcelonaWaterSources.length}
          selectedCode={selectedSource?.code ?? null}
          open={listOpen}
          onOpenChange={handleListOpenChange}
        />
        {routeBuilder.isComplete ? (
          <RouteReportToggle
            fountainCount={routeBuilder.report?.entries.length ?? 0}
            open={reportOpen}
            onOpenChange={handleReportOpenChange}
          />
        ) : null}
      </div>

      {routeBuilder.isComplete ? (
        <div className="pointer-events-none absolute top-3 right-3 z-10 hidden md:block">
          <RouteReportToggle
            fountainCount={routeBuilder.report?.entries.length ?? 0}
            open={reportOpen}
            onOpenChange={handleReportOpenChange}
          />
        </div>
      ) : null}

      {listMounted ? (
        <WaterSourcesListDrawer
          sources={barcelonaWaterSources}
          selectedCode={selectedSource?.code ?? null}
          open={listOpen}
          onOpenChange={handleListOpenChange}
          onSelect={handleSelect}
        />
      ) : null}

      {reportMounted && routeBuilder.report ? (
        <RouteReportDrawer
          routeBuilder={routeBuilder}
          open={reportOpen}
          onOpenChange={handleReportOpenChange}
          onSelectFountain={handleReportFountainSelect}
          onNewRoute={handleNewRoute}
        />
      ) : null}
    </div>
  )
}
