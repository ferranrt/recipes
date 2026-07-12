import type { ExpressionSpecification } from "maplibre-gl"
import type { Map as MapLibreMap } from "maplibre-gl"
import { animate, type AnimationPlaybackControls, type Easing } from "motion"

export const MAP_POINT_ENTER_EASE = [0.22, 1, 0.36, 1] as Easing
export const MAP_POINT_EXIT_EASE = [0.4, 0, 0.2, 1] as Easing
export const MAP_POINT_ENTER_DURATION = 0.34
export const MAP_POINT_EXIT_DURATION = 0.2

const MIN_RADIUS_SCALE = 0.45

export type AnimatedMapLayer = {
  layerId: string
  baseOpacity: number
  opacityProperty?: "circle-opacity" | "text-opacity"
  radiusProperty?: "circle-radius"
  baseRadius?: number | ExpressionSpecification
}

export function prefersReducedMapMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  )
}

function getRadiusAtProgress(
  baseRadius: number | ExpressionSpecification,
  progress: number,
) {
  const scale = MIN_RADIUS_SCALE + (1 - MIN_RADIUS_SCALE) * progress

  if (typeof baseRadius === "number") {
    return baseRadius * scale
  }

  return ["*", baseRadius, scale] as ExpressionSpecification
}

export function setMapLayersVisibility(
  map: MapLibreMap,
  layers: AnimatedMapLayer[],
  progress: number,
) {
  for (const layer of layers) {
    if (!map.getLayer(layer.layerId)) continue

    map.setPaintProperty(
      layer.layerId,
      layer.opacityProperty ?? "circle-opacity",
      layer.baseOpacity * progress,
    )

    if (layer.radiusProperty && layer.baseRadius !== undefined) {
      map.setPaintProperty(
        layer.layerId,
        layer.radiusProperty,
        getRadiusAtProgress(layer.baseRadius, progress),
      )
    }
  }
}

export function animateMapLayers(
  map: MapLibreMap,
  layers: AnimatedMapLayer[],
  from: number,
  to: number,
  options: {
    duration: number
    ease?: Easing | Easing[]
  },
): AnimationPlaybackControls {
  if (prefersReducedMapMotion()) {
    setMapLayersVisibility(map, layers, to)
    return {
      stop: () => {},
      finished: Promise.resolve(),
    } as AnimationPlaybackControls
  }

  return animate(from, to, {
    duration: options.duration,
    ease: options.ease ?? MAP_POINT_ENTER_EASE,
    onUpdate: (progress) => {
      setMapLayersVisibility(map, layers, progress)
    },
  })
}
