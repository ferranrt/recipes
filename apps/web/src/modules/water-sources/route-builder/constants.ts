import type { TravelMode } from "./types"

export const DEFAULT_THRESHOLD_METERS = 50
export const MIN_THRESHOLD_METERS = 10
export const MAX_THRESHOLD_METERS = 500
export const THRESHOLD_STEP_METERS = 5

export const TRAVEL_MODE_LABELS: Record<TravelMode, string> = {
  foot: "Walking",
  cycling: "Cycling",
  driving: "Driving",
}
