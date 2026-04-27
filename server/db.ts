import { eq, desc, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, companies, InsertCompany, tenders, products, documents, proposals, userCompanies, InsertUserCompany } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date().toISOString();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date().toISOString();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============================================
// COMPANY QUERIES
// ============================================

export async function getCompanyById(companyId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(companies).where(eq(companies.id, companyId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getCompaniesByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  // Get all companies associated with this user via user_companies table
  const result = await db
    .select({ company: companies })
    .from(companies)
    .innerJoin(userCompanies, eq(companies.id, userCompanies.companyId))
    .where(eq(userCompanies.userId, userId));
  
  return result.map(r => r.company);
}

export async function getCompanyByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  // Get the first company associated with this user
  const result = await db
    .select({ company: companies })
    .from(companies)
    .innerJoin(userCompanies, eq(companies.id, userCompanies.companyId))
    .where(eq(userCompanies.userId, userId))
    .limit(1);
  
  return result.length > 0 ? result[0].company : undefined;
}

export async function upsertCompany(data: InsertCompany, userId?: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  try {
    // Insert or update the company
    const result = await db.insert(companies).values(data).onDuplicateKeyUpdate({
      set: {
        companyName: data.companyName,
        taxRegime: data.taxRegime,
        taxPercentage: data.taxPercentage,
        bankingData: data.bankingData,
        legalRepresentative: data.legalRepresentative,
        logoUrl: data.logoUrl,
      },
    });
    
    // If userId is provided, associate the company with the user
    if (userId) {
      const companyId = data.id || (result as any).insertId;
      if (companyId) {
        const userCompanyData: InsertUserCompany = {
          userId,
          companyId: Number(companyId),
          role: 'owner',
        };
        
        await db.insert(userCompanies).values(userCompanyData).onDuplicateKeyUpdate({
          set: { role: 'owner' },
        });
      }
    }
    
    return result;
  } catch (error) {
    console.error("[Database] Failed to upsert company:", error);
    throw error;
  }
}

// ============================================
// TENDER QUERIES
// ============================================

export async function getCompanyTenders(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(tenders).where(eq(tenders.companyId, companyId)).orderBy(desc(tenders.createdAt));
}

export async function getTenderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(tenders).where(eq(tenders.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============================================
// PRODUCT QUERIES
// ============================================

export async function getCompanyProducts(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(products).where(eq(products.companyId, companyId)).orderBy(desc(products.createdAt));
}

// ============================================
// DOCUMENT QUERIES
// ============================================

export async function getCompanyDocuments(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(documents).where(eq(documents.companyId, companyId)).orderBy(desc(documents.createdAt));
}

export async function getExpiredDocuments(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(documents).where(and(eq(documents.companyId, companyId), eq(documents.isExpired, 1)));
}

// ============================================
// PROPOSAL QUERIES
// ============================================

export async function getCompanyProposals(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(proposals).where(eq(proposals.companyId, companyId)).orderBy(desc(proposals.createdAt));
}

export async function getProposalById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(proposals).where(eq(proposals.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}
