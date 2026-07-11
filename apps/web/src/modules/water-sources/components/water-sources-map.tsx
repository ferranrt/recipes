import { useEffect, useMemo, useRef } from "react"
import type { Feature, Point } from "geojson"

import { useIsMobile } from "@/hooks/use-mobile"

import {
  Map,
  MapClusterLayer,
  MapControls,
  useMap,
} from "@workspace/ui/components/ui/map"
import { cn } from "@workspace/ui/lib/utils"

import { useGeolocation } from "../hooks/use-geolocation"
import type { UserLocation } from "../hooks/use-geolocation"
import { getWaterSourcesBounds, waterSourcesToGeoJSON } from "../geojson"
import type { WaterSource, WaterSourceMapProperties } from "../types"
import { FountainPopup } from "./fountain-popup"
import { MapUserLocation } from "./map-user-location"

const BARCELONA_CENTER = {
  center: [2.1686, 41.3874] as [number, number],
  zoom: 12,
}

type WaterSourcesMapProps = {
  sources: WaterSource[]
  selectedSource: WaterSource | null
  onSelect: (source: WaterSource | null) => void
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
  selectedSource,
}: {
  selectedSource: WaterSource | null
}) {
  const { map, isLoaded } = useMap()

  useEffect(() => {
    if (!map || !isLoaded || !selectedSource) {
      return
    }

    map.flyTo({
      center: [selectedSource.longitude, selectedSource.latitude],
      zoom: Math.max(map.getZoom(), 15),
      duration: 700,
      essential: true,
    })
  }, [isLoaded, map, selectedSource])

  return null
}

export function WaterSourcesMap({
  sources,
  selectedSource,
  onSelect,
  className,
}: WaterSourcesMapProps) {
  const isMobile = useIsMobile()
  const { location, permission, isLocationGranted, syncLocation, startWatch } =
    useGeolocation()
  const geoJson = useMemo(() => waterSourcesToGeoJSON(sources), [sources])
  const bounds = useMemo(() => getWaterSourcesBounds(sources), [sources])
  const shouldFitBarcelona = permission !== "unknown" && !isLocationGranted

  const handlePointClick = (
    feature: Feature<Point, WaterSourceMapProperties>
  ) => {
    const properties = feature.properties

    onSelect({
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
    })
  }

  return (
    <div className={cn("size-full", className)}>
      <Map className="size-full" {...BARCELONA_CENTER}>
        <MapInitialBounds bounds={bounds} enabled={shouldFitBarcelona} />
        <MapInitialUserFocus location={location} enabled={isLocationGranted} />
        <MapSelectionSync selectedSource={selectedSource} />
        <MapClusterLayer
          data={geoJson}
          clusterMaxZoom={14}
          clusterRadius={48}
          clusterColors={["#a78bfa", "#8b5cf6", "#6d28d9"]}
          clusterThresholds={[25, 100]}
          pointColor="#7c3aed"
          onPointClick={handlePointClick}
        />
        <MapControls
          showZoom
          showFullscreen
          showLocate
          position="bottom-right"
          className="max-md:bottom-16"
          onLocate={(coords) => {
            syncLocation({
              latitude: coords.latitude,
              longitude: coords.longitude,
            })
            startWatch()
          }}
        />
        {location ? <MapUserLocation location={location} /> : null}
        {selectedSource ? (
          <FountainPopup
            source={selectedSource}
            onClose={() => onSelect(null)}
            className={isMobile ? "max-w-[calc(100vw-2.5rem)]" : undefined}
          />
        ) : null}
      </Map>
    </div>
  )
}

export function findWaterSourceByCode(
  sources: WaterSource[],
  code: string
): WaterSource | null {
  return sources.find((source) => source.code === code) ?? null
}
