import { mysqlTable, int, varchar, text, longtext, timestamp, decimal, mysqlEnum, date, json, index } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm"

// ============================================================================
// USERS TABLE
// ============================================================================
export const users = mysqlTable("users", {
	id: int().autoincrement().primaryKey().notNull(),
	openId: varchar({ length: 64 }).notNull().unique(),
	name: text(),
	email: varchar({ length: 320 }),
	loginMethod: varchar({ length: 64 }),
	role: mysqlEnum(['user','admin']).default('user').notNull(),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
	lastSignedIn: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// ============================================================================
// COMPANIES TABLE (sem userId - associação via user_companies)
// ============================================================================
export const companies = mysqlTable("companies", {
	id: int().autoincrement().primaryKey().notNull(),
	cnpj: varchar({ length: 18 }).notNull(),
	companyName: text().notNull(),
	legalName: text(),
	taxRegime: mysqlEnum(['simples_nacional','lucro_presumido','lucro_real']).notNull(),
	taxPercentage: decimal({ precision: 5, scale: 2 }).notNull(),
	bankingData: json(),
	legalRepresentative: json(),
	logoUrl: varchar({ length: 512 }),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("companies_cnpj_idx").on(table.cnpj),
]);

// ============================================================================
// USER_COMPANIES TABLE (Associação N:N entre users e companies)
// ============================================================================
export const userCompanies = mysqlTable("user_companies", {
	id: int().autoincrement().primaryKey().notNull(),
	userId: int().notNull(),
	companyId: int().notNull(),
	role: mysqlEnum(['owner','editor','viewer']).default('owner').notNull(),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
},
(table) => [
	index("user_companies_userId_idx").on(table.userId),
	index("user_companies_companyId_idx").on(table.companyId),
]);

// ============================================================================
// TENDERS TABLE (Editais - associados a companies)
// ============================================================================
export const tenders = mysqlTable("tenders", {
	id: int().autoincrement().primaryKey().notNull(),
	companyId: int().notNull(),
	title: varchar({ length: 512 }).notNull(),
	description: longtext(),
	fileUrl: varchar({ length: 512 }).notNull(),
	fileName: varchar({ length: 255 }).notNull(),
	fileType: varchar({ length: 50 }),
	tenderObject: longtext(),
	deadlineSubmission: timestamp({ mode: 'string' }),
	deadlineOpening: timestamp({ mode: 'string' }),
	deadlineAnalysis: timestamp({ mode: 'string' }),
	habilitationRequirements: json(),
	judgmentCriteria: varchar({ length: 255 }),
	estimatedValue: decimal({ precision: 15, scale: 2 }),
	items: json(),
	analysisStatus: mysqlEnum(['pending','analyzing','completed','error']).default('pending'),
	analysisResult: longtext(),
	riskLevel: mysqlEnum(['low','medium','high']),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("tenders_companyId_idx").on(table.companyId),
]);

// ============================================================================
// DOCUMENTS TABLE (Documentos da empresa)
// ============================================================================
export const documents = mysqlTable("documents", {
	id: int().autoincrement().primaryKey().notNull(),
	companyId: int().notNull(),
	name: varchar({ length: 255 }).notNull(),
	documentType: varchar({ length: 100 }),
	fileUrl: varchar({ length: 512 }).notNull(),
	fileName: varchar({ length: 255 }).notNull(),
	expirationDate: timestamp({ mode: 'string' }),
	daysUntilExpiration: int(),
	isExpired: int().default(0),
	alertSent: int().default(0),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("documents_companyId_idx").on(table.companyId),
]);

// ============================================================================
// PRODUCTS TABLE (Produtos da empresa)
// ============================================================================
export const products = mysqlTable("products", {
	id: int().autoincrement().primaryKey().notNull(),
	companyId: int().notNull(),
	name: text().notNull(),
	brand: varchar({ length: 255 }),
	model: varchar({ length: 255 }),
	unit: varchar({ length: 50 }),
	cost: decimal({ precision: 15, scale: 2 }).notNull(),
	supplierId: int(),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("products_companyId_idx").on(table.companyId),
]);

// ============================================================================
// SUPPLIERS TABLE (Fornecedores da empresa)
// ============================================================================
export const suppliers = mysqlTable("suppliers", {
	id: int().autoincrement().primaryKey().notNull(),
	companyId: int().notNull(),
	name: text().notNull(),
	cnpj: varchar({ length: 18 }),
	phone: varchar({ length: 20 }),
	whatsapp: varchar({ length: 20 }),
	email: varchar({ length: 320 }),
	rating: decimal({ precision: 3, scale: 2 }),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("suppliers_companyId_idx").on(table.companyId),
]);

// ============================================================================
// PROPOSALS TABLE (Propostas - associadas a companies e tenders)
// ============================================================================
export const proposals = mysqlTable("proposals", {
	id: int().autoincrement().primaryKey().notNull(),
	companyId: int().notNull(),
	tenderId: int(),
	title: text().notNull(),
	proposalType: mysqlEnum(['products','services','works']).notNull(),
	processNumber: varchar({ length: 100 }),
	validityDate: timestamp({ mode: 'string' }),
	paymentDate: timestamp({ mode: 'string' }),
	city: varchar({ length: 255 }),
	deliveryDeadline: int(),
	items: json(),
	freight: decimal({ precision: 15, scale: 2 }),
	totalCost: decimal({ precision: 15, scale: 2 }),
	totalSale: decimal({ precision: 15, scale: 2 }),
	observations: longtext(),
	pdfUrl: varchar({ length: 512 }),
	status: mysqlEnum(['draft','ready','submitted','won','lost']).default('draft'),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("proposals_companyId_idx").on(table.companyId),
	index("proposals_tenderId_idx").on(table.tenderId),
]);

// ============================================================================
// DECLARATIONS TABLE (Declarações - associadas a companies e proposals)
// ============================================================================
export const declarations = mysqlTable("declarations", {
	id: int().autoincrement().primaryKey().notNull(),
	companyId: int().notNull(),
	proposalId: int(),
	title: text().notNull(),
	content: longtext().notNull(),
	isStandard: int().default(0),
	pdfUrl: varchar({ length: 512 }),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("declarations_companyId_idx").on(table.companyId),
	index("declarations_proposalId_idx").on(table.proposalId),
]);

// ============================================================================
// TYPE EXPORTS
// ============================================================================
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type Company = typeof companies.$inferSelect;
export type InsertCompany = typeof companies.$inferInsert;

export type UserCompany = typeof userCompanies.$inferSelect;
export type InsertUserCompany = typeof userCompanies.$inferInsert;

export type Tender = typeof tenders.$inferSelect;
export type InsertTender = typeof tenders.$inferInsert;

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = typeof suppliers.$inferInsert;

export type Proposal = typeof proposals.$inferSelect;
export type InsertProposal = typeof proposals.$inferInsert;

export type Declaration = typeof declarations.$inferSelect;
export type InsertDeclaration = typeof declarations.$inferInsert;
