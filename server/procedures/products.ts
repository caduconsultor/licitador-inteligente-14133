import { z } from "zod";
import { protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { products, suppliers } from "../../drizzle/schema";
import { eq, like, and } from "drizzle-orm";

export const productsRouter = {
  // Criar novo produto
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Nome do produto é obrigatório"),
        brand: z.string().optional(),
        model: z.string().optional(),
        unit: z.string().min(1, "Unidade é obrigatória"),
        cost: z.coerce.number().min(0, "Custo deve ser maior que zero"),
        supplierId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.insert(products).values({
        userId: ctx.user.id,
        name: input.name,
        brand: input.brand,
        model: input.model,
        unit: input.unit,
        cost: input.cost.toString(),
        supplierId: input.supplierId,
      });

      return { success: true };
    }),

  // Listar produtos do usuário
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const result = await db
      .select()
      .from(products)
      .where(eq(products.userId, ctx.user.id))
      .orderBy(products.name);

    return result;
  }),

  // Buscar produtos com autocomplete
  search: protectedProcedure
    .input(z.object({ query: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result = await db
        .select()
        .from(products)
        .where(
          and(
            eq(products.userId, ctx.user.id),
            like(products.name, `%${input.query}%`)
          )
        )
        .limit(10);

      return result;
    }),

  // Atualizar produto
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        brand: z.string().optional(),
        model: z.string().optional(),
        unit: z.string().optional(),
        cost: z.coerce.number().optional(),
        supplierId: z.number().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const updateData: Record<string, unknown> = {};
      if (input.name !== undefined) updateData.name = input.name;
      if (input.brand !== undefined) updateData.brand = input.brand;
      if (input.model !== undefined) updateData.model = input.model;
      if (input.unit !== undefined) updateData.unit = input.unit;
      if (input.cost !== undefined) updateData.cost = input.cost.toString();
      if (input.supplierId !== undefined) updateData.supplierId = input.supplierId;

      await db
        .update(products)
        .set(updateData)
        .where(and(eq(products.id, input.id), eq(products.userId, ctx.user.id)));

      return { success: true };
    }),

  // Deletar produto
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .delete(products)
        .where(and(eq(products.id, input.id), eq(products.userId, ctx.user.id)));

      return { success: true };
    }),

  // Importar produtos via CSV
  importCSV: protectedProcedure
    .input(
      z.object({
        csvData: z.array(
          z.object({
            name: z.string(),
            brand: z.string().optional(),
            model: z.string().optional(),
            unit: z.string(),
            cost: z.coerce.number(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const insertData = input.csvData.map((item) => ({
        userId: ctx.user.id,
        name: item.name,
        brand: item.brand,
        model: item.model,
        unit: item.unit,
        cost: item.cost.toString(),
        supplierId: null,
      }));

      await db.insert(products).values(insertData);

      return { success: true, imported: insertData.length };
    }),
};

export const suppliersRouter = {
  // Criar novo fornecedor
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Nome do fornecedor é obrigatório"),
        cnpj: z.string().optional(),
        phone: z.string().optional(),
        whatsapp: z.string().optional(),
        email: z.string().email().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.insert(suppliers).values({
        userId: ctx.user.id,
        name: input.name,
        cnpj: input.cnpj,
        phone: input.phone,
        whatsapp: input.whatsapp,
        email: input.email,
      });

      return { success: true };
    }),

  // Listar fornecedores
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const result = await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.userId, ctx.user.id))
      .orderBy(suppliers.name);

    return result;
  }),

  // Atualizar fornecedor
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        cnpj: z.string().optional(),
        phone: z.string().optional(),
        whatsapp: z.string().optional(),
        email: z.string().email().optional(),
        rating: z.coerce.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const updateData: Record<string, unknown> = {};
      if (input.name !== undefined) updateData.name = input.name;
      if (input.cnpj !== undefined) updateData.cnpj = input.cnpj;
      if (input.phone !== undefined) updateData.phone = input.phone;
      if (input.whatsapp !== undefined) updateData.whatsapp = input.whatsapp;
      if (input.email !== undefined) updateData.email = input.email;
      if (input.rating !== undefined) updateData.rating = input.rating.toString();

      await db
        .update(suppliers)
        .set(updateData)
        .where(and(eq(suppliers.id, input.id), eq(suppliers.userId, ctx.user.id)));

      return { success: true };
    }),

  // Deletar fornecedor
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .delete(suppliers)
        .where(and(eq(suppliers.id, input.id), eq(suppliers.userId, ctx.user.id)));

      return { success: true };
    }),
};
