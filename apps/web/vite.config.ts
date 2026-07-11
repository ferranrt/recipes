import path from "node:path"
import { fileURLToPath } from "node:url"

import { defineConfig } from "vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { nitro } from "nitro/vite"

const appDir = path.dirname(fileURLToPath(import.meta.url))

const config = defineConfig({
  envDir: appDir,
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    nitro(),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
})

export default config
