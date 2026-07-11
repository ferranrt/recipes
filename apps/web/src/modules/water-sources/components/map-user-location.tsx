import {
  MapMarker,
  MarkerContent,
} from "@workspace/ui/components/ui/map"

import type { UserLocation } from "../hooks/use-geolocation"

type MapUserLocationProps = {
  location: UserLocation
}

export function MapUserLocation({ location }: MapUserLocationProps) {
  return (
    <MapMarker
      longitude={location.longitude}
      latitude={location.latitude}
    >
      <MarkerContent className="pointer-events-none">
        <div className="relative flex size-5 items-center justify-center">
          <span className="absolute size-8 rounded-full bg-primary/20" />
          <span className="relative size-3 rounded-full border-2 border-background bg-primary shadow-md ring-2 ring-primary/30" />
        </div>
      </MarkerContent>
    </MapMarker>
  )
}
