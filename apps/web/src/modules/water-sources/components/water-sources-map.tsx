import { useCallback, useEffect, useMemo, useRef } from "react"
import type { Feature, Point } from "geojson"

import { useIsMobile } from "@/hooks/use-mobile"

import {
  Map,
  MapClusterLayer,
  MapControls,
  useMap,
} from "@workspace/ui/components/ui/map"
import { cn } from "@workspace/ui/lib/utils"

import { barcelonaWaterSourcesByCode } from "../data"
import type { WaterSource, WaterSourceMapProperties } from "../types"
import { MapRouteClickHandler } from "../route-builder/components/map-route-click-handler"
import { RouteBuilderMapLayers } from "../route-builder/components/route-builder-map-layers"
import type { RouteBuilderState } from "../route-builder/hooks/use-route-builder"
import { useGeolocation } from "../hooks/use-geolocation"
import type { UserLocation } from "../hooks/use-geolocation"
import { getWaterSourcesBounds, waterSourcesToGeoJSON } from "../geojson"
import { FountainPopup } from "./fountain-popup"
import { MapUserLocation } from "./map-user-location"

const BARCELONA_CENTER = {
  center: [2.1686, 41.3874] as [number, number],
  zoom: 12,
}

const DEFAULT_CLUSTER_COLORS = ["#a78bfa", "#8b5cf6", "#6d28d9"] as [
  string,
  string,
  string,
]

const REPORT_CLUSTER_COLORS = ["#5eead4", "#14b8a6", "#0f766e"] as [
  string,
  string,
  string,
]

const CLUSTER_THRESHOLDS = [25, 100] as [number, number]

type WaterSourcesMapProps = {
  sources: WaterSource[]
  selectedSource: WaterSource | null
  onSelect: (source: WaterSource | null) => void
  routeBuilder?: RouteBuilderState
  className?: string
}

function MapInitialBounds({
  bounds,
  enabled,
}: {
  bounds: [[number, number], [number, number]]
  enabled: boolean
}) {
  const { map, isLoaded } = useMap()
  const isMobile = useIsMobile()
  const hasFitted = useRef(false)

  useEffect(() => {
    if (!map || !isLoaded || !enabled || hasFitted.current) {
      return
    }

    map.fitBounds(bounds, {
      padding: isMobile ? 28 : 48,
      duration: 0,
      maxZoom: isMobile ? 12 : 13,
    })
    hasFitted.current = true
  }, [bounds, enabled, isLoaded, isMobile, map])

  return null
}

function MapInitialUserFocus({
  location,
  enabled,
}: {
  location: UserLocation | null
  enabled: boolean
}) {
  const { map, isLoaded } = useMap()
  const hasFocused = useRef(false)

  useEffect(() => {
    if (!map || !isLoaded || !enabled || !location || hasFocused.current) {
      return
    }

    map.flyTo({
      center: [location.longitude, location.latitude],
      zoom: 14,
      duration: 900,
      essential: true,
    })
    hasFocused.current = true
  }, [enabled, isLoaded, location, map])

  return null
}

function MapSelectionSync({
  selectedCode,
  selectedSource,
}: {
  selectedCode: string | null
  selectedSource: WaterSource | null
}) {
  const { map, isLoaded } = useMap()

  useEffect(() => {
    if (!map || !isLoaded || !selectedCode || !selectedSource) {
      return
    }

    map.flyTo({
      center: [selectedSource.longitude, selectedSource.latitude],
      zoom: Math.max(map.getZoom(), 15),
      duration: 700,
      essential: true,
    })
  }, [isLoaded, map, selectedCode, selectedSource])

  return null
}

