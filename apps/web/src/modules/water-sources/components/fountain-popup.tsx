import { IconDroplet } from "@tabler/icons-react"
import { MapPopup } from "@workspace/ui/components/ui/map"
import { cn } from "@workspace/ui/lib/utils"

import type { WaterSource } from "../types"
import { getWaterSourceAddress, getWaterSourceDisplayName } from "../utils"

type FountainPopupProps = {
  source: WaterSource
  onClose: () => void
  className?: string
}

export function FountainPopup({
  source,
  onClose,
  className,
}: FountainPopupProps) {
  const name = getWaterSourceDisplayName(source)
  const address = getWaterSourceAddress(source)
  const showAddress = Boolean(address) && address !== name
  const area = [source.neighborhood, source.district]
    .filter(Boolean)
    .join(" · ")

  return (
    <MapPopup
      longitude={source.longitude}
      latitude={source.latitude}
      onClose={onClose}
      closeButton
      className={cn(
        "max-w-60 overflow-hidden p-0 shadow-lg ring-1 ring-foreground/8 backdrop-blur-md supports-backdrop-filter:bg-popover/90",
        className
      )}
    >
      <div className="flex flex-col gap-2 px-3 py-2.5 pr-7">
        <div className="flex items-start gap-2.5">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary [&_svg]:size-3.5">
            <IconDroplet />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <p className="line-clamp-2 text-sm leading-snug font-medium">
              {name}
            </p>
            <p className="text-[10px] tracking-wide text-muted-foreground">
              {source.code}
            </p>
          </div>
        </div>

        {showAddress || area ? (
          <div className="flex flex-col gap-0.5 border-t border-border/60 pt-2">
            {showAddress ? (
              <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                {address}
              </p>
            ) : null}
            {area ? (
              <p className="truncate text-xs text-muted-foreground">{area}</p>
            ) : null}
          </div>
        ) : null}
      </div>
    </MapPopup>
  )
}
