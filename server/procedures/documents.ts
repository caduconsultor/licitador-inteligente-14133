import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { storagePut } from "../storage";
import { getDb } from "../db";
import { documents } from "../../drizzle/schema";
import { eq, and, lte } from "drizzle-orm";

export const documentsRouter = router({
  uploadDocument: protectedProcedure
    .input(z.object({
      fileName: z.string(),
      fileContent: z.string(),
      mimeType: z.string(),
      documentType: z.string(),
      expirationDate: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const fileKey = `documents/${ctx.user.id}/${Date.now()}-${input.fileName}`;
        const contentBuffer = Buffer.from(input.fileContent, "base64");
        const { url: fileUrl } = await storagePut(fileKey, contentBuffer, input.mimeType);

        const database = await getDb();
        if (!database) return { success: false, error: "Database indisponivel" };

        const expirationDate = input.expirationDate
          ? new Date(input.expirationDate)
          : new Date(Date.now() + 180 * 24 * 60 * 60 * 1000);

        const now = new Date();
        const daysUntilExpiration = Math.ceil(
          (expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        const docData = {
          userId: ctx.user.id,
          name: input.fileName,
          fileName: input.fileName,
          fileUrl,
          documentType: input.documentType,
          expirationDate,
          daysUntilExpiration,
          isExpired: daysUntilExpiration < 0,
        };

        await database.insert(documents).values(docData as any);

        return { success: true, fileUrl, expirationDate };
      } catch (error) {
        console.error("Erro ao fazer upload de documento:", error);
        return { success: false, error: "Erro ao fazer upload" };
      }
    }),

  listDocuments: protectedProcedure.query(async ({ ctx }) => {
    try {
      const database = await getDb();
      if (!database) return [];

      const result = await database
        .select()
        .from(documents)
        .where(eq(documents.userId, ctx.user.id))
        .orderBy(documents.expirationDate);

      const now = new Date();
      return result.map((doc: typeof documents.$inferSelect) => {
        const expirationDate = doc.expirationDate || new Date();
        const daysUntilExpiration = Math.ceil(
          (new Date(expirationDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        let status: "valid" | "warning" | "critical" | "expired" = "valid";
        if (daysUntilExpiration < 0) status = "expired";
        else if (daysUntilExpiration <= 30) status = "critical";
        else if (daysUntilExpiration <= 90) status = "warning";

        return {
          ...doc,
          daysUntilExpiration,
          status,
        };
      });
    } catch (error) {
      console.error("Erro ao listar documentos:", error);
      return [];
    }
  }),

  getDocument: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const database = await getDb();
        if (!database) return null;

        const result = await database
          .select()
          .from(documents)
          .where(and(eq(documents.id, input.id), eq(documents.userId, ctx.user.id)))
          .limit(1);

        return result[0] || null;
      } catch (error) {
        console.error("Erro ao obter documento:", error);
        return null;
      }
    }),

  deleteDocument: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const database = await getDb();
        if (!database) return { success: false };

        const result = await database
          .select()
          .from(documents)
          .where(and(eq(documents.id, input.id), eq(documents.userId, ctx.user.id)))
          .limit(1);

        if (!result[0]) return { success: false };

        await database.delete(documents).where(eq(documents.id, input.id));

        return { success: true };
      } catch (error) {
        console.error("Erro ao deletar documento:", error);
        return { success: false };
      }
    }),

  updateExpirationDate: protectedProcedure
    .input(z.object({ id: z.number(), expirationDate: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const database = await getDb();
        if (!database) return { success: false };

        const result = await database
          .select()
          .from(documents)
          .where(and(eq(documents.id, input.id), eq(documents.userId, ctx.user.id)))
          .limit(1);

        if (!result[0]) return { success: false };

        await database
          .update(documents)
          .set({ expirationDate: new Date(input.expirationDate) })
          .where(eq(documents.id, input.id));

        return { success: true };
      } catch (error) {
        console.error("Erro ao atualizar data de vencimento:", error);
        return { success: false };
      }
    }),

  getExpiringDocuments: protectedProcedure.query(async ({ ctx }) => {
    try {
      const database = await getDb();
      if (!database) return [];

      const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      const result = await database
        .select()
        .from(documents)
        .where(
          and(
            eq(documents.userId, ctx.user.id),
            lte(documents.expirationDate, thirtyDaysFromNow)
          )
        )
        .orderBy(documents.expirationDate);

      return result;
    } catch (error) {
      console.error("Erro ao obter documentos vencendo:", error);
      return [];
    }
  }),
});
