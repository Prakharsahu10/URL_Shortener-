import { pool } from '../db/pool.js'

export type UrlRecord = {
  code: string
  originalUrl: string
  createdAt: string
}

const inMemoryUrls = new Map<string, UrlRecord>()
let useInMemoryStore = false

function isConnectionError(error: unknown): boolean {
  return (
    error instanceof Error &&
    'code' in error &&
    typeof (error as { code?: string }).code === 'string' &&
    ['ECONNREFUSED', 'ENETUNREACH', 'EHOSTUNREACH', 'ETIMEDOUT'].includes(
      (error as { code?: string }).code ?? ''
    )
  )
}

function saveToMemory(code: string, originalUrl: string): UrlRecord {
  const record = {
    code,
    originalUrl,
    createdAt: new Date().toISOString()
  }

  inMemoryUrls.set(code, record)

  return record
}

export async function findUrlByCode(code: string): Promise<UrlRecord | null> {
  if (useInMemoryStore) {
    return inMemoryUrls.get(code) ?? null
  }

  try {
    const result = await pool.query<{
      code: string
      original_url: string
      created_at: string
    }>(
      'SELECT code, original_url, created_at FROM urls WHERE code = $1 LIMIT 1',
      [code]
    )

    const row = result.rows[0]

    if (!row) {
      return null
    }

    return {
      code: row.code,
      originalUrl: row.original_url,
      createdAt: row.created_at
    }
  } catch (error) {
    if (!isConnectionError(error)) {
      throw error
    }

    useInMemoryStore = true
    return inMemoryUrls.get(code) ?? null
  }
}

export async function findUrlByOriginalUrl(
  originalUrl: string
): Promise<UrlRecord | null> {
  if (useInMemoryStore) {
    for (const record of inMemoryUrls.values()) {
      if (record.originalUrl === originalUrl) {
        return record
      }
    }

    return null
  }

  try {
    const result = await pool.query<{
      code: string
      original_url: string
      created_at: string
    }>(
      'SELECT code, original_url, created_at FROM urls WHERE original_url = $1 LIMIT 1',
      [originalUrl]
    )

    const row = result.rows[0]

    if (!row) {
      return null
    }

    return {
      code: row.code,
      originalUrl: row.original_url,
      createdAt: row.created_at
    }
  } catch (error) {
    if (!isConnectionError(error)) {
      throw error
    }

    useInMemoryStore = true

    for (const record of inMemoryUrls.values()) {
      if (record.originalUrl === originalUrl) {
        return record
      }
    }

    return null
  }
}

export async function createUrl(
  code: string,
  originalUrl: string
): Promise<UrlRecord> {
  if (useInMemoryStore) {
    return saveToMemory(code, originalUrl)
  }

  try {
    const result = await pool.query<{
      code: string
      original_url: string
      created_at: string
    }>(
      'INSERT INTO urls (code, original_url) VALUES ($1, $2) RETURNING code, original_url, created_at',
      [code, originalUrl]
    )

    const row = result.rows[0]

    return {
      code: row.code,
      originalUrl: row.original_url,
      createdAt: row.created_at
    }
  } catch (error) {
    if (!isConnectionError(error)) {
      throw error
    }

    useInMemoryStore = true
    return saveToMemory(code, originalUrl)
  }
}

export function enableInMemoryStore(): void {
  useInMemoryStore = true
}

export function markDatabaseUnavailable(error: unknown): void {
  if (isConnectionError(error)) {
    useInMemoryStore = true
  }
}
