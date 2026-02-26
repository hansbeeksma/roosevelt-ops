/**
 * Vector Similarity Retrieval via Supabase pgvector (ROOSE-45)
 *
 * Wraps the `rag_documents` table for semantic search and document lifecycle.
 * Uses cosine distance via the `match_documents` Postgres RPC function.
 */

import { createClient } from '@supabase/supabase-js'
import { generateEmbedding } from './embeddings.js'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Document {
  id: string
  content: string
  metadata: Record<string, unknown>
  similarity: number
}

interface RagDocumentRow {
  id: string
  content: string
  metadata: Record<string, unknown>
  similarity: number
}

interface UpsertRow {
  id?: string
  content: string
  metadata: Record<string, unknown>
  embedding: number[]
  updated_at: string
}

// ── Supabase client ───────────────────────────────────────────────────────────

function getSupabaseClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error('Supabase credentials missing: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  }

  return createClient(url, key)
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Search for semantically similar documents using cosine similarity.
 *
 * @param query - Natural language query string
 * @param limit - Maximum number of results to return (default: 5)
 * @param threshold - Minimum similarity score, 0–1 (default: 0.7)
 * @returns Array of matching documents ordered by descending similarity
 */
export async function searchSimilarDocuments(
  query: string,
  limit = 5,
  threshold = 0.7
): Promise<Document[]> {
  const queryEmbedding = await generateEmbedding(query)
  const supabase = getSupabaseClient()

  const { data, error } = await supabase.rpc('match_documents', {
    query_embedding: queryEmbedding,
    match_threshold: threshold,
    match_count: limit,
  })

  if (error) {
    throw new Error(`pgvector similarity search failed: ${error.message}`)
  }

  const rows = (data ?? []) as RagDocumentRow[]

  return rows.map((row) => ({
    id: row.id,
    content: row.content,
    metadata: row.metadata ?? {},
    similarity: row.similarity,
  }))
}

/**
 * Embed and store (or update) a document in the vector store.
 *
 * Uses upsert semantics: if a document with matching content already exists
 * (matched by content equality in the calling layer), it is replaced.
 * Returns the UUID of the created/updated row.
 *
 * @param content - Document text content to embed and store
 * @param metadata - Arbitrary key-value metadata to attach to the document
 * @returns UUID of the upserted document
 */
export async function upsertDocument(
  content: string,
  metadata: Record<string, unknown>
): Promise<string> {
  if (!content.trim()) {
    throw new Error('Cannot upsert document with empty content')
  }

  const embedding = await generateEmbedding(content)
  const supabase = getSupabaseClient()

  const row: UpsertRow = {
    content,
    metadata,
    embedding,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase.from('rag_documents').insert(row).select('id').single()

  if (error) {
    throw new Error(`Failed to upsert document: ${error.message}`)
  }

  return data.id as string
}

/**
 * Permanently delete a document from the vector store by its UUID.
 *
 * @param id - UUID of the document to delete
 */
export async function deleteDocument(id: string): Promise<void> {
  const supabase = getSupabaseClient()

  const { error } = await supabase.from('rag_documents').delete().eq('id', id)

  if (error) {
    throw new Error(`Failed to delete document ${id}: ${error.message}`)
  }
}
