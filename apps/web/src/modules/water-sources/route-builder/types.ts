import type { WaterSource } from "../types"

export type TravelMode = "foot" | "cycling" | "driving"

export type RouteBuilderStatus = "idle" | "building" | "snapping" | "complete"

export type RouteWaypoint = {
  id: string
  longitude: number
  latitude: number
}

export type RouteReportEntry = {
  source: WaterSource
  distanceMeters: number
}

export type RouteReport = {
  entries: RouteReportEntry[]
  routeDistanceMeters: number
  thresholdMeters: number
  travelMode: TravelMode
  waypointCount: number
}

export type SnappedRoute = {
  coordinates: [number, number][]
  distanceMeters: number
}
