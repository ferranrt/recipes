import { z } from "zod"

const csvString = z.preprocess(
  (value) => (value == null ? "" : String(value)),
  z.string().catch("")
)

const csvNumber = z.preprocess((value) => {
  if (value == null || value === "") {
    return undefined
  }

  const parsed = Number.parseFloat(String(value))
  return Number.isFinite(parsed) ? parsed : undefined
}, z.number().catch(0))

export const waterSourceSchema = z.object({
  code: csvString,
  name: csvString,
  street: csvString,
  streetNumber: csvString,
  neighborhoodCode: csvString,
  neighborhood: csvString,
  districtCode: csvString,
  district: csvString,
  xEtrs89: csvNumber,
  yEtrs89: csvNumber,
  latitude: csvNumber,
  longitude: csvNumber,
})

export type WaterSource = z.infer<typeof waterSourceSchema>

export type WaterSourceMapProperties = Pick<
  WaterSource,
  "code" | "name" | "street" | "streetNumber" | "neighborhood" | "district"
> & {
  id: string
}

export const waterSourceMapPropertiesSchema = waterSourceSchema
  .pick({
    code: true,
    name: true,
    street: true,
    streetNumber: true,
    neighborhood: true,
    district: true,
  })
  .extend({
    id: csvString,
  })
