import { useRouterState } from "@tanstack/react-router"
import { SidebarTrigger } from "@workspace/ui/components/sidebar"

const routeTitles: Record<string, string> = {
  "/": "Home",
  "/water-sources": "Water Sources",
}

function getRouteTitle(pathname: string): string {
  if (pathname.startsWith("/water-sources")) {
    return routeTitles["/water-sources"] ?? "Water Sources"
  }

  return routeTitles[pathname] ?? "Recipes"
}

export function SiteHeader() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const title = getRouteTitle(pathname)

  return (
    <header className="flex h-11 shrink-0 items-center gap-2 border-b px-3 md:h-12 md:px-4">
      <SidebarTrigger />
      <div className="flex min-w-0 flex-1 flex-col">
        <p className="truncate text-sm font-medium md:text-base">{title}</p>
      </div>
    </header>
  )
}
