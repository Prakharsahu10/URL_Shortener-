import { pool } from './pool.js';

export async function initializeDatabase(): Promise<void> {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS urls (
        id BIGSERIAL PRIMARY KEY,
        code VARCHAR(32) NOT NULL UNIQUE,
        original_url TEXT NOT NULL UNIQUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_urls_code ON urls (code)
    `);
  } catch (error) {
    if (error instanceof Error && 'code' in error && (error as { code?: string }).code === 'ECONNREFUSED') {
      console.warn('PostgreSQL is unavailable. Starting in demo mode with in-memory storage.');
      return;
    }

    throw error;
  }
}