import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { invokeLLM } from "../_core/llm";
import { storagePut } from "../storage";
import { getDb, getCompanyTenders, getTenderById, getCompaniesByUserId } from "../db";
import { tenders } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const tendersRouter = router({
  analyzeTender: protectedProcedure
    .input(z.object({
      companyId: z.number(),
      fileName: z.string(),
      fileContent: z.string(),
      mimeType: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify user has access to this company
        const userCompanies = await getCompaniesByUserId(ctx.user.id);
        const hasAccess = userCompanies.some(c => c.id === input.companyId);
        if (!hasAccess) {
          return { success: false, error: "Acesso negado a esta empresa" };
        }

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

        const fileKey = `tenders/${input.companyId}/${Date.now()}-${input.fileName}`;
        const contentBuffer = typeof input.fileContent === 'string' ? Buffer.from(input.fileContent) : input.fileContent;
        const { url: fileUrl } = await storagePut(fileKey, contentBuffer, input.mimeType);

        const database = await getDb();
        if (!database) return { success: false, error: "Database indisponivel" };

        const tenderData = {
          companyId: input.companyId,
          title: (analysis as any).object || input.fileName,
          description: "",
          fileName: input.fileName,
          fileUrl,
          fileType: input.mimeType.includes("word") ? "docx" : "pdf",
          tenderObject: (analysis as any).object || "Nao informado",
          deadlineSubmission: new Date().toISOString(),
          habilitationRequirements: (analysis as any).requirements || {},
          items: (analysis as any).items || [],
          riskLevel: "medium" as const,
          analysisResult: JSON.stringify(analysis),
          analysisStatus: "completed" as const,
        };

        await database.insert(tenders).values(tenderData as any).catch(err => {
          console.error("Insert error:", err);
          throw err;
        });

        return { success: true, analysis, fileUrl };
      } catch (error) {
        console.error("Erro:", error);
        return { success: false, error: "Erro ao analisar edital" };
      }
    }),

  listTenders: protectedProcedure
    .input(z.object({ companyId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        // Verify user has access to this company
        const userCompanies = await getCompaniesByUserId(ctx.user.id);
        const hasAccess = userCompanies.some(c => c.id === input.companyId);
        if (!hasAccess) {
          return [];
        }

        return await getCompanyTenders(input.companyId);
      } catch (error) {
        return [];
      }
    }),

  getTender: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const tender = await getTenderById(input.id);
        if (!tender) return null;

        // Verify user has access to this company
        const userCompanies = await getCompaniesByUserId(ctx.user.id);
        const hasAccess = userCompanies.some(c => c.id === tender.companyId);
        if (!hasAccess) return null;

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

        const tender = await getTenderById(input.id);
        if (!tender) return { success: false };

        // Verify user has access to this company
        const userCompanies = await getCompaniesByUserId(ctx.user.id);
        const hasAccess = userCompanies.some(c => c.id === tender.companyId);
        if (!hasAccess) return { success: false };

        await database.delete(tenders).where(eq(tenders.id, input.id));
        return { success: true };
      } catch (error) {
        return { success: false };
      }
    }),
});
