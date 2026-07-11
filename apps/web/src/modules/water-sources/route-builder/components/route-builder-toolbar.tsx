import {
  IconArrowBackUp,
  IconCheck,
  IconRoute,
  IconX,
} from "@tabler/icons-react"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Label } from "@workspace/ui/components/label"
import {
  NativeSelect,
  NativeSelectOption,
} from "@workspace/ui/components/native-select"
import { Slider } from "@workspace/ui/components/slider"
import { Spinner } from "@workspace/ui/components/spinner"
import { cn } from "@workspace/ui/lib/utils"

import {
  MAX_THRESHOLD_METERS,
  MIN_THRESHOLD_METERS,
  THRESHOLD_STEP_METERS,
  TRAVEL_MODE_LABELS,
} from "../constants"
import type { RouteBuilderState } from "../hooks/use-route-builder"
import type { TravelMode } from "../types"

function getSliderValue(value: number | readonly number[]): number | undefined {
  if (typeof value === "number") {
    return value
  }

  return value[0]
}

type RouteBuilderToolbarProps = {
  routeBuilder: RouteBuilderState
  className?: string
}

export function RouteBuilderToolbar({
  routeBuilder,
  className,
}: RouteBuilderToolbarProps) {
  const {
    status,
    waypoints,
    travelMode,
    thresholdMeters,
    error,
    isBuilding,
    isSnapping,
    setTravelMode,
    setThresholdMeters,
    start,
    cancel,
    removeLastWaypoint,
    finish,
  } = routeBuilder

  if (status === "complete") {
    return null
  }

  return (
    <div
      className={cn(
        "pointer-events-auto w-full max-w-sm rounded-xl border bg-background/95 p-3 shadow-lg backdrop-blur-sm",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium">Route planner</p>
          <p className="text-xs text-muted-foreground">
            {isSnapping
              ? "Computing the route along roads…"
              : isBuilding
                ? "Tap the map to add waypoints. Tap a waypoint to remove it."
                : "Plan a route and find nearby fountains."}
          </p>
        </div>
        {isBuilding ? (
          <Badge variant="secondary" className="shrink-0">
            {waypoints.length} wp
          </Badge>
        ) : null}
      </div>

      <div className="mt-3 grid gap-3">
        <div className="grid gap-2">
          <Label htmlFor="travel-mode" className="text-xs">
            Travel mode
          </Label>
          <NativeSelect
            id="travel-mode"
            size="sm"
            className="w-full"
            value={travelMode}
            onChange={(event) =>
              setTravelMode(event.target.value as TravelMode)
            }
            disabled={isSnapping}
          >
            {(Object.keys(TRAVEL_MODE_LABELS) as TravelMode[]).map((mode) => (
              <NativeSelectOption key={mode} value={mode}>
                {TRAVEL_MODE_LABELS[mode]}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>

        <div className="grid gap-2">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="threshold" className="text-xs">
              Fountain proximity
            </Label>
            <span className="text-xs text-muted-foreground">
              {thresholdMeters} m
            </span>
          </div>
          <Slider
            id="threshold"
            min={MIN_THRESHOLD_METERS}
            max={MAX_THRESHOLD_METERS}
            step={THRESHOLD_STEP_METERS}
            value={[thresholdMeters]}
            onValueChange={(value) => {
              const nextValue = getSliderValue(value)
              if (nextValue !== undefined) {
                setThresholdMeters(nextValue)
              }
            }}
            disabled={isSnapping}
          />
        </div>
      </div>

      {error ? <p className="mt-3 text-xs text-destructive">{error}</p> : null}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {!isBuilding ? (
          <Button onClick={start}>
            <IconRoute className="size-4" />
            Start route
          </Button>
        ) : (
          <>
            <Button
              onClick={finish}
              disabled={waypoints.length < 2 || isSnapping}
            >
              {isSnapping ? (
                <Spinner className="size-4" />
              ) : (
                <IconCheck className="size-4" />
              )}
              {isSnapping ? "Computing…" : "Finish"}
            </Button>
            <Button
              variant="outline"
              onClick={removeLastWaypoint}
              disabled={waypoints.length === 0 || isSnapping}
            >
              <IconArrowBackUp className="size-4" />
              Undo
            </Button>
            <Button variant="ghost" onClick={cancel} disabled={isSnapping}>
              <IconX className="size-4" />
              Cancel
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
