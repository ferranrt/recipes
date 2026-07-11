import { useMemo, useState } from "react"
import { IconDroplet, IconSearch } from "@tabler/icons-react"
import { Badge } from "@workspace/ui/components/badge"
import { Empty, EmptyDescription, EmptyMedia } from "@workspace/ui/components/empty"
import { Input } from "@workspace/ui/components/input"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@workspace/ui/components/item"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { cn } from "@workspace/ui/lib/utils"

import type { WaterSource } from "../types"
import {
  filterWaterSources,
  getWaterSourceAddress,
  getWaterSourceDisplayName,
} from "../utils"

type WaterSourcesListProps = {
  sources: WaterSource[]
  selectedCode: string | null
  onSelect: (source: WaterSource) => void
  className?: string
  compact?: boolean
  showTitle?: boolean
}

export function WaterSourcesList({
  sources,
  selectedCode,
  onSelect,
  className,
  compact = false,
  showTitle = true,
}: WaterSourcesListProps) {
  const [query, setQuery] = useState("")

  const filteredSources = useMemo(
    () => filterWaterSources(sources, query),
    [query, sources],
  )

  return (
    <aside
      className={cn("flex min-h-0 flex-col bg-background", className)}
    >
      <div
        className={cn(
          "flex shrink-0 flex-col gap-3 border-b",
          compact ? "p-3" : "p-4",
        )}
      >
        <div className="flex flex-col gap-1">
          {showTitle ? (
            <h2
              className={cn(
                "font-medium",
                compact ? "text-sm" : "text-base",
              )}
            >
              Barcelona fountains
            </h2>
          ) : null}
          <p className="text-sm text-muted-foreground">
            {sources.length.toLocaleString()} public water sources
          </p>
        </div>
        <div className="relative">
          <IconSearch className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search fountains..."
            className="pl-8"
            aria-label="Search water sources"
          />
        </div>
        {query ? (
          <p className="text-xs text-muted-foreground">
            {filteredSources.length.toLocaleString()} results
          </p>
        ) : null}
      </div>

      <ScrollArea className="min-h-0 flex-1">
        {filteredSources.length === 0 ? (
          <Empty className="border-0">
            <EmptyMedia variant="icon">
              <IconDroplet />
            </EmptyMedia>
            <EmptyDescription>
              No water sources match your search.
            </EmptyDescription>
          </Empty>
        ) : (
          <ItemGroup className={cn("gap-0", compact ? "p-1.5" : "p-2")}>
            {filteredSources.map((source) => {
              const address = getWaterSourceAddress(source)
              const isSelected = selectedCode === source.code

              return (
                <Item
                  key={source.code}
                  size="sm"
                  variant={isSelected ? "muted" : "default"}
                  className={cn(
                    "cursor-pointer rounded-lg",
                    isSelected && "ring-1 ring-ring",
                  )}
                  onClick={() => onSelect(source)}
                >
                  <ItemContent>
                    <ItemTitle className="line-clamp-1">
                      {getWaterSourceDisplayName(source)}
                    </ItemTitle>
                    <ItemDescription className="flex flex-col gap-1">
                      {address ? (
                        <span className="line-clamp-1">{address}</span>
                      ) : null}
                      <span className="line-clamp-1">
                        {source.neighborhood} · {source.district}
                      </span>
                    </ItemDescription>
                    <div className="flex flex-wrap gap-1 pt-1">
                      <Badge variant="secondary">{source.code}</Badge>
                    </div>
                  </ItemContent>
                </Item>
              )
            })}
          </ItemGroup>
        )}
      </ScrollArea>
    </aside>
  )
}
