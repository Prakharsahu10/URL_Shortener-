import 'dotenv/config';

import app from './app.js';
import { env } from './config/env.js';

const port = env.PORT;

app.listen(port, () => {
  console.log(`URL shortener API running on port ${port}`);
});
