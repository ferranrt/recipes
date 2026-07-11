import type { WaterSource } from "./types"

export function getWaterSourceDisplayName(source: WaterSource): string {
  if (source.name.trim()) {
    return source.name
  }

  const address = [source.street, source.streetNumber].filter(Boolean).join(" ")
  if (address.trim()) {
    return address
  }

  return source.code
}

export function getWaterSourceAddress(source: WaterSource): string {
  return [source.street, source.streetNumber].filter(Boolean).join(" ").trim()
}

export function filterWaterSources(
  sources: WaterSource[],
  query: string,
): WaterSource[] {
  const normalizedQuery = query.trim().toLowerCase()

  if (!normalizedQuery) {
    return sources
  }

  return sources.filter((source) => {
    const searchable = [
      source.code,
      source.name,
      source.street,
      source.streetNumber,
      source.neighborhood,
      source.district,
    ]
      .join(" ")
      .toLowerCase()

    return searchable.includes(normalizedQuery)
  })
}