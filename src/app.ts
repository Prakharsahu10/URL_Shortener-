import express from 'express'
import { ZodError } from 'zod'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { urlRouter } from './routes/urlRoutes.js'

const app = express()
const publicDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public')

app.use(express.json())
app.use(express.static(publicDir))

app.get('/', (_req, res) => {
  res.sendFile(join(publicDir, 'index.html'))
})

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/', urlRouter)

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' })
})

app.use(
  (
    error: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    if (error instanceof ZodError) {
      res.status(400).json({
        error: 'Invalid request body',
        details: error.flatten()
      })
      return
    }

    res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error'
    })
  }
)

export default app
