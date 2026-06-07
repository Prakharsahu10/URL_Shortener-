import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import test from 'node:test'

import app from '../src/app.js'
import { enableInMemoryStore } from '../src/repositories/urlRepository.js'
import { resolveShortCode, shortenUrl } from '../src/services/urlService.js'

test('shortens and resolves a URL through the service layer', async () => {
  enableInMemoryStore()

  const originalUrl = `https://example.com/${randomUUID()}`
  const shortened = await shortenUrl(originalUrl)

  assert.match(shortened.code, /^[A-Za-z0-9]{7}$/)
  assert.equal(await resolveShortCode(shortened.code), originalUrl)
})

test('POST /api/urls creates a short URL and GET /:code redirects', async () => {
  enableInMemoryStore()

  const server = app.listen(0)

  try {
    const address = server.address()

    if (!address || typeof address === 'string') {
      throw new Error('Expected the test server to listen on an ephemeral port')
    }

    const baseUrl = `http://127.0.0.1:${address.port}`
    const originalUrl = `https://example.com/${randomUUID()}`

    const response = await fetch(`${baseUrl}/api/urls`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ originalUrl })
    })

    assert.equal(response.status, 201)

    const payload = (await response.json()) as {
      originalUrl: string
      shortUrl: string
      code: string
    }

    assert.equal(payload.originalUrl, originalUrl)
    assert.match(payload.code, /^[A-Za-z0-9]{7}$/)
    assert.match(payload.shortUrl, /https?:\/\/localhost:3000\/[A-Za-z0-9]{7}$/)

    const redirect = await fetch(`${baseUrl}/${payload.code}`, {
      redirect: 'manual'
    })

    assert.equal(redirect.status, 302)
    assert.equal(redirect.headers.get('location'), originalUrl)
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()))
  }
})
