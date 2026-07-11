import type { RouteReport } from "../types"
import { getWaterSourceAddress, getWaterSourceDisplayName } from "../../utils"

function escapeCsvValue(value: string | number): string {
  const stringValue = String(value)

  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replaceAll('"', '""')}"`
  }

  return stringValue
}

export function exportReportToCsv(report: RouteReport) {
  const headers = [
    "code",
    "name",
    "distance_m",
    "latitude",
    "longitude",
    "street",
    "neighborhood",
    "district",
  ]

  const rows = report.entries.map((entry) => [
    entry.source.code,
    getWaterSourceDisplayName(entry.source),
    Math.round(entry.distanceMeters),
    entry.source.latitude,
    entry.source.longitude,
    getWaterSourceAddress(entry.source),
    entry.source.neighborhood,
    entry.source.district,
  ])

  const csv = [headers, ...rows]
    .map((row) => row.map(escapeCsvValue).join(","))
    .join("\n")

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `route-fountains-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export function formatRouteDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`
  }

  return `${Math.round(meters)} m`
}
