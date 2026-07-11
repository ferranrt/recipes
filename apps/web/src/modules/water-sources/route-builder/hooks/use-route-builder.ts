import { useCallback, useState } from "react"

import type { WaterSource } from "../../types"
import { DEFAULT_THRESHOLD_METERS } from "../constants"
import { snapRouteToRoad } from "../services/routing"
import type {
  RouteBuilderStatus,
  RouteReport,
  RouteWaypoint,
  SnappedRoute,
  TravelMode,
} from "../types"
import { findFountainsNearRoute } from "../utils/near-route"

function createWaypointId() {
  return crypto.randomUUID()
}

export function useRouteBuilder(sources: WaterSource[]) {
  const [status, setStatus] = useState<RouteBuilderStatus>("idle")
  const [waypoints, setWaypoints] = useState<RouteWaypoint[]>([])
  const [snappedRoute, setSnappedRoute] = useState<SnappedRoute | null>(null)
  const [travelMode, setTravelMode] = useState<TravelMode>("foot")
  const [thresholdMeters, setThresholdMeters] = useState(DEFAULT_THRESHOLD_METERS)
  const [report, setReport] = useState<RouteReport | null>(null)
  const [error, setError] = useState<string | null>(null)

  const reset = useCallback(() => {
    setStatus("idle")
    setWaypoints([])
    setSnappedRoute(null)
    setReport(null)
    setError(null)
  }, [])

  const start = useCallback(() => {
    setStatus("building")
    setWaypoints([])
    setSnappedRoute(null)
    setReport(null)
    setError(null)
  }, [])

  const cancel = useCallback(() => {
    reset()
  }, [reset])

  const addWaypoint = useCallback((longitude: number, latitude: number) => {
    setWaypoints((current) => [
      ...current,
      { id: createWaypointId(), longitude, latitude },
    ])
    setError(null)
  }, [])

  const removeLastWaypoint = useCallback(() => {
    setWaypoints((current) => current.slice(0, -1))
    setError(null)
  }, [])

  const removeWaypoint = useCallback((waypointId: string) => {
    setWaypoints((current) =>
      current.filter((waypoint) => waypoint.id !== waypointId),
    )
    setError(null)
  }, [])

  const recalculateReport = useCallback(() => {
    if (!snappedRoute) {
      return
    }

    const entries = findFountainsNearRoute(
      sources,
      snappedRoute.coordinates,
      thresholdMeters,
    )

    setReport({
      entries,
      routeDistanceMeters: snappedRoute.distanceMeters,
      thresholdMeters,
      travelMode,
      waypointCount: waypoints.length,
    })
  }, [snappedRoute, sources, thresholdMeters, travelMode, waypoints.length])

  const finish = useCallback(async () => {
    if (waypoints.length < 2) {
      setError("Add at least two waypoints on the map.")
      return
    }

    setStatus("snapping")
    setError(null)

    try {
      const route = await snapRouteToRoad(waypoints, travelMode)
      setSnappedRoute(route)

      const entries = findFountainsNearRoute(
        sources,
        route.coordinates,
        thresholdMeters,
      )

      setReport({
        entries,
        routeDistanceMeters: route.distanceMeters,
        thresholdMeters,
        travelMode,
        waypointCount: waypoints.length,
      })
      setStatus("complete")
    } catch (snapError) {
      setStatus("building")
      setError(
        snapError instanceof Error
          ? snapError.message
          : "Could not snap the route to roads.",
      )
    }
  }, [sources, thresholdMeters, travelMode, waypoints])

  const isPlacingWaypoints = status === "building"
  const isBuilding = status === "building" || status === "snapping"
  const isComplete = status === "complete"

  return {
    status,
    waypoints,
    snappedRoute,
    travelMode,
    thresholdMeters,
    report,
    error,
    isPlacingWaypoints,
    isBuilding,
    isComplete,
    isSnapping: status === "snapping",
    setTravelMode,
    setThresholdMeters,
    start,
    cancel,
    addWaypoint,
    removeLastWaypoint,
    removeWaypoint,
    finish,
    recalculateReport,
    reset,
  }
}

export type RouteBuilderState = ReturnType<typeof useRouteBuilder>
