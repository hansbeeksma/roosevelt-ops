import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}"],
    exclude: ["node_modules", ".next"],
    globals: true,
    setupFiles: ["./test-setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["app/api/**", "lib/**"],
      exclude: [
        "node_modules",
        ".next",
        "**/*.d.ts",
        "**/*.config.*",
        "**/*.test.*",
        "lib/supabase/**",
      ],
      thresholds: {
        statements: 80,
        branches: 70,
        functions: 80,
        lines: 80,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
