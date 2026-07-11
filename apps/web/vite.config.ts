import path from "node:path"
import { fileURLToPath } from "node:url"
import type { Plugin } from "vite"

import { defineConfig } from "vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { nitro } from "nitro/vite"

const appDir = path.dirname(fileURLToPath(import.meta.url))

function patchSsrReactRequire(): Plugin {
  return {
    name: "patch-ssr-react-require",
    apply: "build",
    generateBundle(_options, bundle) {
      for (const output of Object.values(bundle)) {
        if (output.type !== "chunk") continue
        if (!output.code.includes('__require("react")')) continue
        if (!output.code.includes("require_react")) continue

        output.code = output.code.replaceAll(
          '__require("react")',
          "require_react()",
        )
      }
    },
  }
}

const config = defineConfig({
  envDir: appDir,
  resolve: {
    tsconfigPaths: true,
    dedupe: ["react", "react-dom"],
  },
  plugins: [
    nitro({
      config: {
        preset: process.env.NITRO_PRESET || "vercel",
        // @ts-expect-error Nitro preset options are not fully typed yet.
        vercel: {
          entryFormat: "node",
        },
      },
    }),
    patchSsrReactRequire(),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
})

export default config
