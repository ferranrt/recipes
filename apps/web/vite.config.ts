import { defineConfig } from "vite"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { nitro } from "nitro/vite"

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    process.env.NODE_ENV !== "production" ? devtools() : undefined,
    tailwindcss(),
    tanstackStart(),
    viteReact(),
    nitro({
      config: {
        preset: process.env.NITRO_PRESET || "vercel",
      },
    }),
  ].filter(Boolean),
})

export default config
