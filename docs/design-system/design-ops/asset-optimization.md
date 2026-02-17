# Design Asset Optimization Pipeline

> Automated image compression, SVG optimization, icon sprites, and CDN management

## Pipeline Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────────┐
│   Source     │────>│  Processing  │────>│   Output    │────>│  Delivery    │
│              │     │              │     │             │     │              │
│ - PNG/JPG   │     │ - sharp      │     │ - WebP      │     │ - CDN        │
│ - SVG       │     │ - SVGO       │     │ - AVIF      │     │ - next/image │
│ - Icons     │     │ - sprite     │     │ - Sprites   │     │ - Fallbacks  │
│ - Fonts     │     │   builder    │     │ - Subsets   │     │              │
└─────────────┘     └──────────────┘     └─────────────┘     └──────────────┘
```

## 1. Image Compression (sharp)

```typescript
// scripts/design-ops/optimize-assets.ts
import sharp from 'sharp'
import { glob } from 'glob'
import { readFileSync, writeFileSync, statSync } from 'fs'
import { join, parse } from 'path'

interface OptimizationConfig {
  inputDir: string
  outputDir: string
  formats: ('webp' | 'avif' | 'png' | 'jpg')[]
  quality: {
    webp: number
    avif: number
    png: number
    jpg: number
  }
  maxWidth: number
  responsive: number[]  // Widths for srcset
}

const config: OptimizationConfig = {
  inputDir: 'designs/assets',
  outputDir: 'public/images/optimized',
  formats: ['webp', 'avif'],
  quality: {
    webp: 80,
    avif: 65,
    png: 80,
    jpg: 80,
  },
  maxWidth: 2560,
  responsive: [320, 640, 768, 1024, 1280, 1920, 2560],
}

async function optimizeImages(): Promise<void> {
  const images = await glob(`${config.inputDir}/**/*.{png,jpg,jpeg}`)
  let totalSaved = 0

  for (const imagePath of images) {
    const { name } = parse(imagePath)
    const originalSize = statSync(imagePath).size

    for (const width of config.responsive) {
      for (const format of config.formats) {
        const outputPath = join(
          config.outputDir,
          `${name}-${width}w.${format}`
        )

        await sharp(imagePath)
          .resize(width, null, { withoutEnlargement: true })
          .toFormat(format, { quality: config.quality[format] })
          .toFile(outputPath)

        const newSize = statSync(outputPath).size
        totalSaved += originalSize - newSize
      }
    }
  }

  console.log(`Total saved: ${(totalSaved / 1024 / 1024).toFixed(2)} MB`)
}
```

## 2. SVG Optimization (SVGO)

```typescript
// svgo.config.ts
import type { Config } from 'svgo'

const svgoConfig: Config = {
  multipass: true,
  plugins: [
    'preset-default',
    'removeDimensions',
    {
      name: 'removeAttrs',
      params: {
        attrs: ['data-name'],
      },
    },
    {
      name: 'addAttributesToSVGElement',
      params: {
        attributes: [
          { 'aria-hidden': 'true' },
          { focusable: 'false' },
        ],
      },
    },
    {
      name: 'sortAttrs',
      params: {
        xmlnsOrder: 'alphabetical',
      },
    },
  ],
}

export default svgoConfig
```

## 3. Icon Sprite Generation

```typescript
// scripts/design-ops/build-icon-sprite.ts
import { readFileSync, writeFileSync } from 'fs'
import { glob } from 'glob'
import { optimize } from 'svgo'
import { parse, basename } from 'path'

async function buildIconSprite(): Promise<void> {
  const icons = await glob('designs/assets/icons/*.svg')
  const symbols: string[] = []

  for (const iconPath of icons) {
    const name = parse(iconPath).name
    const svg = readFileSync(iconPath, 'utf-8')
    const optimized = optimize(svg, {
      multipass: true,
      plugins: ['preset-default', 'removeDimensions'],
    })

    // Extract viewBox and inner content
    const viewBoxMatch = optimized.data.match(/viewBox="([^"]*)"/)
    const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 24 24'
    const inner = optimized.data
      .replace(/<svg[^>]*>/, '')
      .replace(/<\/svg>/, '')

    symbols.push(
      `  <symbol id="icon-${name}" viewBox="${viewBox}">${inner}</symbol>`
    )
  }

  const sprite = [
    '<svg xmlns="http://www.w3.org/2000/svg" style="display:none">',
    ...symbols,
    '</svg>',
  ].join('\n')

  writeFileSync('public/icons/sprite.svg', sprite)
  console.log(`Generated sprite with ${symbols.length} icons`)
}
```

## 4. Font Subsetting

```typescript
// scripts/design-ops/subset-fonts.ts
// Uses glyphhanger or fonttools for subsetting

interface FontSubsetConfig {
  fonts: Array<{
    input: string
    output: string
    unicodeRange: string
    formats: ('woff2' | 'woff')[]
  }>
}

const fontConfig: FontSubsetConfig = {
  fonts: [
    {
      input: 'designs/assets/fonts/SpaceGrotesk-SemiBold.ttf',
      output: 'public/fonts/SpaceGrotesk-SemiBold-latin',
      unicodeRange: 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD',
      formats: ['woff2'],
    },
    {
      input: 'designs/assets/fonts/Inter-Regular.ttf',
      output: 'public/fonts/Inter-Regular-latin',
      unicodeRange: 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD',
      formats: ['woff2'],
    },
  ],
}
```

## 5. Asset CDN Configuration

```typescript
// next.config.js - Image optimization settings
const imageConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 768, 1024, 1280, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
}
```

## Performance Budgets

| Asset Type | Budget | Measurement |
|------------|--------|-------------|
| Hero image | <200KB (WebP) | Per image |
| Icon (SVG) | <2KB | Per icon |
| Icon sprite | <50KB | Total sprite |
| Font file | <50KB (WOFF2) | Per font face |
| Total page images | <500KB | Per page |

## CI/CD Integration

```yaml
# Part of .github/workflows/design-lint.yml
optimize-assets:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '20'
    - run: npm ci
    - name: Optimize images
      run: npx ts-node scripts/design-ops/optimize-assets.ts
    - name: Build icon sprite
      run: npx ts-node scripts/design-ops/build-icon-sprite.ts
    - name: Check asset budgets
      run: |
        # Check no image exceeds 200KB
        find public/images -name "*.webp" -size +200k -exec echo "OVER BUDGET: {}" \;
        # Check sprite size
        SPRITE_SIZE=$(stat -f%z public/icons/sprite.svg 2>/dev/null || echo 0)
        if [ "$SPRITE_SIZE" -gt 51200 ]; then
          echo "OVER BUDGET: sprite.svg is ${SPRITE_SIZE} bytes"
          exit 1
        fi
```
