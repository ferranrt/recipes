const EARTH_RADIUS_METERS = 6_371_000

export type LngLat = {
  longitude: number
  latitude: number
}

export function haversineMeters(a: LngLat, b: LngLat): number {
  const lat1 = (a.latitude * Math.PI) / 180
  const lat2 = (b.latitude * Math.PI) / 180
  const deltaLat = ((b.latitude - a.latitude) * Math.PI) / 180
  const deltaLng = ((b.longitude - a.longitude) * Math.PI) / 180

  const sinLat = Math.sin(deltaLat / 2)
  const sinLng = Math.sin(deltaLng / 2)
  const h =
    sinLat * sinLat +
    Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng

  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.min(1, Math.sqrt(h)))
}

function toLocalMeters(point: LngLat, origin: LngLat) {
  const latRad = (origin.latitude * Math.PI) / 180
  const x =
    ((point.longitude - origin.longitude) * Math.PI) / 180 *
    EARTH_RADIUS_METERS *
    Math.cos(latRad)
  const y =
    ((point.latitude - origin.latitude) * Math.PI) / 180 * EARTH_RADIUS_METERS

  return { x, y }
}

function pointToSegmentDistanceMeters(
  point: LngLat,
  start: LngLat,
  end: LngLat,
): number {
  const { distanceMeters } = projectPointOntoSegment(point, start, end)
  return distanceMeters
}

function projectPointOntoSegment(
  point: LngLat,
  start: LngLat,
  end: LngLat,
): { distanceMeters: number; distanceAlongSegmentMeters: number; segmentLengthMeters: number } {
  const origin = start
  const p = toLocalMeters(point, origin)
  const a = { x: 0, y: 0 }
  const b = toLocalMeters(end, origin)

  const abX = b.x - a.x
  const abY = b.y - a.y
  const lengthSquared = abX * abX + abY * abY

  if (lengthSquared === 0) {
    return {
      distanceMeters: haversineMeters(point, start),
      distanceAlongSegmentMeters: 0,
      segmentLengthMeters: 0,
    }
  }

  const t = Math.max(
    0,
    Math.min(1, ((p.x - a.x) * abX + (p.y - a.y) * abY) / lengthSquared),
  )

  const projection = {
    longitude: start.longitude + t * (end.longitude - start.longitude),
    latitude: start.latitude + t * (end.latitude - start.latitude),
  }

  const segmentLengthMeters = haversineMeters(start, end)

  return {
    distanceMeters: haversineMeters(point, projection),
    distanceAlongSegmentMeters: t * segmentLengthMeters,
    segmentLengthMeters,
  }
}

export function distanceAlongPolylineMeters(
  point: LngLat,
  line: [number, number][],
): number {
  if (line.length === 0) {
    return 0
  }

  if (line.length === 1) {
    const [longitude, latitude] = line[0]
    return haversineMeters(point, { longitude, latitude })
  }

  let bestDistanceAlong = 0
  let bestDistanceToLine = Number.POSITIVE_INFINITY
  let cumulative = 0

  for (let index = 0; index < line.length - 1; index += 1) {
    const [startLng, startLat] = line[index]
    const [endLng, endLat] = line[index + 1]
    const start = { longitude: startLng, latitude: startLat }
    const end = { longitude: endLng, latitude: endLat }
    const projection = projectPointOntoSegment(point, start, end)

    if (projection.distanceMeters < bestDistanceToLine) {
      bestDistanceToLine = projection.distanceMeters
      bestDistanceAlong = cumulative + projection.distanceAlongSegmentMeters
    }

    cumulative += projection.segmentLengthMeters
  }

  return bestDistanceAlong
}

export function distancePointToPolylineMeters(
  point: LngLat,
  line: [number, number][],
): number {
  if (line.length === 0) {
    return Number.POSITIVE_INFINITY
  }

  if (line.length === 1) {
    const [longitude, latitude] = line[0]
    return haversineMeters(point, { longitude, latitude })
  }

  let minDistance = Number.POSITIVE_INFINITY

  for (let index = 0; index < line.length - 1; index += 1) {
    const [startLng, startLat] = line[index]
    const [endLng, endLat] = line[index + 1]
    const distance = pointToSegmentDistanceMeters(
      point,
      { longitude: startLng, latitude: startLat },
      { longitude: endLng, latitude: endLat },
    )
    minDistance = Math.min(minDistance, distance)
  }

  return minDistance
}

export function expandBounds(
  bounds: [[number, number], [number, number]],
  paddingMeters: number,
): [[number, number], [number, number]] {
  const latPadding = paddingMeters / 111_320
  const lngPadding =
    paddingMeters /
    (111_320 * Math.cos((((bounds[0][1] + bounds[1][1]) / 2) * Math.PI) / 180))

  return [
    [bounds[0][0] - lngPadding, bounds[0][1] - latPadding],
    [bounds[1][0] + lngPadding, bounds[1][1] + latPadding],
  ]
}

export function getLineBounds(
  line: [number, number][],
): [[number, number], [number, number]] | null {
  if (line.length === 0) {
    return null
  }

  let minLng = Number.POSITIVE_INFINITY
  let minLat = Number.POSITIVE_INFINITY
  let maxLng = Number.NEGATIVE_INFINITY
  let maxLat = Number.NEGATIVE_INFINITY

  for (const [longitude, latitude] of line) {
    minLng = Math.min(minLng, longitude)
    minLat = Math.min(minLat, latitude)
    maxLng = Math.max(maxLng, longitude)
    maxLat = Math.max(maxLat, latitude)
  }

  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ]
}
