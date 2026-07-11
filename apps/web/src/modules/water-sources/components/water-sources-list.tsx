import { useEffect, useMemo, useRef, useState } from "react"
import { IconDroplet, IconSearch } from "@tabler/icons-react"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@workspace/ui/components/input-group"
import { Badge } from "@workspace/ui/components/badge"
import {
  Empty,
  EmptyDescription,
  EmptyMedia,
} from "@workspace/ui/components/empty"
import { Input } from "@workspace/ui/components/input"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@workspace/ui/components/item"
import { cn } from "@workspace/ui/lib/utils"
import { useVirtualizer } from "@tanstack/react-virtual"

import type { WaterSource } from "../types"
import {
  filterWaterSources,
  getWaterSourceAddress,
  getWaterSourceDisplayName,
} from "../utils"

const LIST_ITEM_ESTIMATE = {
  compact: 88,
  default: 96,
} as const

type WaterSourceListItemProps = {
  source: WaterSource
  isSelected: boolean
  onSelect: (source: WaterSource) => void
}

function WaterSourceListItem({
  source,
  isSelected,
  onSelect,
}: WaterSourceListItemProps) {
  const address = getWaterSourceAddress(source)

  return (
    <Item
      size="xs"
      variant={isSelected ? "muted" : "default"}
      className={cn(
        "w-full cursor-pointer rounded-lg",
        isSelected && "ring-1 ring-ring"
      )}
      onClick={() => onSelect(source)}
    >
      <ItemMedia className="rounded-full bg-primary/10 p-1 text-primary [&_svg]:size-3.5">
        <IconDroplet />
      </ItemMedia>
      <ItemContent>
        <div className="flex flex-row gap-2">
          <ItemTitle className="line-clamp-1">
            {getWaterSourceDisplayName(source)}
          </ItemTitle>
          <Badge variant="secondary">{source.code}</Badge>
        </div>
        <ItemDescription className="flex flex-col gap-1">
          {address ? <span className="line-clamp-1">{address}</span> : null}
        </ItemDescription>
        <ItemDescription className="line-clamp-1">
          {source.neighborhood} · {source.district}
        </ItemDescription>
      </ItemContent>
    </Item>
  )
}

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
  const scrollRef = useRef<HTMLDivElement>(null)

  const filteredSources = useMemo(
    () => filterWaterSources(sources, query),
    [query, sources]
  )

  const virtualizer = useVirtualizer({
    count: filteredSources.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () =>
      compact ? LIST_ITEM_ESTIMATE.compact : LIST_ITEM_ESTIMATE.default,
    overscan: 10,
    getItemKey: (index) => filteredSources[index]?.code ?? index,
    measureElement: (element) => element.getBoundingClientRect().height,
  })

  const virtualItems = virtualizer.getVirtualItems()

  useEffect(() => {
    virtualizer.scrollToOffset(0)
  }, [query, virtualizer])

  useEffect(() => {
    if (!selectedCode) {
      return
    }

    const selectedIndex = filteredSources.findIndex(
      (source) => source.code === selectedCode
    )

    if (selectedIndex >= 0) {
      virtualizer.scrollToIndex(selectedIndex, { align: "auto" })
    }
  }, [filteredSources, selectedCode, virtualizer])

  return (
    <aside className={cn("flex min-h-0 flex-col bg-background", className)}>
      <div
        className={cn(
          "flex shrink-0 flex-col gap-3 border-b",
          compact ? "p-3" : "p-4"
        )}
      >
        <div className="flex flex-col gap-1">
          {showTitle ? (
            <h2 className={cn("font-medium", compact ? "text-sm" : "text-lg")}>
              Barcelona fountains
            </h2>
          ) : null}
          <p className="text-sm text-muted-foreground">
            {sources.length.toLocaleString()} public water sources
          </p>
        </div>
        <div className="relative">
          <InputGroup>
            <InputGroupAddon>
              <IconSearch />
            </InputGroupAddon>
            <InputGroupInput
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search fountains..."
              className="pl-8"
              aria-label="Search water sources"
            />
          </InputGroup>
        </div>
        {query ? (
          <p className="text-xs text-muted-foreground">
            {filteredSources.length.toLocaleString()} results
          </p>
        ) : null}
      </div>

      {filteredSources.length === 0 ? (
        <Empty className="min-h-0 flex-1 border-0">
          <EmptyMedia variant="icon">
            <IconDroplet />
          </EmptyMedia>
          <EmptyDescription>
            No water sources match your search.
          </EmptyDescription>
        </Empty>
      ) : (
        <div
          ref={scrollRef}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
        >
          <ItemGroup
            className={cn("relative w-full gap-0", compact ? "p-1.5" : "p-2")}
            style={{ height: virtualizer.getTotalSize() }}
          >
            {virtualItems.map((virtualItem) => {
              const source = filteredSources[virtualItem.index]

              return (
                <div
                  key={virtualItem.key}
                  data-index={virtualItem.index}
                  ref={virtualizer.measureElement}
                  className="absolute top-0 left-0 w-full"
                  style={{
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                >
                  <WaterSourceListItem
                    source={source}
                    isSelected={selectedCode === source.code}
                    onSelect={onSelect}
                  />
                </div>
              )
            })}
          </ItemGroup>
        </div>
      )}
    </aside>
  )
}
