import { useRef, type CSSProperties } from "react"
import {
  IconDownload,
  IconMap,
  IconRefresh,
  IconRoute,
} from "@tabler/icons-react"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@workspace/ui/components/drawer"
import { Label } from "@workspace/ui/components/label"
import { Slider } from "@workspace/ui/components/slider"
import { useVirtualizer } from "@tanstack/react-virtual"
import { cn } from "@workspace/ui/lib/utils"

import { useResponsiveDrawerDirection } from "@/hooks/use-responsive-drawer-direction"

import type { WaterSource } from "../../types"
import { getWaterSourceAddress, getWaterSourceDisplayName } from "../../utils"
import {
  MAX_THRESHOLD_METERS,
  MIN_THRESHOLD_METERS,
  THRESHOLD_STEP_METERS,
  TRAVEL_MODE_LABELS,
} from "../constants"
import type { RouteBuilderState } from "../hooks/use-route-builder"
import type { RouteReport } from "../types"
import { exportReportToCsv, formatRouteDistance } from "../utils/export-report"
import { openGoogleMapsFountains } from "../utils/export-google-maps"

type RouteReportDrawerProps = {
  routeBuilder: RouteBuilderState
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectFountain: (source: WaterSource) => void
  onNewRoute: () => void
}

function getSliderValue(value: number | readonly number[]): number | undefined {
  if (typeof value === "number") {
    return value
  }

  return value[0]
}

function ReportSummary({ report }: { report: RouteReport }) {
  return (
    <div className="grid grid-cols-2 gap-2 text-sm">
      <div className="rounded-lg border bg-muted/30 p-2.5">
        <p className="text-xs text-muted-foreground">Route length</p>
        <p className="font-medium">{formatRouteDistance(report.routeDistanceMeters)}</p>
      </div>
      <div className="rounded-lg border bg-muted/30 p-2.5">
        <p className="text-xs text-muted-foreground">Fountains nearby</p>
        <p className="font-medium">{report.entries.length}</p>
      </div>
      <div className="rounded-lg border bg-muted/30 p-2.5">
        <p className="text-xs text-muted-foreground">Travel mode</p>
        <p className="font-medium">{TRAVEL_MODE_LABELS[report.travelMode]}</p>
      </div>
      <div className="rounded-lg border bg-muted/30 p-2.5">
        <p className="text-xs text-muted-foreground">Within</p>
        <p className="font-medium">{report.thresholdMeters} m</p>
      </div>
    </div>
  )
}

function VirtualReportList({
  report,
  onSelectFountain,
}: {
  report: RouteReport
  onSelectFountain: (source: WaterSource) => void
}) {
  const parentRef = useRef<HTMLDivElement>(null)
  const entries = report.entries

  const virtualizer = useVirtualizer({
    count: entries.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 76,
    overscan: 8,
  })

  if (entries.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        No fountains found within {report.thresholdMeters} m of this route.
      </div>
    )
  }

  return (
    <div ref={parentRef} className="min-h-0 flex-1 overflow-y-auto">
      <div
        className="relative w-full"
        style={{ height: `${virtualizer.getTotalSize()}px` }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const entry = entries[virtualItem.index]

          return (
            <button
              key={entry.source.code}
              type="button"
              className="absolute inset-x-0 flex w-full items-start gap-3 rounded-lg border bg-background px-3 py-2.5 text-left transition-colors hover:bg-muted/50"
              style={{
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
              onClick={() => onSelectFountain(entry.source)}
            >
              <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-teal-500/15 text-xs font-semibold text-teal-700 dark:text-teal-300">
                {Math.round(entry.distanceMeters)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {getWaterSourceDisplayName(entry.source)}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {getWaterSourceAddress(entry.source) || entry.source.code}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {entry.source.neighborhood}
                  {entry.source.district ? ` · ${entry.source.district}` : ""}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function RouteReportDrawer({
  routeBuilder,
  open,
  onOpenChange,
  onSelectFountain,
  onNewRoute,
}: RouteReportDrawerProps) {
  const direction = useResponsiveDrawerDirection()
  const isBottomDrawer = direction === "down"
  const { report, thresholdMeters, setThresholdMeters, recalculateReport } =
    routeBuilder

  const canRecalculate =
    report != null && thresholdMeters !== report.thresholdMeters

  if (!report) {
    return null
  }

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      swipeDirection={direction}
      showSwipeHandle={isBottomDrawer}
    >
      <DrawerContent
        className={cn("flex flex-col gap-0 p-0", isBottomDrawer ? "max-h-[88dvh]" : "md:max-w-md")}
        style={
          isBottomDrawer
            ? ({ "--drawer-height": "min(88dvh, 42rem)" } as CSSProperties)
            : ({ "--drawer-content-width": "min(24rem, 75vw)" } as CSSProperties)
        }
      >
        <DrawerHeader className="border-b px-4 py-4 text-left">
          <div className="flex items-start justify-between gap-3">
            <div>
              <DrawerTitle className="flex items-center gap-2">
                <IconRoute className="size-4" />
                Route report
              </DrawerTitle>
              <DrawerDescription>
                Fountains within {report.thresholdMeters} m of your snapped route.
              </DrawerDescription>
            </div>
            <Badge variant="secondary">{report.entries.length}</Badge>
          </div>
        </DrawerHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-4 px-4 py-4">
          <ReportSummary report={report} />

          <div className="grid gap-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="report-threshold" className="text-xs">
                Adjust proximity
              </Label>
              <span className="text-xs text-muted-foreground">
                {thresholdMeters} m
              </span>
            </div>
            <Slider
              id="report-threshold"
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
            />
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              disabled={!canRecalculate}
              onClick={recalculateReport}
            >
              <IconRefresh className="size-4" />
              Update report
            </Button>
          </div>

          {open ? (
            <VirtualReportList report={report} onSelectFountain={onSelectFountain} />
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2 border-t px-4 py-4">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => openGoogleMapsFountains(report)}
          >
            <IconMap className="size-4" />
            Google Maps
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => exportReportToCsv(report)}
          >
            <IconDownload className="size-4" />
            Export CSV
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="w-full"
            onClick={onNewRoute}
          >
            New route
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export function RouteReportToggle({
  fountainCount,
  open,
  onOpenChange,
  className,
}: {
  fountainCount: number
  open: boolean
  onOpenChange: (open: boolean) => void
  className?: string
}) {
  return (
    <Button
      size="sm"
      variant={open ? "default" : "secondary"}
      className={cn("pointer-events-auto shadow-md", className)}
      onClick={() => onOpenChange(!open)}
    >
      <IconRoute className="size-4" />
      Report
      <Badge variant="outline" className="ml-1 bg-background/80">
        {fountainCount}
      </Badge>
    </Button>
  )
}
