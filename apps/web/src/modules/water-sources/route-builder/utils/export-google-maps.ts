import type { RouteReport } from "../types"
import { getLineBounds } from "./geo"

const GOOGLE_MAPS_URL_MAX_LENGTH = 2048

type FountainMarker = {
  latitude: number
  longitude: number
}

export type GoogleMapsExportResult = {
  url: string
  totalFountains: number
  includedFountains: number
  truncated: boolean
}

function formatCoordinate(latitude: number, longitude: number): string {
  return `${latitude.toFixed(5)},${longitude.toFixed(5)}`
}

function coordinateKey(latitude: number, longitude: number): string {
  return formatCoordinate(latitude, longitude)
}

function dedupeFountains(fountains: FountainMarker[]): FountainMarker[] {
  const seen = new Set<string>()
  const deduped: FountainMarker[] = []

  for (const fountain of fountains) {
    const key = coordinateKey(fountain.latitude, fountain.longitude)
    if (seen.has(key)) {
      continue
    }

    seen.add(key)
    deduped.push(fountain)
  }

  return deduped
}

function estimateZoom(
  bounds: [[number, number], [number, number]],
): number {
  const longitudeSpan = bounds[1][0] - bounds[0][0]
  const latitudeSpan = bounds[1][1] - bounds[0][1]
  const span = Math.max(longitudeSpan, latitudeSpan)

  if (span > 0.2) {
    return 11
  }

  if (span > 0.1) {
    return 12
  }

  if (span > 0.05) {
    return 13
  }

  if (span > 0.02) {
    return 14
  }

  return 15
}

function getMapViewport(fountains: FountainMarker[]): string {
  const bounds = getLineBounds(
    fountains.map(
      (fountain) =>
        [fountain.longitude, fountain.latitude] as [number, number],
    ),
  )

  if (!bounds) {
    return ""
  }

  const centerLatitude = (bounds[0][1] + bounds[1][1]) / 2
  const centerLongitude = (bounds[0][0] + bounds[1][0]) / 2
  const zoom = estimateZoom(bounds)

  return `@${formatCoordinate(centerLatitude, centerLongitude)},${zoom}z`
}

function buildSingleFountainUrl(fountain: FountainMarker): string {
  const params = new URLSearchParams({
    api: "1",
    query: formatCoordinate(fountain.latitude, fountain.longitude),
  })

  return `https://www.google.com/maps/search/?${params.toString()}`
}

function buildMultipleFountainsUrl(fountains: FountainMarker[]): string {
  const path = fountains
    .map((fountain) => formatCoordinate(fountain.latitude, fountain.longitude))
    .join("/")
  const viewport = getMapViewport(fountains)

  return `https://www.google.com/maps/dir//${path}//${viewport}`
}

function buildFountainsUrl(fountains: FountainMarker[]): string {
  if (fountains.length === 1) {
    return buildSingleFountainUrl(fountains[0])
  }

  return buildMultipleFountainsUrl(fountains)
}

function fitFountainsToUrlLength(
  fountains: FountainMarker[],
): { fountains: FountainMarker[]; url: string } {
  const workingFountains = [...fountains]
  let url = buildFountainsUrl(workingFountains)

  while (url.length > GOOGLE_MAPS_URL_MAX_LENGTH && workingFountains.length > 1) {
    workingFountains.pop()
    url = buildFountainsUrl(workingFountains)
  }

  return { fountains: workingFountains, url }
}

export function buildGoogleMapsFountainsUrl(
  report: RouteReport,
): GoogleMapsExportResult | null {
  const fountains = dedupeFountains(
    report.entries.map((entry) => ({
      latitude: entry.source.latitude,
      longitude: entry.source.longitude,
    })),
  )

  if (fountains.length === 0) {
    return null
  }

  const { fountains: includedFountains, url } = fitFountainsToUrlLength(fountains)

  return {
    url,
    totalFountains: fountains.length,
    includedFountains: includedFountains.length,
    truncated: includedFountains.length < fountains.length,
  }
}

export function openGoogleMapsFountains(report: RouteReport): GoogleMapsExportResult | null {
  const result = buildGoogleMapsFountainsUrl(report)

  if (!result) {
    window.alert("No fountains in this report to show on Google Maps.")
    return null
  }

  if (result.truncated) {
    window.alert(
      `Google Maps links are limited in length. Showing ${result.includedFountains} of ${result.totalFountains} fountain markers.`,
    )
  }

  window.open(result.url, "_blank", "noopener,noreferrer")
  return result
}
