import type { WaterSource } from "../../types"
import type { RouteReportEntry } from "../types"
import {
  distancePointToPolylineMeters,
  expandBounds,
  getLineBounds,
} from "./geo"

export function findFountainsNearRoute(
  sources: WaterSource[],
  routeCoordinates: [number, number][],
  thresholdMeters: number,
): RouteReportEntry[] {
  if (routeCoordinates.length < 2) {
    return []
  }

  const bounds = getLineBounds(routeCoordinates)
  if (!bounds) {
    return []
  }

  const paddedBounds = expandBounds(bounds, thresholdMeters)
  const [min, max] = paddedBounds

  const candidates = sources.filter((source) => {
    return (
      source.longitude >= min[0] &&
      source.longitude <= max[0] &&
      source.latitude >= min[1] &&
      source.latitude <= max[1]
    )
  })

  const entries: RouteReportEntry[] = []

  for (const source of candidates) {
    const distanceMeters = distancePointToPolylineMeters(
      { longitude: source.longitude, latitude: source.latitude },
      routeCoordinates,
    )

    if (distanceMeters <= thresholdMeters) {
      entries.push({ source, distanceMeters })
    }
  }

  return entries.sort((left, right) => left.distanceMeters - right.distanceMeters)
}