export function WaterSourcesMap({
  sources,
  selectedSource,
  onSelect,
  routeBuilder,
  className,
}: WaterSourcesMapProps) {
  const isMobile = useIsMobile()
  const { location, permission, isLocationGranted, syncLocation, startWatch } =
    useGeolocation()
  const isRouteBuilding = routeBuilder?.isBuilding ?? false
  const isPlacingWaypoints = routeBuilder?.isPlacingWaypoints ?? false
  const isRouteComplete = routeBuilder?.isComplete ?? false
  const isReportMode = isRouteComplete && routeBuilder?.report != null
  const selectedCode = selectedSource?.code ?? null

  const visibleSources = useMemo(() => {
    return sources
  }, [isReportMode, routeBuilder?.report, sources])

  const geoJson = useMemo(
    () => waterSourcesToGeoJSON(visibleSources),
    [visibleSources]
  )
  const bounds = useMemo(() => getWaterSourcesBounds(sources), [sources])
  const shouldFitBarcelona = permission !== "unknown" && !isLocationGranted
  const clusterColors = isReportMode
    ? REPORT_CLUSTER_COLORS
    : DEFAULT_CLUSTER_COLORS
  const pointColor = isReportMode ? "#14b8a6" : "#7c3aed"

  const handlePointClick = useCallback(
    (feature: Feature<Point, WaterSourceMapProperties>) => {
      const properties = feature.properties
      const matched = barcelonaWaterSourcesByCode.get(properties.code)

      onSelect(
        matched ?? {
          code: properties.code,
          name: properties.name,
          street: properties.street,
          streetNumber: properties.streetNumber,
          neighborhood: properties.neighborhood,
          district: properties.district,
          neighborhoodCode: "",
          districtCode: "",
          xEtrs89: 0,
          yEtrs89: 0,
          latitude: feature.geometry.coordinates[1],
          longitude: feature.geometry.coordinates[0],
        }
      )
    },
    [onSelect]
  )

  const handleClosePopup = useCallback(() => {
    onSelect(null)
  }, [onSelect])

  const handleLocate = useCallback(
    (coords: { latitude: number; longitude: number }) => {
      syncLocation({
        latitude: coords.latitude,
        longitude: coords.longitude,
      })
      startWatch()
    },
    [startWatch, syncLocation]
  )

  return (
    <div className={cn("size-full", className)}>
      <Map className="size-full" {...BARCELONA_CENTER}>
        <MapInitialBounds bounds={bounds} enabled={shouldFitBarcelona} />
        <MapInitialUserFocus location={location} enabled={isLocationGranted} />
        <MapSelectionSync
          selectedCode={selectedCode}
          selectedSource={selectedSource}
        />
        <MapClusterLayer
          data={geoJson}
          clusterMaxZoom={14}
          clusterRadius={48}
          clusterColors={clusterColors}
          clusterThresholds={CLUSTER_THRESHOLDS}
          pointColor={pointColor}
          onPointClick={isRouteBuilding ? undefined : handlePointClick}
        />
        {routeBuilder ? (
          <>
            <MapRouteClickHandler
              enabled={isPlacingWaypoints}
              onAddWaypoint={routeBuilder.addWaypoint}
            />
            <RouteBuilderMapLayers
              waypoints={routeBuilder.waypoints}
              snappedRoute={routeBuilder.snappedRoute}
              isPlacingWaypoints={isPlacingWaypoints}
              isComplete={isRouteComplete}
              onRemoveWaypoint={routeBuilder.removeWaypoint}
            />
          </>
        ) : null}
        <MapControls
          showZoom
          showFullscreen
          showLocate
          position="bottom-right"
          className="max-md:bottom-16"
          onLocate={handleLocate}
        />
        {location ? <MapUserLocation location={location} /> : null}
        {selectedSource && !isRouteBuilding ? (
          <FountainPopup
            source={selectedSource}
            onClose={handleClosePopup}
            className={isMobile ? "max-w-[calc(100vw-2.5rem)]" : undefined}
          />
        ) : null}
      </Map>
    </div>
  )
}

export function findWaterSourceByCode(code: string): WaterSource | null {
  return barcelonaWaterSourcesByCode.get(code) ?? null
}
