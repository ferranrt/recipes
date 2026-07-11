import * as React from "react"
import { Outlet } from "@tanstack/react-router"

const shellFallback = (
  <div className="flex h-dvh min-h-0 flex-1 flex-col overflow-hidden">
    <Outlet />
  </div>
)

export function AppShellLoader() {
  const [Shell, setShell] = React.useState<React.ComponentType | null>(null)

  React.useEffect(() => {
    void import("@/components/app-shell").then((module) => {
      setShell(() => module.AppShell)
    })
  }, [])

  if (!Shell) {
    return shellFallback
  }

  return <Shell />
}
