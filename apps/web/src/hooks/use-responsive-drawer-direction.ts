import { useEffect, useState } from "react"

export function useResponsiveDrawerDirection() {
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
