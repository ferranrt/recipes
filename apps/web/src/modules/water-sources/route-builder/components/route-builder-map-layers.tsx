import {
  MapMarker,
  MapRoute,
  MarkerContent,
  MarkerLabel,
} from "@workspace/ui/components/ui/map"
import { cn } from "@workspace/ui/lib/utils"

import type { RouteWaypoint, SnappedRoute } from "../types"

type RouteBuilderMapLayersProps = {
  waypoints: RouteWaypoint[]
  snappedRoute: SnappedRoute | null
  isPlacingWaypoints: boolean
  isComplete: boolean
  onRemoveWaypoint?: (waypointId: string) => void
}

export function RouteBuilderMapLayers({
  waypoints,
  snappedRoute,
  isPlacingWaypoints,
  isComplete,
  onRemoveWaypoint,
}: RouteBuilderMapLayersProps) {
  const showSnappedRoute = isComplete && (snappedRoute?.coordinates.length ?? 0) >= 2

  return (
    <>
      {showSnappedRoute && snappedRoute ? (
        <MapRoute
          coordinates={snappedRoute.coordinates}
          color="#0d9488"
          width={4}
          opacity={0.9}
          interactive={false}
        />
      ) : null}

      {waypoints.map((waypoint, index) => (
        <MapMarker
          key={waypoint.id}
          longitude={waypoint.longitude}
          latitude={waypoint.latitude}
          onClick={
            isPlacingWaypoints
              ? (event) => {
                  event.stopPropagation()
                  onRemoveWaypoint?.(waypoint.id)
                }
              : undefined
          }
        >
          <MarkerContent
            className={cn(
              "flex size-7 items-center justify-center rounded-full border-2 border-white bg-blue-600 shadow-md",
              isPlacingWaypoints && "cursor-pointer transition-transform hover:scale-110",
            )}
          >
            <span className="text-xs font-semibold text-white">{index + 1}</span>
          </MarkerContent>
          <MarkerLabel className="rounded-md bg-background/95 px-2 py-0.5 text-xs font-medium shadow-sm">
            Waypoint {index + 1}
          </MarkerLabel>
        </MapMarker>
      ))}

    </>
  )
}
