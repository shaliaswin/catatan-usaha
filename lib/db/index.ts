import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema'; // sesuaikan path schema Anda jika berbeda

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });