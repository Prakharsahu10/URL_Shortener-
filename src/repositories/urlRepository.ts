import { pool } from '../db/pool.js';

export type UrlRecord = {
  code: string;
  originalUrl: string;
  createdAt: string;
};

export async function findUrlByCode(code: string): Promise<UrlRecord | null> {
  const result = await pool.query<{
    code: string;
    original_url: string;
    created_at: string;
  }>('SELECT code, original_url, created_at FROM urls WHERE code = $1 LIMIT 1', [code]);

  const row = result.rows[0];

  if (!row) {
    return null;
  }

  return {
    code: row.code,
    originalUrl: row.original_url,
    createdAt: row.created_at
  };
}

export async function findUrlByOriginalUrl(originalUrl: string): Promise<UrlRecord | null> {
  const result = await pool.query<{
    code: string;
    original_url: string;
    created_at: string;
  }>('SELECT code, original_url, created_at FROM urls WHERE original_url = $1 LIMIT 1', [originalUrl]);

  const row = result.rows[0];

  if (!row) {
    return null;
  }

  return {
    code: row.code,
    originalUrl: row.original_url,
    createdAt: row.created_at
  };
}

export async function createUrl(code: string, originalUrl: string): Promise<UrlRecord> {
  const result = await pool.query<{
    code: string;
    original_url: string;
    created_at: string;
  }>(
    'INSERT INTO urls (code, original_url) VALUES ($1, $2) RETURNING code, original_url, created_at',
    [code, originalUrl]
  );

  const row = result.rows[0];

  return {
    code: row.code,
    originalUrl: row.original_url,
    createdAt: row.created_at
  };
}