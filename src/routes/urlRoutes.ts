import { Router } from 'express'
import { z } from 'zod'

import { shortenUrl, resolveShortCode } from '../services/urlService.js'

export const urlRouter = Router()

const createUrlSchema = z.object({
  originalUrl: z.string().url()
})

urlRouter.post('/api/urls', async (req, res, next) => {
  try {
    const parsedBody = createUrlSchema.parse(req.body)
    const shortened = await shortenUrl(parsedBody.originalUrl)

    res.status(201).json({
      originalUrl: parsedBody.originalUrl,
      shortUrl: shortened.shortUrl,
      code: shortened.code
    })
  } catch (error) {
    next(error)
  }
})

urlRouter.get('/:code', async (req, res, next) => {
  try {
    const originalUrl = await resolveShortCode(req.params.code)

    if (!originalUrl) {
      res.status(404).json({ error: 'Short URL not found' })
      return
    }

    res.redirect(302, originalUrl)
  } catch (error) {
    next(error)
  }
})
