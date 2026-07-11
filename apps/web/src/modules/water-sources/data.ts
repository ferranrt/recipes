import csvRaw from "../../../datasets/water-sources/fonts_beure_2026.csv?raw"

import { parseWaterSourcesCsv } from "./parse-csv"

export const barcelonaWaterSources = parseWaterSourcesCsv(csvRaw)
