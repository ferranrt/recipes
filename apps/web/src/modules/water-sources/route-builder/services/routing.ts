import type { RouteWaypoint, SnappedRoute, TravelMode } from "../types"

const ORS_PROFILE: Record<TravelMode, string> = {
  foot: "foot-walking",
  cycling: "cycling-regular",
  driving: "driving-car",
}

const OSRM_PROFILE: Record<TravelMode, string> = {
  foot: "foot",
  cycling: "bike",
  driving: "car",
}

function coordinatesToPath(coordinates: [number, number][]): string {
  return coordinates.map(([lng, lat]) => `${lng},${lat}`).join(";")
}

async function snapWithOpenRouteService(
  waypoints: RouteWaypoint[],
  travelMode: TravelMode,
): Promise<SnappedRoute> {
  const apiKey = import.meta.env.VITE_ORS_API_KEY

  if (!apiKey) {
    throw new Error("Missing VITE_ORS_API_KEY")
  }

  const response = await fetch(
    `https://api.openrouteservice.org/v2/directions/${ORS_PROFILE[travelMode]}/geojson`,
    {
      method: "POST",
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        coordinates: waypoints.map((waypoint) => [
          waypoint.longitude,
          waypoint.latitude,
        ]),
      }),
    },
  )

  if (!response.ok) {
    throw new Error(`OpenRouteService failed with status ${response.status}`)
  }

  const data = (await response.json()) as {
    features?: Array<{
      geometry?: { coordinates?: [number, number][] }
      properties?: { summary?: { distance?: number } }
    }>
  }

  const feature = data.features?.[0]
  const coordinates = feature?.geometry?.coordinates

  if (!coordinates || coordinates.length < 2) {
    throw new Error("OpenRouteService returned an empty route")
  }

  return {
    coordinates,
    distanceMeters: feature?.properties?.summary?.distance ?? 0,
  }
}

async function snapWithOsrm(
  waypoints: RouteWaypoint[],
  travelMode: TravelMode,
): Promise<SnappedRoute> {
  const path = coordinatesToPath(
    waypoints.map((waypoint) => [waypoint.longitude, waypoint.latitude]),
  )

  const response = await fetch(
    `https://router.project-osrm.org/route/v1/${OSRM_PROFILE[travelMode]}/${path}?overview=full&geometries=geojson`,
  )

  if (!response.ok) {
    throw new Error(`OSRM failed with status ${response.status}`)
  }

  const data = (await response.json()) as {
    code?: string
    routes?: Array<{
      distance?: number
      geometry?: { coordinates?: [number, number][] }
    }>
  }

  if (data.code !== "Ok") {
    throw new Error(`OSRM returned code ${data.code ?? "unknown"}`)
  }

  const route = data.routes?.[0]
  const coordinates = route?.geometry?.coordinates

  if (!coordinates || coordinates.length < 2) {
    throw new Error("OSRM returned an empty route")
  }

  return {
    coordinates,
    distanceMeters: route?.distance ?? 0,
  }
}

export async function snapRouteToRoad(
  waypoints: RouteWaypoint[],
  travelMode: TravelMode,
): Promise<SnappedRoute> {
  if (waypoints.length < 2) {
    throw new Error("At least two waypoints are required")
  }

  if (import.meta.env.VITE_ORS_API_KEY) {
    try {
      return await snapWithOpenRouteService(waypoints, travelMode)
    } catch {
      return snapWithOsrm(waypoints, travelMode)
    }
  }

  return snapWithOsrm(waypoints, travelMode)
}
