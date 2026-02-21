import 'dotenv/config';
import { drizzle } from 'drizzle-orm/nodepostgres';

export const db = drizzle(process.env.DATABASE_URL);
export default db;

