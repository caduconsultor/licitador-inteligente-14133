import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { getCompanyByUserId, upsertCompany, getUserTenders, getUserDocuments, getUserProposals, getUserProducts } from "./db";
import { InsertCompany } from "../drizzle/schema";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============================================
  // COMPANY PROCEDURES
  // ============================================
  company: router({
    getProfile: protectedProcedure.query(({ ctx }) =>
      getCompanyByUserId(ctx.user.id)
    ),
    searchCNPJ: protectedProcedure
      .input(z.object({
        cnpj: z.string(),
      }))
      .query(async ({ input }) => {
        try {
          const cleanCNPJ = input.cnpj.replace(/\D/g, "");
          const response = await fetch(
            `https://www.receitaws.com.br/v1/cnpj/${cleanCNPJ}`,
            { signal: AbortSignal.timeout(10000) }
          );

          if (!response.ok) {
            return { success: false, error: "CNPJ nao encontrado" };
          }

          const data = await response.json();
          if (data.status === "ERROR") {
            return { success: false, error: data.message || "CNPJ nao encontrado" };
          }

          return {
            success: true,
            data: {
              cnpj: data.cnpj,
              companyName: data.nome,
              legalName: data.nome_fantasia || data.nome,
              phone: data.telefone,
              email: data.email,
            },
          };
        } catch (error) {
          console.error("Erro ao buscar CNPJ:", error);
          return { success: false, error: "Erro ao buscar dados do CNPJ" };
        }
      }),
    upsert: protectedProcedure
      .input(z.object({
        cnpj: z.string(),
        companyName: z.string(),
        legalName: z.string().optional(),
        taxRegime: z.enum(["simples_nacional", "lucro_presumido", "lucro_real"]),
        taxPercentage: z.string(),
        bankingData: z.any().optional(),
        legalRepresentative: z.any().optional(),
        logoUrl: z.string().optional(),
      }))
      .mutation(({ ctx, input }) => {
        const data: InsertCompany = {
          userId: ctx.user.id,
          ...input,
        };
        return upsertCompany(data);
      }),
  }),

  // ============================================
  // DASHBOARD PROCEDURES
  // ============================================
  dashboard: router({
    getStats: protectedProcedure.query(async ({ ctx }) => {
      const tenders = await getUserTenders(ctx.user.id);
      const proposals = await getUserProposals(ctx.user.id);
      const documents = await getUserDocuments(ctx.user.id);
      const products = await getUserProducts(ctx.user.id);

      return {
        totalTenders: tenders.length,
        totalProposals: proposals.length,
        totalDocuments: documents.length,
        totalProducts: products.length,
        recentTenders: tenders.slice(0, 5),
        recentProposals: proposals.slice(0, 5),
      };
    }),
  }),

  // ============================================
  // TENDER PROCEDURES
  // ============================================
  tender: router({
    list: protectedProcedure.query(({ ctx }) =>
      getUserTenders(ctx.user.id)
    ),
  }),

  // ============================================
  // DOCUMENT PROCEDURES
  // ============================================
  document: router({
    list: protectedProcedure.query(({ ctx }) =>
      getUserDocuments(ctx.user.id)
    ),
  }),

  // ============================================
  // PROPOSAL PROCEDURES
  // ============================================
  proposal: router({
    list: protectedProcedure.query(({ ctx }) =>
      getUserProposals(ctx.user.id)
    ),
  }),

  // ============================================
  // PRODUCT PROCEDURES
  // ============================================
  product: router({
    list: protectedProcedure.query(({ ctx }) =>
      getUserProducts(ctx.user.id)
    ),
  }),
});

export type AppRouter = typeof appRouter;
