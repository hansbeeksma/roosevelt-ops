/**
 * Figma MCP Client
 *
 * Helpers for fetching design tokens and component data from Figma.
 * Used at build time (token sync) and by tooling that reads design data
 * programmatically.
 *
 * For interactive agent usage in Claude sessions, prefer the MCP tools directly:
 *   mcp__figma__get_figma_data, mcp__figma__download_figma_images
 *
 * Target file: https://figma.com/file/D9lhL1k3Hz3RuBXPyZ4zXJ/Claude-Designs
 *
 * See: docs/integrations/mcp-ecosystem.md
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ColorToken {
  name: string
  value: string
  /** CSS custom property name, e.g. '--color-brand-500' */
  cssVar: string
}

export interface TypographyToken {
  name: string
  fontFamily: string
  fontSize: number
  fontWeight: number
  lineHeight: number | string
  letterSpacing: number
}

export interface SpacingToken {
  name: string
  value: number
  /** Pixel value */
  px: number
}

export interface DesignTokens {
  colors: ColorToken[]
  typography: TypographyToken[]
  spacing: SpacingToken[]
  /** ISO timestamp of when these tokens were fetched */
  fetchedAt: string
}

export interface ComponentVariant {
  nodeId: string
  name: string
  description: string
  properties: Record<string, string>
}

export interface ComponentData {
  nodeId: string
  name: string
  description: string
  variants: ComponentVariant[]
  /** CSS properties extracted from the component frame */
  styles: Record<string, string>
}

// ── Figma REST API types (subset) ─────────────────────────────────────────────

interface FigmaColor {
  r: number
  g: number
  b: number
  a: number
}

interface FigmaTypeStyle {
  fontFamily: string
  fontSize: number
  fontWeight: number
  lineHeightPx: number
  letterSpacing: number
}

interface FigmaNode {
  id: string
  name: string
  type: string
  description?: string
  fills?: Array<{ type: string; color?: FigmaColor }>
  style?: FigmaTypeStyle
  children?: FigmaNode[]
  componentPropertyDefinitions?: Record<string, { type: string; defaultValue: string }>
  absoluteBoundingBox?: { x: number; y: number; width: number; height: number }
}

interface FigmaFileResponse {
  document: FigmaNode
  styles: Record<string, { name: string; styleType: string; description: string }>
}

// ── Configuration ─────────────────────────────────────────────────────────────

const FIGMA_BASE_URL = 'https://api.figma.com/v1' as const

function getAccessToken(): string {
  const token = process.env.FIGMA_ACCESS_TOKEN
  if (!token) {
    throw new Error('FIGMA_ACCESS_TOKEN environment variable is required')
  }
  return token
}

// ── HTTP helper ───────────────────────────────────────────────────────────────

