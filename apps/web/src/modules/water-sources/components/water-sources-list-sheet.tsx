import { useEffect, useState } from "react"
import { IconList } from "@tabler/icons-react"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet"
import { cn } from "@workspace/ui/lib/utils"

import type { WaterSource } from "../types"
import { WaterSourcesList } from "./water-sources-list"

type WaterSourcesListSheetProps = {
  sources: WaterSource[]
  selectedCode: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (source: WaterSource) => void
}

function useResponsiveSheetSide() {
  const [side, setSide] = useState<"bottom" | "left">(() => {
    if (typeof window === "undefined") {
      return "bottom"
    }

    return window.matchMedia("(min-width: 768px)").matches ? "left" : "bottom"
  })

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)")

    const updateSide = () => {
      setSide(mediaQuery.matches ? "left" : "bottom")
    }

    updateSide()
    mediaQuery.addEventListener("change", updateSide)

    return () => {
      mediaQuery.removeEventListener("change", updateSide)
    }
  }, [])

  return side
}

export function WaterSourcesListSheet({
  sources,
  selectedCode,
  open,
  onOpenChange,
  onSelect,
}: WaterSourcesListSheetProps) {
  const side = useResponsiveSheetSide()
  const isBottomSheet = side === "bottom"

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        id="water-sources-list-sheet"
        side={side}
        className={cn(
          "flex flex-col gap-0 p-0",
          isBottomSheet
            ? "h-[min(88dvh,42rem)] rounded-t-2xl"
            : "w-full max-w-sm border-r lg:max-w-96",
        )}
      >
        {isBottomSheet ? (
          <SheetHeader className="sr-only">
            <SheetTitle>Barcelona fountains</SheetTitle>
            <SheetDescription>
              Browse and search public water sources in Barcelona.
            </SheetDescription>
          </SheetHeader>
        ) : (
          <SheetHeader className="border-b p-4">
            <SheetTitle>Barcelona fountains</SheetTitle>
            <SheetDescription>
              {sources.length.toLocaleString()} public water sources in Barcelona
            </SheetDescription>
          </SheetHeader>
        )}

        {isBottomSheet ? (
          <div
            aria-hidden
            className="mx-auto mt-2 h-1 w-12 shrink-0 rounded-full bg-muted-foreground/30"
          />
        ) : null}

        <WaterSourcesList
          sources={sources}
          selectedCode={selectedCode}
          onSelect={onSelect}
          compact={isBottomSheet}
          showTitle={isBottomSheet}
          className="min-h-0 flex-1"
        />
      </SheetContent>
    </Sheet>
  )
}

type WaterSourcesListToggleProps = {
  sourceCount: number
  selectedCode: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  className?: string
}

export function WaterSourcesListToggle({
  sourceCount,
  selectedCode,
  open,
  onOpenChange,
  className,
}: WaterSourcesListToggleProps) {
  return (
    <Button
      variant={open ? "secondary" : "default"}
      className={cn("pointer-events-auto shadow-md", className)}
      onClick={() => onOpenChange(!open)}
      aria-expanded={open}
      aria-controls="water-sources-list-sheet"
    >
      <IconList data-icon="inline-start" />
      <span className="max-sm:sr-only">Fountains</span>
      <span className="sm:hidden">Browse</span>
      <Badge variant="secondary">{sourceCount.toLocaleString()}</Badge>
      {selectedCode ? (
        <Badge variant="outline" className="max-sm:hidden">
          1 selected
        </Badge>
      ) : null}
    </Button>
  )
}
