import { useCallback, useEffect, useState } from "react"
import {
  IconArrowBackUp,
  IconCheck,
  IconChevronsUp,
  IconRoute,
  IconX,
} from "@tabler/icons-react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
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

const PANEL_EASE = [0.22, 1, 0.36, 1] as const

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
  const [expanded, setExpanded] = useState(false)
  const prefersReducedMotion = useReducedMotion()
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

  const isBusy = isBuilding || isSnapping

  useEffect(() => {
    if (isBusy) {
      setExpanded(true)
    }
  }, [isBusy])

  const handleCollapse = useCallback(() => {
    if (!isBusy) {
      setExpanded(false)
    }
  }, [isBusy])

  const handleCancel = useCallback(() => {
    cancel()
    setExpanded(false)
  }, [cancel])

  if (status === "complete") {
    return null
  }

  const transition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.28, ease: PANEL_EASE }

  const statusMessage = isSnapping
    ? "Computing the route along roads…"
    : isBuilding
      ? "Tap the map to add waypoints. Tap a waypoint to remove it."
      : "Plan a route and find nearby fountains."

  return (
    <div className={cn("pointer-events-auto ml-auto shrink-0", className)}>
      <AnimatePresence mode="popLayout" initial={false}>
        {!expanded ? (
          <motion.div
            key="collapsed"
            layout
            initial={{ opacity: 0, scale: 0.96, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -4 }}
            transition={transition}
          >
            <Button
              onClick={() => setExpanded(true)}
              aria-expanded={false}
              aria-controls="route-builder-panel"
            >
              <IconRoute />
              Create route
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="expanded"
            id="route-builder-panel"
            layout
            role="region"
            aria-label="Route planner"
            initial={{ opacity: 0, scale: 0.98, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -8 }}
            transition={transition}
            className="w-[min(100vw-1.5rem,24rem)] origin-top-right overflow-hidden rounded-xl border bg-background/95 shadow-lg backdrop-blur-sm"
          >
            <div className="p-3">
              <div className="flex items-start gap-2">
                {!isBusy ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="-ml-1 shrink-0"
                    onClick={handleCollapse}
                    aria-label="Collapse route planner"
                    aria-expanded
                  >
                    <IconChevronsUp className="size-4" />
                  </Button>
                ) : (
                  <span className="size-8 shrink-0" aria-hidden />
                )}

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">Route planner</p>
                  <p className="text-xs text-muted-foreground">
                    {statusMessage}
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
                    className="w-full"
                    value={travelMode}
                    onChange={(event) =>
                      setTravelMode(event.target.value as TravelMode)
                    }
                    disabled={isSnapping}
                  >
                    {(Object.keys(TRAVEL_MODE_LABELS) as TravelMode[]).map(
                      (mode) => (
                        <NativeSelectOption key={mode} value={mode}>
                          {TRAVEL_MODE_LABELS[mode]}
                        </NativeSelectOption>
                      )
                    )}
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

              {error ? (
                <p className="mt-3 text-xs text-destructive">{error}</p>
              ) : null}

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
                    <Button
                      variant="ghost"
                      onClick={handleCancel}
                      disabled={isSnapping}
                    >
                      <IconX className="size-4" />
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
