/**
 * Example API Route with Secure Error Handling (ROOSE-96)
 *
 * Demonstrates proper error handling patterns:
 * - No stack traces in production
 * - Sanitized error messages
 * - Structured logging
 * - Fail-secure defaults
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  handleApiError,
  createValidationError,
  createAuthError,
  createNotFoundError,
} from '@/lib/error-handler'

export async function GET(request: NextRequest) {
  try {
    // Example: Validate query parameters
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      throw createValidationError('Missing required parameter: id')
    }

    // Example: Check authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      throw createAuthError('Authentication required')
    }

    // Example: Database query (simulated)
    const data = await simulateDatabaseQuery(id)

    if (!data) {
      throw createNotFoundError(`Resource with id ${id} not found`)
    }

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    // Centralized error handling
    return handleApiError(error, request)
  }
}

export async function POST(request: NextRequest) {
  try {
    // Example: Parse and validate request body
    const body = await request.json()

    if (!body.name || typeof body.name !== 'string') {
      throw createValidationError('Invalid field: name must be a string')
    }

    if (body.name.length < 3 || body.name.length > 100) {
      throw createValidationError('Invalid field: name must be between 3 and 100 characters')
    }

    // Example: Create resource (simulated)
    const resource = await simulateResourceCreation(body)

    return NextResponse.json(
      {
        success: true,
        data: resource,
      },
      { status: 201 }
    )
  } catch (error) {
    // Centralized error handling
    return handleApiError(error, request)
  }
}

// Simulated database functions
async function simulateDatabaseQuery(id: string) {
  // Simulate random errors for demonstration
  if (Math.random() < 0.1) {
    throw new Error('Database connection failed')
  }

  // Simulate not found
  if (id === 'not-found') {
    return null
  }

  return {
    id,
    name: 'Example Resource',
    createdAt: new Date().toISOString(),
  }
}

async function simulateResourceCreation(data: Record<string, unknown>) {
  return {
    id: Math.random().toString(36).substr(2, 9),
    ...data,
    createdAt: new Date().toISOString(),
  }
}
