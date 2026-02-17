# Brand Configuration Management

> Brand registry, validation rules, and version control

## Brand Registry

Central registry of all brand configurations:

```typescript
// lib/design-system/brand-registry.ts

interface BrandRegistry {
  version: string
  defaultBrand: string
  brands: Record<string, BrandRegistryEntry>
}

interface BrandRegistryEntry {
  id: string
  name: string
  status: 'active' | 'draft' | 'deprecated'
  configPath: string
  cssPath: string
  createdAt: string
  updatedAt: string
}

const registry: BrandRegistry = {
  version: '1.0.0',
  defaultBrand: 'roosevelt',
  brands: {
    roosevelt: {
      id: 'roosevelt',
      name: 'Roosevelt OPS',
      status: 'active',
      configPath: 'lib/design-system/brands/roosevelt.json',
      cssPath: 'lib/design-system/tokens/brands/roosevelt.css',
      createdAt: '2026-02-17',
      updatedAt: '2026-02-17',
    },
    default: {
      id: 'default',
      name: 'Default Theme',
      status: 'active',
      configPath: 'lib/design-system/brands/default.json',
      cssPath: 'lib/design-system/tokens/semantic.css',
      createdAt: '2026-02-17',
      updatedAt: '2026-02-17',
    },
  },
}

export { registry }
export type { BrandRegistry, BrandRegistryEntry }
```

## JSON Schema Validation

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Brand Configuration",
  "type": "object",
  "required": ["id", "name", "version", "tokens"],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^[a-z][a-z0-9-]*$",
      "description": "Unique brand identifier (kebab-case)"
    },
    "name": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100,
      "description": "Human-readable brand name"
    },
    "version": {
      "type": "string",
      "pattern": "^\\d+\\.\\d+\\.\\d+$",
      "description": "SemVer version of the brand config"
    },
    "tokens": {
      "type": "object",
      "required": ["colors", "typography"],
      "properties": {
        "colors": {
          "type": "object",
          "required": ["primary", "text", "bg"],
          "properties": {
            "primary": { "type": "string", "pattern": "^#[0-9a-fA-F]{6}$" },
            "primaryHover": { "type": "string", "pattern": "^#[0-9a-fA-F]{6}$" },
            "primaryActive": { "type": "string", "pattern": "^#[0-9a-fA-F]{6}$" },
            "primaryLight": { "type": "string", "pattern": "^#[0-9a-fA-F]{6}$" },
            "onPrimary": { "type": "string", "pattern": "^#[0-9a-fA-F]{6}$" },
            "text": { "type": "string", "pattern": "^#[0-9a-fA-F]{6}$" },
            "textSecondary": { "type": "string", "pattern": "^#[0-9a-fA-F]{6}$" },
            "bg": { "type": "string", "pattern": "^#[0-9a-fA-F]{6}$" },
            "bgCard": { "type": "string", "pattern": "^#[0-9a-fA-F]{6}$" },
            "success": { "type": "string", "pattern": "^#[0-9a-fA-F]{6}$" },
            "error": { "type": "string", "pattern": "^#[0-9a-fA-F]{6}$" },
            "warning": { "type": "string", "pattern": "^#[0-9a-fA-F]{6}$" }
          }
        },
        "typography": {
          "type": "object",
          "required": ["fontHeading", "fontBody"],
          "properties": {
            "fontHeading": { "type": "string" },
            "fontBody": { "type": "string" },
            "fontSizeBase": { "type": "string", "default": "16px" },
            "lineHeightBase": { "type": "number", "default": 1.5 }
          }
        }
      }
    },
    "assets": {
      "type": "object",
      "properties": {
        "logo": { "type": "string", "format": "uri-reference" },
        "favicon": { "type": "string", "format": "uri-reference" },
        "ogImage": { "type": "string", "format": "uri-reference" }
      }
    }
  }
}
```

## Brand Validation Rules

```typescript
// lib/design-system/validate-brand.ts

interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

interface ValidationError {
  field: string
  message: string
  value: unknown
}

interface ValidationWarning {
  field: string
  message: string
  suggestion: string
}

function validateBrandConfig(config: unknown): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []

  // Contrast ratio checks
  const contrastErrors = checkContrastRatios(config)
  errors.push(...contrastErrors)

  // Required token coverage
  const tokenErrors = checkRequiredTokens(config)
  errors.push(...tokenErrors)

  // Font availability check
  const fontWarnings = checkFontAvailability(config)
  warnings.push(...fontWarnings)

  // Asset path validation
  const assetErrors = checkAssetPaths(config)
  errors.push(...assetErrors)

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

function checkContrastRatios(config: any): ValidationError[] {
  const errors: ValidationError[] = []

  // Primary on white must be >= 4.5:1 (WCAG AA)
  const primaryContrast = getContrastRatio(config.tokens.colors.primary, '#FFFFFF')
  if (primaryContrast < 4.5) {
    errors.push({
      field: 'tokens.colors.primary',
      message: `Contrast ratio ${primaryContrast.toFixed(1)}:1 does not meet WCAG AA (4.5:1)`,
      value: config.tokens.colors.primary,
    })
  }

  // Text on background must be >= 4.5:1
  const textContrast = getContrastRatio(config.tokens.colors.text, config.tokens.colors.bg)
  if (textContrast < 4.5) {
    errors.push({
      field: 'tokens.colors.text',
      message: `Text/bg contrast ${textContrast.toFixed(1)}:1 does not meet WCAG AA (4.5:1)`,
      value: config.tokens.colors.text,
    })
  }

  return errors
}

export { validateBrandConfig }
export type { ValidationResult }
```

## Brand Config Files

### Roosevelt OPS Brand

```json
{
  "id": "roosevelt",
  "name": "Roosevelt OPS",
  "version": "1.0.0",
  "tokens": {
    "colors": {
      "primary": "#3B82F6",
      "primaryHover": "#1D4ED8",
      "primaryActive": "#1E40AF",
      "primaryLight": "#DBEAFE",
      "onPrimary": "#FFFFFF",
      "text": "#0A0F1A",
      "textSecondary": "#334155",
      "bg": "#F8FAFC",
      "bgCard": "#FFFFFF",
      "success": "#059669",
      "error": "#DC2626",
      "warning": "#D97706"
    },
    "typography": {
      "fontHeading": "'Space Grotesk', sans-serif",
      "fontBody": "'Inter', sans-serif",
      "fontSizeBase": "16px",
      "lineHeightBase": 1.5
    }
  },
  "assets": {
    "logo": "/images/roosevelt-logo.svg",
    "favicon": "/favicon.ico",
    "ogImage": "/images/og-default.png"
  },
  "meta": {
    "createdAt": "2026-02-17",
    "updatedAt": "2026-02-17",
    "createdBy": "Sam Swaab"
  }
}
```

## Version Control

Brand configurations are versioned alongside the design system:

```
lib/design-system/brands/
  ├── roosevelt.json     (current)
  ├── default.json       (fallback)
  └── _archive/
      ├── roosevelt.v0.1.0.json
      └── roosevelt.v0.2.0.json
```

Changes to brand configs follow the same PR review process as code changes.
