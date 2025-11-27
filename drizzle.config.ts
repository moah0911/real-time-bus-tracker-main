import { defineConfig } from 'drizzle-kit';
import type { Config } from 'drizzle-kit';

const url = process.env.TURSO_CONNECTION_URL ?? 'file:./dev.sqlite';
const isFile = url.startsWith('file:');

const dbConfig: Config = defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: isFile ? 'sqlite' : 'turso',
  dbCredentials: {
    url,
    ...(isFile ? {} : { authToken: process.env.TURSO_AUTH_TOKEN })
  },
});

export default dbConfig;