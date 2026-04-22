import { defineConfig } from "vitest/config"  
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({ 
    resolve: {
        tsconfigPaths: true
    },
    test: {
        coverage: {
            provider: "v8"
        }
    }
})