import { createFileRoute } from "@tanstack/react-router"

import { ClientOnly } from "@/components/client-only"

export const Route = createFileRoute("/")({ component: App })

function App() {
  return (
    <ClientOnly
      fallback={
        <div className="flex flex-1 flex-col p-4 md:p-6">
          <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
            <h1 className="font-medium">Project ready!</h1>
          </div>
        </div>
      }
    >
      <div className="flex flex-1 flex-col p-4 md:p-6">
        <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
          <div>
            <h1 className="font-medium">Project ready!</h1>
            <p>You may now add components and start building.</p>
            <p>We&apos;ve already added the button component for you.</p>
            <button
              type="button"
              className="mt-2 inline-flex h-8 items-center justify-center rounded-lg border border-border bg-background px-2.5 text-sm font-medium"
            >
              Button
            </button>
          </div>
        </div>
      </div>
    </ClientOnly>
  )
}
