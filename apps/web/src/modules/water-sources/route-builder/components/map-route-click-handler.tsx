import { useEffect } from "react"

import { useMap } from "@workspace/ui/components/ui/map"

type MapRouteClickHandlerProps = {
  enabled: boolean
  onAddWaypoint: (longitude: number, latitude: number) => void
}

export function MapRouteClickHandler({
  enabled,
  onAddWaypoint,
}: MapRouteClickHandlerProps) {
  const { map, isLoaded } = useMap()

  useEffect(() => {
    if (!map || !isLoaded || !enabled) {
      return
    }

    const handleClick = (event: { lngLat: { lng: number; lat: number } }) => {
      onAddWaypoint(event.lngLat.lng, event.lngLat.lat)
    }

    const canvas = map.getCanvas()
    canvas.style.cursor = "crosshair"
    map.on("click", handleClick)

    return () => {
      map.off("click", handleClick)
      canvas.style.cursor = ""
    }
  }, [enabled, isLoaded, map, onAddWaypoint])

  return null
}