async function figmaRequest<T>(path: string): Promise<T> {
  const token = getAccessToken()
  const response = await fetch(`${FIGMA_BASE_URL}${path}`, {
    headers: { 'X-Figma-Token': token },
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Figma API ${response.status} ${response.statusText}: ${body}`)
  }

  return response.json() as Promise<T>
}

// ── Token extraction utilities ────────────────────────────────────────────────

function rgbaToHex(color: FigmaColor): string {
  const toHex = (n: number) =>
    Math.round(n * 255)
      .toString(16)
      .padStart(2, '0')
  const hex = `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`
  return color.a < 1 ? `${hex}${toHex(color.a)}` : hex
}

function nameToCssVar(name: string): string {
  return `--${name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')}`
}

function extractColorTokens(nodes: FigmaNode[]): ColorToken[] {
  const tokens: ColorToken[] = []

  for (const node of nodes) {
    if (node.fills?.length) {
      for (const fill of node.fills) {
        if (fill.type === 'SOLID' && fill.color) {
          tokens.push({
            name: node.name,
            value: rgbaToHex(fill.color),
            cssVar: nameToCssVar(node.name),
          })
        }
      }
    }
    if (node.children?.length) {
      tokens.push(...extractColorTokens(node.children))
    }
  }

  return tokens
}

function extractTypographyTokens(nodes: FigmaNode[]): TypographyToken[] {
  const tokens: TypographyToken[] = []

  for (const node of nodes) {
    if (node.type === 'TEXT' && node.style) {
      const { fontFamily, fontSize, fontWeight, lineHeightPx, letterSpacing } = node.style
      tokens.push({
        name: node.name,
        fontFamily,
        fontSize,
        fontWeight,
        lineHeight: lineHeightPx,
        letterSpacing,
      })
    }
    if (node.children?.length) {
      tokens.push(...extractTypographyTokens(node.children))
    }
  }

  return tokens
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Fetch all design tokens (colors, typography, spacing) from a Figma file.
 *
 * Tokens are extracted by traversing the document tree and collecting fills,
 * text styles, and spacing values from named frames.
 *
 * @param fileId - Figma file key (from the URL: figma.com/file/<fileId>/...)
 */
export async function getDesignTokens(fileId: string): Promise<DesignTokens> {
  const file = await figmaRequest<FigmaFileResponse>(`/files/${fileId}`)
  const root = file.document

  const allNodes = root.children ?? []
  const colors = extractColorTokens(allNodes)
  const typography = extractTypographyTokens(allNodes)

  // Spacing tokens are conventionally stored in a frame named "Spacing"
  const spacingFrame = allNodes.find((n) => n.name.toLowerCase() === 'spacing')
  const spacing: SpacingToken[] =
    spacingFrame?.children?.map((node, index) => {
      const px = node.absoluteBoundingBox?.height ?? (index + 1) * 4
      return {
        name: node.name,
        value: index + 1,
        px,
      }
    }) ?? []

  return {
    colors,
    typography,
    spacing,
    fetchedAt: new Date().toISOString(),
  }
}

/**
 * Fetch component data and variants for a specific node.
 *
 * Useful when implementing a component and you need to know all its variant
 * combinations and the styles applied in Figma.
 *
 * @param fileId - Figma file key
 * @param nodeId - Node ID from the Figma URL (?node-id=...)
 */
export async function getComponentData(fileId: string, nodeId: string): Promise<ComponentData> {
  const encodedNodeId = encodeURIComponent(nodeId)
  const response = await figmaRequest<{ nodes: Record<string, { document: FigmaNode }> }>(
    `/files/${fileId}/nodes?ids=${encodedNodeId}`
  )

  const nodeData = response.nodes[nodeId]
  if (!nodeData) {
    throw new Error(`Node ${nodeId} not found in file ${fileId}`)
  }

  const node = nodeData.document
  const variants: ComponentVariant[] = []

  if (node.children?.length) {
    for (const child of node.children) {
      if (child.type === 'COMPONENT') {
        // Parse variant properties from name (format: "Property=Value, Property=Value")
        const properties: Record<string, string> = {}
        const nameParts = child.name.split(',')
        for (const part of nameParts) {
          const [key, value] = part.split('=').map((s) => s.trim())
          if (key && value) properties[key] = value
        }
        variants.push({
          nodeId: child.id,
          name: child.name,
          description: child.description ?? '',
          properties,
        })
      }
    }
  }

  // Extract basic styles from the component frame
  const styles: Record<string, string> = {}
  if (node.fills?.length) {
    const solidFill = node.fills.find((f) => f.type === 'SOLID')
    if (solidFill?.color) {
      styles['background-color'] = rgbaToHex(solidFill.color)
    }
  }

  return {
    nodeId: node.id,
    name: node.name,
    description: node.description ?? '',
    variants,
    styles,
  }
}

/**
 * Check whether Figma integration is configured in the current environment.
 */
export function isFigmaConfigured(): boolean {
  return !!process.env.FIGMA_ACCESS_TOKEN
}
