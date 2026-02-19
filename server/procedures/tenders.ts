import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { invokeLLM } from "../_core/llm";
import { storagePut } from "../storage";
import { getDb } from "../db";
import { tenders } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const tendersRouter = router({
  analyzeTender: protectedProcedure
    .input(z.object({
      fileName: z.string(),
      fileContent: z.string(),
      mimeType: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const systemPrompt = "Voce eh um especialista em licitacoes publicas conforme Lei 14.133/2021. Analise o edital e extraia informacoes estruturadas em JSON valido.";
        const userPrompt = `Analise este edital:\n\n${input.fileContent.substring(0, 3000)}\n\nRetorne um JSON valido com: object, deadline, bidDeadline, requirements, items, judgmentCriteria, estimatedValue, riskLevel`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        });

        const analysisText = typeof response.choices[0]?.message?.content === 'string' 
          ? response.choices[0].message.content 
          : "{}";
        let analysis = {};
        try {
          analysis = JSON.parse(analysisText);
        } catch {
          analysis = { object: "Nao extraido", riskLevel: "medio" };
        }

        const fileKey = `tenders/${ctx.user.id}/${Date.now()}-${input.fileName}`;
        const contentBuffer = typeof input.fileContent === 'string' ? Buffer.from(input.fileContent) : input.fileContent;
        const { url: fileUrl } = await storagePut(fileKey, contentBuffer, input.mimeType);

        const database = await getDb();
        if (!database) return { success: false, error: "Database indisponivel" };

        const tenderData = {
          userId: ctx.user.id,
          fileName: input.fileName,
          fileUrl,
          tenderObject: (analysis as any).object || "Nao informado",
          deadlineSubmission: new Date(),
          habilitationRequirements: (analysis as any).requirements || {},
          items: (analysis as any).items || [],
          riskLevel: "medium" as const,
          analysisResult: JSON.stringify(analysis),
          analysisStatus: "completed" as const,
        };

        await database.insert(tenders).values(tenderData as any);

        return { success: true, analysis, fileUrl };
      } catch (error) {
        console.error("Erro:", error);
        return { success: false, error: "Erro ao analisar edital" };
      }
    }),

  listTenders: protectedProcedure.query(async ({ ctx }) => {
    try {
      const database = await getDb();
      if (!database) return [];
      const result = await database.select().from(tenders).where(eq(tenders.userId, ctx.user.id));
      return result;
    } catch (error) {
      return [];
    }
  }),

  getTender: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const database = await getDb();
        if (!database) return null;
        const result = await database.select().from(tenders).where(eq(tenders.id, input.id)).limit(1);
        const tender = result[0];
        if (!tender || tender.userId !== ctx.user.id) return null;
        return tender;
      } catch (error) {
        return null;
      }
    }),

  deleteTender: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const database = await getDb();
        if (!database) return { success: false };
        const result = await database.select().from(tenders).where(eq(tenders.id, input.id)).limit(1);
        const tender = result[0];
        if (!tender || tender.userId !== ctx.user.id) return { success: false };
        await database.delete(tenders).where(eq(tenders.id, input.id));
        return { success: true };
      } catch (error) {
        return { success: false };
      }
    }),
});
