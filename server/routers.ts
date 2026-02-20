import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { getCompanyByUserId, upsertCompany } from "./db";
import { InsertCompany } from "../drizzle/schema";
import { tendersRouter } from "./procedures/tenders";
import { documentsRouter } from "./procedures/documents";
import { pricingRouter } from "./procedures/pricing";

export const appRouter = router({
  system: systemRouter,
  tenders: tendersRouter,
  documents: documentsRouter,
  pricing: router(pricingRouter),
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

  company: router({
    getProfile: protectedProcedure.query(async ({ ctx }) => {
      return await getCompanyByUserId(ctx.user.id);
    }),

    searchCNPJ: publicProcedure
      .input(z.object({ cnpj: z.string() }))
      .query(async ({ input }) => {
        try {
          const cnpjClean = input.cnpj.replace(/\D/g, "");
          const response = await fetch(
            `https://receitaws.com.br/v1/cnpj/${cnpjClean}`
          );
          if (!response.ok) return { success: false, data: undefined };
          const data = await response.json();
          return {
            success: true,
            data: {
              name: data.nome,
              legalName: data.nome_fantasia,
              cnpj: data.cnpj,
              address: data.logradouro,
              number: data.numero,
              complement: data.complemento,
              neighborhood: data.bairro,
              city: data.municipio,
              state: data.uf,
              zipCode: data.cep,
              status: data.situacao,
            },
          };
        } catch (error) {
          console.error("Erro ao buscar CNPJ:", error);
          return { success: false, data: undefined };
        }
      }),

    upsert: protectedProcedure
      .input(
        z.object({
          cnpj: z.string(),
          companyName: z.string(),
          legalName: z.string().optional(),
          taxRegime: z.enum(["simples_nacional", "lucro_presumido", "lucro_real"]),
          taxPercentage: z.number().min(0).max(100),
          bankName: z.string().optional(),
          accountNumber: z.string().optional(),
          accountType: z.enum(["corrente", "poupanca"]).optional(),
          representativeName: z.string().optional(),
          representativeEmail: z.string().email().optional(),
          representativePhone: z.string().optional(),
          logoUrl: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const company: InsertCompany = {
          userId: ctx.user.id,
          cnpj: input.cnpj,
          companyName: input.companyName,
          legalName: input.legalName,
          taxRegime: input.taxRegime,
          taxPercentage: input.taxPercentage as any,
          bankingData: input.bankName ? {
            bank: input.bankName,
            account: input.accountNumber,
            accountType: input.accountType,
          } : undefined,
          legalRepresentative: input.representativeName ? {
            name: input.representativeName,
            email: input.representativeEmail,
            phone: input.representativePhone,
          } : undefined,
          logoUrl: input.logoUrl,
        };

        await upsertCompany(company);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
