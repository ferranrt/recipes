import type { WaterSource } from "./schema"
import { waterSourceSchema } from "./schema"

const WATER_SOURCE_CSV_HEADER = [
  "CODI",
  "NOM",
  "CARRER",
  "NUMERO_CARRER",
  "CODI_BARRI",
  "NOM_BARRI",
  "CODI_DISTRICTE",
  "NOM_DISTRICTE",
  "X_ETRS89",
  "Y_ETRS89",
  "LATITUD",
  "LONGITUD",
] as const

const WATER_SOURCE_FIELD_KEYS = [
  "code",
  "name",
  "street",
  "streetNumber",
  "neighborhoodCode",
  "neighborhood",
  "districtCode",
  "district",
  "xEtrs89",
  "yEtrs89",
  "latitude",
  "longitude",
] as const satisfies ReadonlyArray<keyof WaterSource>

function parseCsvLine(line: string): string[] {
  const values: string[] = []
  let current = ""
  let inQuotes = false

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index]

    if (char === '"') {
      if (inQuotes && line[index + 1] === '"') {
        current += '"'
        index += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (char === "," && !inQuotes) {
      values.push(current)
      current = ""
      continue
    }

    current += char
  }

  values.push(current)
  return values
}

function rowValuesToRecord(values: string[]): Record<keyof WaterSource, unknown> {
  return WATER_SOURCE_FIELD_KEYS.reduce(
    (record, field, index) => {
      record[field] = values[index]
      return record
    },
    {} as Record<keyof WaterSource, unknown>,
  )
}

function parseWaterSourceRow(values: string[]): WaterSource {
  const paddedValues = [...values]

  while (paddedValues.length < WATER_SOURCE_FIELD_KEYS.length) {
    paddedValues.push("")
  }

  return waterSourceSchema.parse(rowValuesToRecord(paddedValues))
}

function hasValidCoordinates(source: WaterSource): boolean {
  return source.latitude !== 0 || source.longitude !== 0
}

export function parseWaterSourcesCsv(csv: string): WaterSource[] {
  const lines = csv.trim().split(/\r?\n/)
  const [headerLine, ...rows] = lines

  if (!headerLine) {
    return []
  }

  const header = parseCsvLine(headerLine)

  if (header.join(",") !== WATER_SOURCE_CSV_HEADER.join(",")) {
    throw new Error("Unexpected water sources CSV header")
  }

  const sources: WaterSource[] = []

  for (const row of rows) {
    if (!row.trim()) {
      continue
    }

    const source = parseWaterSourceRow(parseCsvLine(row))

    if (hasValidCoordinates(source)) {
      sources.push(source)
    }
  }

  return sources
}
