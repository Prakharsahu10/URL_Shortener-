import { z } from 'zod'

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1),
  BASE_URL: z.string().url().default('http://localhost:3000')
})

export const env = envSchema.parse(process.env)
