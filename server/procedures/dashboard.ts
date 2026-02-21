import { z } from "zod";
import { protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { tenders, documents, proposals } from "../../drizzle/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";

export const dashboardRouter = {
  getStatistics: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    // Estatísticas de editais
    const tenderStats = await db
      .select({
        total: sql<number>`COUNT(*)`,
        riskLow: sql<number>`SUM(CASE WHEN riskLevel = 'low' THEN 1 ELSE 0 END)`,
        riskMedium: sql<number>`SUM(CASE WHEN riskLevel = 'medium' THEN 1 ELSE 0 END)`,
        riskHigh: sql<number>`SUM(CASE WHEN riskLevel = 'high' THEN 1 ELSE 0 END)`,
      })
      .from(tenders)
      .where(eq(tenders.userId, ctx.user.id));

    // Editais com prazos críticos (próximos 7 dias)
    const now = new Date();
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const criticalTenders = await db
      .select({
        id: tenders.id,
        title: tenders.title,
        deadlineSubmission: tenders.deadlineSubmission,
        riskLevel: tenders.riskLevel,
      })
      .from(tenders)
      .where(
        and(
          eq(tenders.userId, ctx.user.id),
          gte(tenders.deadlineSubmission, now),
          lte(tenders.deadlineSubmission, sevenDaysLater)
        )
      )
      .orderBy(tenders.deadlineSubmission);

    // Documentos vencidos ou próximos de vencer
    const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const expiringDocuments = await db
      .select({
        id: documents.id,
        documentType: documents.documentType,
        expirationDate: documents.expirationDate,
      })
      .from(documents)
      .where(
        and(
          eq(documents.userId, ctx.user.id),
          gte(documents.expirationDate, now),
          lte(documents.expirationDate, thirtyDaysLater)
        )
      )
      .orderBy(documents.expirationDate);

    // Propostas geradas (últimos 30 dias)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const recentProposals = await db
      .select({
        id: proposals.id,
        title: proposals.title,
        createdAt: proposals.createdAt,
        totalSale: proposals.totalSale,
      })
      .from(proposals)
      .where(
        and(
          eq(proposals.userId, ctx.user.id),
          gte(proposals.createdAt, thirtyDaysAgo)
        )
      )
      .orderBy(proposals.createdAt)
      .limit(5);

    // Estatísticas de propostas
    const proposalStats = await db
      .select({
        total: sql<number>`COUNT(*)`,
        totalValue: sql<number>`SUM(totalSale)`,
      })
      .from(proposals)
      .where(eq(proposals.userId, ctx.user.id));

    return {
      tenders: {
        total: tenderStats[0]?.total || 0,
        riskLow: tenderStats[0]?.riskLow || 0,
        riskMedium: tenderStats[0]?.riskMedium || 0,
        riskHigh: tenderStats[0]?.riskHigh || 0,
        critical: criticalTenders.length,
      },
      documents: {
        expiring: expiringDocuments.length,
      },
      proposals: {
        total: proposalStats[0]?.total || 0,
        totalValue: proposalStats[0]?.totalValue || 0,
        recent: recentProposals,
      },
      alerts: {
        criticalTenders,
        expiringDocuments,
      },
    };
  }),

  getTendersTimeline: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    const lastSixMonths = new Date();
    lastSixMonths.setMonth(lastSixMonths.getMonth() - 6);

    const timeline = await db
      .select({
        month: sql<string>`DATE_FORMAT(createdAt, '%Y-%m')`,
        count: sql<number>`COUNT(*)`,
      })
      .from(tenders)
      .where(
        and(
          eq(tenders.userId, ctx.user.id),
          gte(tenders.createdAt, lastSixMonths)
        )
      )
      .groupBy(sql`DATE_FORMAT(createdAt, '%Y-%m')`)
      .orderBy(sql`DATE_FORMAT(createdAt, '%Y-%m')`);

    return timeline || [];
  }),
};
