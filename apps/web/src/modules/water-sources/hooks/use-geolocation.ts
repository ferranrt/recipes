import { useCallback, useEffect, useRef, useState } from "react"

export type UserLocation = {
  latitude: number
  longitude: number
  accuracy: number
}

type GeolocationPermission = PermissionState | "unknown"

export function useGeolocation() {
  const [location, setLocation] = useState<UserLocation | null>(null)
  const [permission, setPermission] = useState<GeolocationPermission>("unknown")
  const watchIdRef = useRef<number | null>(null)

  const clearWatch = useCallback(() => {
    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
  }, [])

  const handlePosition = useCallback((position: GeolocationPosition) => {
    setLocation({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
    })
  }, [])

  const startWatch = useCallback(() => {
    if (!("geolocation" in navigator)) {
      return
    }

    clearWatch()
    watchIdRef.current = navigator.geolocation.watchPosition(
      handlePosition,
      () => {
        setLocation(null)
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5_000,
        timeout: 15_000,
      },
    )
  }, [clearWatch, handlePosition])

  const syncLocation = useCallback(
    (coords: { latitude: number; longitude: number; accuracy?: number }) => {
      setLocation({
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: coords.accuracy ?? 0,
      })
    },
    [],
  )

  const requestLocation = useCallback(() => {
    if (!("geolocation" in navigator)) {
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        handlePosition(position)
        startWatch()
      },
      () => {
        setLocation(null)
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 15_000,
      },
    )
  }, [handlePosition, startWatch])

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setPermission("denied")
      return
    }

    if (!("permissions" in navigator)) {
      setPermission("prompt")
      return
    }

    let permissionStatus: PermissionStatus | null = null

    const syncPermission = () => {
      const state = permissionStatus?.state ?? "prompt"
      setPermission(state)

      if (state === "granted") {
        startWatch()
        return
      }

      clearWatch()
      setLocation(null)
    }

    navigator.permissions
      .query({ name: "geolocation" })
      .then((status) => {
        permissionStatus = status
        syncPermission()
        status.addEventListener("change", syncPermission)
      })
      .catch(() => {
        setPermission("prompt")
      })

    return () => {
      permissionStatus?.removeEventListener("change", syncPermission)
      clearWatch()
    }
  }, [clearWatch, startWatch])

  const isLocationGranted = permission === "granted"

  return {
    location,
    permission,
    isLocationGranted,
    requestLocation,
    syncLocation,
    startWatch,
  }
}
