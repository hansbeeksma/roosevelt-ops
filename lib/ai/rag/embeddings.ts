/**
 * Voyage-3 Embedding Generation (ROOSE-45)
 *
 * Generates dense vector embeddings via Voyage AI REST API.
 * Model: voyage-3 — 1024-dimensional output.
 *
 * Chunking strategy: semantic sentence-boundary splitting to preserve
 * meaning across chunk boundaries.
 */

const VOYAGE_API_URL = 'https://api.voyageai.com/v1/embeddings'
const VOYAGE_MODEL = 'voyage-3'
const EMBEDDING_DIM = 1024
const BATCH_MAX = 128

// ── Types ─────────────────────────────────────────────────────────────────────

interface VoyageEmbeddingRequest {
  input: string | string[]
  model: string
}

interface VoyageEmbeddingResponse {
  object: string
  data: Array<{
    object: string
    embedding: number[]
    index: number
  }>
  model: string
  usage: {
    total_tokens: number
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getApiKey(): string {
  const key = process.env.VOYAGE_API_KEY
  if (!key) {
    throw new Error('VOYAGE_API_KEY environment variable is required')
  }
  return key
}

async function callVoyageApi(texts: string[]): Promise<number[][]> {
  const apiKey = getApiKey()

  const body: VoyageEmbeddingRequest = {
    input: texts.length === 1 ? texts[0] : texts,
    model: VOYAGE_MODEL,
  }

  const response = await fetch(VOYAGE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Voyage API error ${response.status}: ${errorText}`)
  }

  const data = (await response.json()) as VoyageEmbeddingResponse

  // Sort by index to ensure correct ordering
  const sorted = [...data.data].sort((a, b) => a.index - b.index)
  return sorted.map((item) => item.embedding)
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Generate a single 1024-dimensional embedding vector for the given text.
 *
 * @param text - Input text to embed
 * @returns Float array of length 1024
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!text.trim()) {
    throw new Error('Cannot generate embedding for empty text')
  }

  const results = await callVoyageApi([text])
  const embedding = results[0]

  if (!embedding || embedding.length !== EMBEDDING_DIM) {
    throw new Error(
      `Unexpected embedding dimension: expected ${EMBEDDING_DIM}, got ${embedding?.length ?? 0}`
    )
  }

  return embedding
}

/**
 * Generate embeddings for multiple texts in batches of up to 128.
 *
 * @param texts - Array of input texts
 * @returns Array of embedding vectors, one per input text
 */
export async function generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return []

  const validTexts = texts.map((t, i) => {
    if (!t.trim()) throw new Error(`Text at index ${i} is empty`)
    return t
  })

  const results: number[][] = []

  for (let offset = 0; offset < validTexts.length; offset += BATCH_MAX) {
    const batch = validTexts.slice(offset, offset + BATCH_MAX)
    const batchResults = await callVoyageApi(batch)
    results.push(...batchResults)
  }

  return results
}

/**
 * Split text into semantically coherent chunks at sentence boundaries.
 *
 * Uses a simple approximation: ~4 characters per token. Splits on sentence
 * terminators (.!?) followed by whitespace, then trims and filters empties.
 *
 * @param text - Source text to chunk
 * @param maxTokens - Approximate maximum tokens per chunk (default: 512)
 * @returns Array of non-empty text chunks
 */
export function chunkText(text: string, maxTokens = 512): string[] {
  if (!text.trim()) return []

  const maxChars = maxTokens * 4

  // Split on sentence boundaries: period/exclamation/question followed by space or end
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)

  const chunks: string[] = []
  let current = ''

  for (const sentence of sentences) {
    // If adding this sentence would exceed the limit, flush current buffer
    if (current.length > 0 && current.length + 1 + sentence.length > maxChars) {
      chunks.push(current.trim())
      current = sentence
    } else {
      current = current.length > 0 ? `${current} ${sentence}` : sentence
    }

    // Handle oversized single sentences by splitting on clause boundaries
    if (current.length > maxChars) {
      const clauses = current.split(/(?<=[,;:])\s+/)
      current = ''
      for (const clause of clauses) {
        if (current.length > 0 && current.length + 1 + clause.length > maxChars) {
          chunks.push(current.trim())
          current = clause
        } else {
          current = current.length > 0 ? `${current} ${clause}` : clause
        }
      }
    }
  }

  if (current.trim().length > 0) {
    chunks.push(current.trim())
  }

  return chunks.filter((c) => c.length > 0)
}
