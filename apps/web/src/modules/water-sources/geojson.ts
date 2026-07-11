import type { FeatureCollection, Point } from "geojson"

import type { WaterSource, WaterSourceMapProperties } from "./types"

export function waterSourcesToGeoJSON(
  sources: WaterSource[],
): FeatureCollection<Point, WaterSourceMapProperties> {
  return {
    type: "FeatureCollection",
    features: sources.map((source) => ({
      type: "Feature",
      id: source.code,
      geometry: {
        type: "Point",
        coordinates: [source.longitude, source.latitude],
      },
      properties: {
        id: source.code,
        code: source.code,
        name: source.name,
        street: source.street,
        streetNumber: source.streetNumber,
        neighborhood: source.neighborhood,
        district: source.district,
      },
    })),
  }
}

export function getWaterSourcesBounds(
  sources: WaterSource[],
): [[number, number], [number, number]] {
  let minLongitude = Number.POSITIVE_INFINITY
  let minLatitude = Number.POSITIVE_INFINITY
  let maxLongitude = Number.NEGATIVE_INFINITY
  let maxLatitude = Number.NEGATIVE_INFINITY

  for (const source of sources) {
    minLongitude = Math.min(minLongitude, source.longitude)
    minLatitude = Math.min(minLatitude, source.latitude)
    maxLongitude = Math.max(maxLongitude, source.longitude)
    maxLatitude = Math.max(maxLatitude, source.latitude)
  }

  return [
    [minLongitude, minLatitude],
    [maxLongitude, maxLatitude],
  ]
}
