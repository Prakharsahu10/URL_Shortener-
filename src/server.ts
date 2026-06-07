import 'dotenv/config'

import app from './app.js'
import { env } from './config/env.js'
import { initializeDatabase } from './db/init.js'
import { enableInMemoryStore } from './repositories/urlRepository.js'

const port = env.PORT

async function main(): Promise<void> {
  try {
    await initializeDatabase()
  } catch (error) {
    enableInMemoryStore()
    console.warn('Database initialization failed. Continuing in demo mode.')
    console.warn(error)
  }

  app.listen(port, () => {
    console.log(`URL shortener API running on port ${port}`)
  })
}

main().catch((error) => {
  console.error('Failed to start server:', error)
  process.exitCode = 1
})
