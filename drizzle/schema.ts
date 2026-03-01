import { decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, date, longtext, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ============================================
// COMPANY & PROFILE TABLES
// ============================================

export const companies = mysqlTable("companies", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  cnpj: varchar("cnpj", { length: 18 }).notNull().unique(),
  companyName: text("companyName").notNull(),
  legalName: text("legalName"),
  taxRegime: mysqlEnum("taxRegime", ["simples_nacional", "lucro_presumido", "lucro_real"]).notNull(),
  taxPercentage: decimal("taxPercentage", { precision: 5, scale: 2 }).notNull(),
  bankingData: json("bankingData"), // { bank, agency, account, accountType }
  legalRepresentative: json("legalRepresentative"), // { name, cpf, position }
  logoUrl: varchar("logoUrl", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Company = typeof companies.$inferSelect;
export type InsertCompany = typeof companies.$inferInsert;

// ============================================
// TENDERS (EDITAIS)
// ============================================

export const tenders = mysqlTable("tenders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: text("title").notNull(),
  description: longtext("description"),
  fileUrl: varchar("fileUrl", { length: 512 }).notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileType: varchar("fileType", { length: 50 }), // pdf, docx, etc
  tenderObject: longtext("tenderObject"), // Objeto da licitação
  deadlineSubmission: timestamp("deadlineSubmission"),
  deadlineOpening: timestamp("deadlineOpening"),
  deadlineAnalysis: timestamp("deadlineAnalysis"),
  habilitationRequirements: json("habilitationRequirements"), // { juridical, technical, fiscal, economic }
  judgmentCriteria: varchar("judgmentCriteria", { length: 255 }), // menor_preco, melhor_tecnica, etc
  estimatedValue: decimal("estimatedValue", { precision: 15, scale: 2 }),
  items: json("items"), // Array of items/lots
  analysisStatus: mysqlEnum("analysisStatus", ["pending", "analyzing", "completed", "error"]).default("pending"),
  analysisResult: longtext("analysisResult"), // JSON with extracted info
  riskLevel: mysqlEnum("riskLevel", ["low", "medium", "high"]),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Tender = typeof tenders.$inferSelect;
export type InsertTender = typeof tenders.$inferInsert;

// ============================================
// PRODUCTS & SUPPLIERS
// ============================================

export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: text("name").notNull(),
  brand: varchar("brand", { length: 255 }),
  model: varchar("model", { length: 255 }),
  unit: varchar("unit", { length: 50 }), // un, kg, m, etc
  cost: decimal("cost", { precision: 15, scale: 2 }).notNull(),
  supplierId: int("supplierId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

export const suppliers = mysqlTable("suppliers", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: text("name").notNull(),
  cnpj: varchar("cnpj", { length: 18 }),
  phone: varchar("phone", { length: 20 }),
  whatsapp: varchar("whatsapp", { length: 20 }),
  email: varchar("email", { length: 320 }),
  rating: decimal("rating", { precision: 3, scale: 2 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = typeof suppliers.$inferInsert;

// ============================================
// PROPOSALS
// ============================================

export const proposals = mysqlTable("proposals", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  tenderId: int("tenderId"),
  title: text("title").notNull(),
  proposalType: mysqlEnum("proposalType", ["products", "services", "works"]).notNull(),
  processNumber: varchar("processNumber", { length: 100 }),
  validityDate: date("validityDate"),
  paymentDate: date("paymentDate"),
  city: varchar("city", { length: 255 }),
  deliveryDeadline: int("deliveryDeadline"), // days
  items: json("items"), // Array of proposal items
  freight: decimal("freight", { precision: 15, scale: 2 }),
  totalCost: decimal("totalCost", { precision: 15, scale: 2 }),
  totalSale: decimal("totalSale", { precision: 15, scale: 2 }),
  observations: longtext("observations"),
  pdfUrl: varchar("pdfUrl", { length: 512 }),
  status: mysqlEnum("status", ["draft", "ready", "submitted", "won", "lost"]).default("draft"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Proposal = typeof proposals.$inferSelect;
export type InsertProposal = typeof proposals.$inferInsert;

// ============================================
// DOCUMENTS
// ============================================

export const documents = mysqlTable("documents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  documentType: varchar("documentType", { length: 100 }), // cnpj, certidao, atestado, etc
  fileUrl: varchar("fileUrl", { length: 512 }).notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  expirationDate: date("expirationDate"),
  daysUntilExpiration: int("daysUntilExpiration"),
  isExpired: boolean("isExpired").default(false),
  alertSent: boolean("alertSent").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;

// ============================================
// DECLARATIONS
// ============================================

export const declarations = mysqlTable("declarations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  proposalId: int("proposalId"),
  title: text("title").notNull(),
  content: longtext("content").notNull(),
  isStandard: boolean("isStandard").default(false),
  pdfUrl: varchar("pdfUrl", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Declaration = typeof declarations.$inferSelect;
export type InsertDeclaration = typeof declarations.$inferInsert;