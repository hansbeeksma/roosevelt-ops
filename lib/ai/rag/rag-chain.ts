/**
 * RAG Pipeline Chain (ROOSE-45)
 *
 * Orchestrates semantic retrieval + LLM generation with Claude claude-sonnet-4-6.
 * Retrieves top-5 relevant documents, builds a grounded context window,
 * and returns the answer together with source citations.
 */

import Anthropic from '@anthropic-ai/sdk'
import { searchSimilarDocuments, type Document } from './retrieval.js'

// ── Constants ─────────────────────────────────────────────────────────────────

const CLAUDE_MODEL = 'claude-sonnet-4-6'
const TOP_K = 5
const RETRIEVAL_THRESHOLD = 0.65
const MAX_TOKENS = 2048

const DEFAULT_SYSTEM_PROMPT = `You are a knowledgeable assistant for the Roosevelt OPS platform.
Answer questions using ONLY the context documents provided below.
If the context does not contain enough information to answer confidently, say so clearly.
Always be concise, accurate, and cite which context snippets support your answer.`

// ── Types ─────────────────────────────────────────────────────────────────────

export interface RagResult {
  answer: string
  sources: Document[]
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getAnthropicClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable is required')
  }
  return new Anthropic({ apiKey })
}

function buildContextBlock(documents: Document[]): string {
  if (documents.length === 0) {
    return 'No relevant context documents were found.'
  }

  return documents
    .map(
      (doc, idx) =>
        `--- Context [${idx + 1}] (similarity: ${doc.similarity.toFixed(3)}) ---\n${doc.content}`
    )
    .join('\n\n')
}

function buildUserMessage(question: string, contextBlock: string): string {
  return `<context>\n${contextBlock}\n</context>\n\nQuestion: ${question}`
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Run a full RAG query: retrieve relevant documents, build context, and
 * generate a grounded answer with Claude claude-sonnet-4-6.
 *
 * @param question - The user's natural language question
 * @param systemPrompt - Optional override for the system instruction
 * @returns Object containing the generated answer and source documents
 */
export async function ragQuery(question: string, systemPrompt?: string): Promise<RagResult> {
  if (!question.trim()) {
    throw new Error('Question must not be empty')
  }

  // 1. Retrieve semantically relevant documents
  const sources = await searchSimilarDocuments(question, TOP_K, RETRIEVAL_THRESHOLD)

  // 2. Build grounded context
  const contextBlock = buildContextBlock(sources)
  const userMessage = buildUserMessage(question, contextBlock)

  // 3. Generate answer with Claude
  const client = getAnthropicClient()

  const response = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: MAX_TOKENS,
    system: systemPrompt ?? DEFAULT_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: userMessage,
      },
    ],
  })

  const firstContent = response.content[0]
  if (!firstContent || firstContent.type !== 'text') {
    throw new Error('Unexpected response format from Claude API')
  }

  return {
    answer: firstContent.text,
    sources,
  }
}
