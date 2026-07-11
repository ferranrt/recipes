import csvRaw from "../../../datasets/water-sources/fonts_beure_2026.csv?raw"

import { parseWaterSourcesCsv } from "./parse-csv"
import type { WaterSource } from "./types"

export const barcelonaWaterSources = parseWaterSourcesCsv(csvRaw)

export const barcelonaWaterSourcesByCode = new Map<string, WaterSource>(
  barcelonaWaterSources.map((source) => [source.code, source]),
)
