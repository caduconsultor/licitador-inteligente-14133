// drizzle/schema.ts

import { schema } from 'drizzle-orm';

export const dbSchema = schema({
  users: {
      // Table definition for users
      id: { type: 'integer', primaryKey: true },
      username: { type: 'string', unique: true, notNull: true },
      password: { type: 'string', notNull: true },
      email: { type: 'string', unique: true, notNull: true },
      createdAt: { type: 'timestamp', default: 'now()' },
  },
  companies: {
      // Table definition for companies
      id: { type: 'integer', primaryKey: true },
      name: { type: 'string', unique: true, notNull: true },
      address: { type: 'string' },
      contactEmail: { type: 'string' },
      createdAt: { type: 'timestamp', default: 'now()' },
  },
  tenders: {
      // Table definition for tenders
      id: { type: 'integer', primaryKey: true },
      title: { type: 'string', notNull: true },
      companyId: { type: 'integer', references: 'companies.id' },
      createdAt: { type: 'timestamp', default: 'now()' },
  },
  products: {
      // Table definition for products
      id: { type: 'integer', primaryKey: true },
      name: { type: 'string', notNull: true },
      tenderId: { type: 'integer', references: 'tenders.id' },
      price: { type: 'decimal', notNull: true },
      createdAt: { type: 'timestamp', default: 'now()' },
  },
  documents: {
      // Table definition for documents
      id: { type: 'integer', primaryKey: true },
      title: { type: 'string', notNull: true },
      filePath: { type: 'string', notNull: true },
      tenderId: { type: 'integer', references: 'tenders.id' },
      createdAt: { type: 'timestamp', default: 'now()' },
  },
  proposals: {
      // Table definition for proposals
      id: { type: 'integer', primaryKey: true },
      productId: { type: 'integer', references: 'products.id' },
      userId: { type: 'integer', references: 'users.id' },
      amount: { type: 'decimal', notNull: true },
      status: { type: 'string', notNull: true },
      createdAt: { type: 'timestamp', default: 'now()' },
  }
});
