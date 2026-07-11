import { useEffect, useState } from "react"
import { IconList } from "@tabler/icons-react"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@workspace/ui/components/drawer"
import { cn } from "@workspace/ui/lib/utils"

import type { WaterSource } from "../types"
import { WaterSourcesList } from "./water-sources-list"

type WaterSourcesListDrawerProps = {
  sources: WaterSource[]
  selectedCode: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (source: WaterSource) => void
}

function useResponsiveDrawerDirection() {
  const [direction, setDirection] = useState<"down" | "left">(() => {
    if (typeof window === "undefined") {
      return "down"
    }

    return window.matchMedia("(min-width: 768px)").matches ? "left" : "down"
  })

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)")

    const updateDirection = () => {
      setDirection(mediaQuery.matches ? "left" : "down")
    }

    updateDirection()
    mediaQuery.addEventListener("change", updateDirection)

    return () => {
      mediaQuery.removeEventListener("change", updateDirection)
    }
  }, [])

  return direction
}

export function WaterSourcesListDrawer({
  sources,
  selectedCode,
  open,
  onOpenChange,
  onSelect,
}: WaterSourcesListDrawerProps) {
  const direction = useResponsiveDrawerDirection()
  const isBottomDrawer = direction === "down"

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      swipeDirection={direction}
      showSwipeHandle={isBottomDrawer}
    >
      <DrawerContent
        id="water-sources-list-drawer"
        className="gap-0 p-0"
        style={
          isBottomDrawer
            ? ({
                "--drawer-height": "min(88dvh, 42rem)",
              } as React.CSSProperties)
            : ({
                "--drawer-content-width": "min(24rem, 75vw)",
              } as React.CSSProperties)
        }
      >
        {isBottomDrawer ? (
          <DrawerHeader className="sr-only">
            <DrawerTitle>Barcelona fountains</DrawerTitle>
            <DrawerDescription>
              Browse and search public water sources in Barcelona.
            </DrawerDescription>
          </DrawerHeader>
        ) : (
          <DrawerHeader className="border-b pb-4">
            <DrawerTitle>Barcelona fountains</DrawerTitle>
            <DrawerDescription>
              {sources.length.toLocaleString()} public water sources in Barcelona
            </DrawerDescription>
          </DrawerHeader>
        )}

        <WaterSourcesList
          sources={sources}
          selectedCode={selectedCode}
          onSelect={onSelect}
          compact={isBottomDrawer}
          showTitle={isBottomDrawer}
          className="min-h-0 flex-1"
        />
      </DrawerContent>
    </Drawer>
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
      aria-controls="water-sources-list-drawer"
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
