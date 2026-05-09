import { pgTable, uuid, varchar, text, timestamp, inet } from 'drizzle-orm/pg-core';
import { urlsTable } from './url.model.js';

export const clickEventsTable = pgTable('click_events', {
  id: uuid().primaryKey().defaultRandom(),
  urlId: uuid('url_id').references(() => urlsTable.id, { onDelete: 'cascade' }).notNull(),
  ipAddress: varchar('ip_address', { length: 45 }),
  country: varchar({ length: 100 }),
  city: varchar({ length: 100 }),
  device: varchar({ length: 50 }),
  browser: varchar({ length: 50 }),
  os: varchar({ length: 50 }),
  userAgent: text('user_agent'),
  referer: text(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
