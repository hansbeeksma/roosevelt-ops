# API Documentation Automation

> Auto-generated component API docs from TypeScript types

## Documentation Generation Pipeline

```
TypeScript Types ──> React Docgen ──> JSON Schema ──> Storybook ArgTypes
                                                   ──> Markdown Docs
                                                   ──> Version Switcher
```

## React Docgen Integration

### Configuration

```typescript
// .storybook/main.ts
import type { StorybookConfig } from '@storybook/nextjs'

const config: StorybookConfig = {
  typescript: {
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      shouldRemoveUndefinedFromOptional: true,
      propFilter: (prop) => {
        // Exclude HTML element props unless explicitly extended
        if (prop.parent) {
          return !prop.parent.fileName.includes('node_modules')
        }
        return true
      },
    },
  },
}

export default config
```

### Component Documentation Pattern

```typescript
// components/ui/Button.tsx

export interface ButtonProps {
  /** The visual style of the button */
  variant?: 'primary' | 'secondary' | 'ghost'
  /** The size of the button */
  size?: 'sm' | 'md' | 'lg'
  /** Whether the button is disabled */
  disabled?: boolean
  /** Whether the button is in a loading state */
  loading?: boolean
  /** Click handler */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
  /** Button content */
  children: React.ReactNode
}

/**
 * Primary UI component for user interaction.
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="md">Click me</Button>
 * ```
 *
 * @see [Design Specs](https://figma.com/file/...)
 * @since 1.0.0
 */
export function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  children,
}: ButtonProps) {
  // Implementation
}
```

### Generated Prop Table

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'ghost'` | `'primary'` | No | The visual style of the button |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | No | The size of the button |
| `disabled` | `boolean` | `false` | No | Whether the button is disabled |
| `loading` | `boolean` | `false` | No | Whether the button is in a loading state |
| `onClick` | `(event: MouseEvent) => void` | - | No | Click handler |
| `children` | `ReactNode` | - | Yes | Button content |

## Usage Examples Automation

### Storybook Stories as Documentation

```typescript
// components/ui/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './Button'

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost'],
      table: {
        category: 'Appearance',
      },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      table: {
        category: 'Appearance',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof Button>

/** Default primary button */
export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
}

/** Secondary button for less prominent actions */
export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
}

/** Ghost button for minimal visual weight */
export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost Button',
  },
}

/** All sizes comparison */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
}
```

## Markdown Documentation Generation

```typescript
// scripts/design-ops/generate-api-docs.ts

interface ComponentDoc {
  name: string
  description: string
  since: string
  props: Array<{
    name: string
    type: string
    defaultValue?: string
    required: boolean
    description: string
  }>
  examples: string[]
}

function generateMarkdown(doc: ComponentDoc): string {
  const lines: string[] = [
    `# ${doc.name}`,
    '',
    doc.description,
    '',
    `> Available since v${doc.since}`,
    '',
    '## Props',
    '',
    '| Prop | Type | Default | Required | Description |',
    '|------|------|---------|----------|-------------|',
  ]

  for (const prop of doc.props) {
    lines.push(
      `| \`${prop.name}\` | \`${prop.type}\` | ${prop.defaultValue ? `\`${prop.defaultValue}\`` : '-'} | ${prop.required ? 'Yes' : 'No'} | ${prop.description} |`
    )
  }

  if (doc.examples.length > 0) {
    lines.push('', '## Examples', '')
    for (const example of doc.examples) {
      lines.push('```tsx', example, '```', '')
    }
  }

  return lines.join('\n')
}
```

## Version Switcher

Documentation site includes a version switcher to view docs for any published version:

```typescript
// Versioned docs structure
// docs/api/v1/Button.md
// docs/api/v2/Button.md
// docs/api/latest/Button.md  (symlink to current)

interface VersionedDocs {
  versions: string[]          // ['1.0.0', '1.1.0', '2.0.0']
  current: string             // '2.0.0'
  lts: string[]               // ['1.1.0']
  components: Record<string, {
    availableSince: string
    deprecatedSince?: string
    removedSince?: string
  }>
}
```
