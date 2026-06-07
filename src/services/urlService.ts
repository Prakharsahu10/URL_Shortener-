import { randomBytes } from 'node:crypto';

import { env } from '../config/env.js';
import { createUrl, findUrlByCode, findUrlByOriginalUrl } from '../repositories/urlRepository.js';

function generateCode(length = 7): string {
  return randomBytes(length)
    .toString('base64url')
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, length);
}

export async function shortenUrl(originalUrl: string): Promise<{ code: string; shortUrl: string }> {
  const existingUrl = await findUrlByOriginalUrl(originalUrl);

  if (existingUrl) {
    return {
      code: existingUrl.code,
      shortUrl: `${env.BASE_URL.replace(/\/$/, '')}/${existingUrl.code}`
    };
  }

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = generateCode();

    try {
      await createUrl(code, originalUrl);

      return {
        code,
        shortUrl: `${env.BASE_URL.replace(/\/$/, '')}/${code}`
      };
    } catch (error) {
      if (attempt === 4) {
        throw error;
      }
    }
  }

  throw new Error('Unable to create short URL');
}

export async function resolveShortCode(code: string): Promise<string | null> {
  const url = await findUrlByCode(code);

  return url?.originalUrl ?? null;
}