import { createDatabase } from './config';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  // throw new Error('DATABASE_URL is not set');
  console.log('DATABASE_URL is not set');
}

export const db = createDatabase({
  connectionString: connectionString || '',
});

export const isDatabaseEnabled = !!connectionString;