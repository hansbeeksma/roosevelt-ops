/**
 * AI / RAG API Routes (ROOSE-45)
 *
 * Exposes semantic search and document ingestion endpoints backed by
 * Voyage-3 embeddings + pgvector + Claude claude-sonnet-4-6.
 *
 * Routes:
 *   POST /api/ai/query   – Answer a question using RAG (20 req/min)
 *   POST /api/ai/ingest  – Embed and store a document   (10 req/min)
 */

import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { ragQuery } from '../../../../lib/ai/rag/rag-chain.js'
import { upsertDocument } from '../../../../lib/ai/rag/retrieval.js'

// ── Request / Response types ──────────────────────────────────────────────────

interface QueryBody {
  question: string
}

interface IngestBody {
  content: string
  metadata: Record<string, unknown>
}

interface QueryResponse {
  answer: string
  sources: Array<{
    id: string
    content: string
    metadata: Record<string, unknown>
    similarity: number
  }>
}

interface IngestResponse {
  id: string
  message: string
}

// ── JSON schemas ──────────────────────────────────────────────────────────────

const queryBodySchema = {
  type: 'object',
  required: ['question'],
  additionalProperties: false,
  properties: {
    question: { type: 'string', minLength: 1, maxLength: 2000 },
  },
} as const

const ingestBodySchema = {
  type: 'object',
  required: ['content'],
  additionalProperties: false,
  properties: {
    content: { type: 'string', minLength: 1, maxLength: 50_000 },
    metadata: { type: 'object' },
  },
} as const

// ── Route handlers ────────────────────────────────────────────────────────────

async function handleQuery(
  request: FastifyRequest<{ Body: QueryBody }>,
  reply: FastifyReply
): Promise<QueryResponse> {
  const { question } = request.body

  try {
    const result = await ragQuery(question)

    return reply.status(200).send({
      answer: result.answer,
      sources: result.sources,
    })
  } catch (error) {
    request.log.error({ error, question }, 'RAG query failed')
    const message = error instanceof Error ? error.message : 'Internal server error'
    return reply.status(500).send({ error: message })
  }
}

async function handleIngest(
  request: FastifyRequest<{ Body: IngestBody }>,
  reply: FastifyReply
): Promise<IngestResponse> {
  const { content, metadata = {} } = request.body

  try {
    const id = await upsertDocument(content, metadata)

    return reply.status(201).send({
      id,
      message: 'Document ingested successfully',
    })
  } catch (error) {
    request.log.error({ error }, 'Document ingestion failed')
    const message = error instanceof Error ? error.message : 'Internal server error'
    return reply.status(500).send({ error: message })
  }
}

// ── Plugin registration ───────────────────────────────────────────────────────

export default async function aiRoutes(fastify: FastifyInstance): Promise<void> {
  /**
   * POST /api/ai/query
   *
   * Accepts a natural language question, retrieves semantically relevant
   * documents, and returns a grounded answer with source citations.
   *
   * Rate limit: 20 requests/minute per IP.
   */
  fastify.post<{ Body: QueryBody }>(
    '/query',
    {
      config: { rateLimit: { max: 20, timeWindow: '1 minute' } },
      schema: {
        body: queryBodySchema,
        response: {
          200: {
            type: 'object',
            properties: {
              answer: { type: 'string' },
              sources: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    content: { type: 'string' },
                    metadata: { type: 'object' },
                    similarity: { type: 'number' },
                  },
                },
              },
            },
          },
        },
      },
    },
    handleQuery
  )

  /**
   * POST /api/ai/ingest
   *
   * Accepts document content and optional metadata, generates a Voyage-3
   * embedding, and stores it in the pgvector `rag_documents` table.
   *
   * Rate limit: 10 requests/minute per IP.
   */
  fastify.post<{ Body: IngestBody }>(
    '/ingest',
    {
      config: { rateLimit: { max: 10, timeWindow: '1 minute' } },
      schema: {
        body: ingestBodySchema,
        response: {
          201: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    handleIngest
  )
}
