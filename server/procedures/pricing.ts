import { z } from "zod";
import { protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";

export const pricingRouter = {
  calculateProductPrice: protectedProcedure
    .input(
      z.object({
        productName: z.string(),
        unitCost: z.number().positive("Custo unitário deve ser maior que 0"),
        quantity: z.number().positive("Quantidade deve ser maior que 0"),
        profitMargin: z.number().min(0).max(100, "Margem deve estar entre 0 e 100"),
        taxRegime: z.enum(["simples_nacional", "lucro_presumido", "lucro_real"]),
        taxPercentage: z.number().min(0).max(100, "Percentual de imposto deve estar entre 0 e 100"),
        freightPercentage: z.number().min(0).max(100, "Percentual de frete deve estar entre 0 e 100"),
        freightType: z.enum(["percentage", "per_weight", "fixed"]),
        freightValue: z.number().min(0),
        weight: z.number().min(0).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Cálculo do custo total com impostos
      const taxAmount = (input.unitCost * input.taxPercentage) / 100;
      const costWithTax = input.unitCost + taxAmount;

      // Cálculo do frete
      let freightAmount = 0;
      switch (input.freightType) {
        case "percentage":
          freightAmount = (costWithTax * input.freightPercentage) / 100;
          break;
        case "per_weight":
          if (input.weight) {
            freightAmount = input.weight * input.freightValue;
          }
          break;
        case "fixed":
          freightAmount = input.freightValue;
          break;
      }

      // Cálculo da margem de lucro
      const costWithFreight = costWithTax + freightAmount;
      const profitAmount = (costWithFreight * input.profitMargin) / 100;

      // Preço final
      const finalPrice = costWithFreight + profitAmount;
      const unitPrice = finalPrice;
      const totalPrice = unitPrice * input.quantity;

      return {
        productName: input.productName,
        quantity: input.quantity,
        unitCost: input.unitCost,
        taxPercentage: input.taxPercentage,
        taxAmount: parseFloat(taxAmount.toFixed(2)),
        costWithTax: parseFloat(costWithTax.toFixed(2)),
        freightType: input.freightType,
        freightAmount: parseFloat(freightAmount.toFixed(2)),
        costWithFreight: parseFloat(costWithFreight.toFixed(2)),
        profitMargin: input.profitMargin,
        profitAmount: parseFloat(profitAmount.toFixed(2)),
        unitPrice: parseFloat(unitPrice.toFixed(2)),
        totalPrice: parseFloat(totalPrice.toFixed(2)),
        breakdown: {
          unitCost: input.unitCost,
          tax: parseFloat(taxAmount.toFixed(2)),
          freight: parseFloat(freightAmount.toFixed(2)),
          profit: parseFloat(profitAmount.toFixed(2)),
        },
      };
    }),

  calculateBDI: protectedProcedure
    .input(
      z.object({
        serviceName: z.string(),
        directCost: z.number().positive("Custo direto deve ser maior que 0"),
        laborCost: z.number().min(0),
        equipmentCost: z.number().min(0),
        materialCost: z.number().min(0),
        overheadPercentage: z.number().min(0).max(100, "Overhead deve estar entre 0 e 100"),
        profitMarcentage: z.number().min(0).max(100, "Lucro deve estar entre 0 e 100"),
        taxPercentage: z.number().min(0).max(100, "Imposto deve estar entre 0 e 100"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const totalDirectCost =
        input.directCost + input.laborCost + input.equipmentCost + input.materialCost;

      // Cálculo de BDI (Benefícios e Despesas Indiretas)
      const overheadAmount = (totalDirectCost * input.overheadPercentage) / 100;
      const profitAmount = (totalDirectCost * input.profitMarcentage) / 100;
      const bdiAmount = overheadAmount + profitAmount;

      // Custo com BDI
      const costWithBDI = totalDirectCost + bdiAmount;

      // Impostos
      const taxAmount = (costWithBDI * input.taxPercentage) / 100;

      // Preço final
      const finalPrice = costWithBDI + taxAmount;

      return {
        serviceName: input.serviceName,
        directCosts: {
          labor: input.laborCost,
          equipment: input.equipmentCost,
          material: input.materialCost,
          other: input.directCost,
          total: parseFloat(totalDirectCost.toFixed(2)),
        },
        indirectCosts: {
          overhead: parseFloat(overheadAmount.toFixed(2)),
          profit: parseFloat(profitAmount.toFixed(2)),
          total: parseFloat(bdiAmount.toFixed(2)),
        },
        bdiPercentage: parseFloat(((bdiAmount / totalDirectCost) * 100).toFixed(2)),
        costWithBDI: parseFloat(costWithBDI.toFixed(2)),
        taxAmount: parseFloat(taxAmount.toFixed(2)),
        finalPrice: parseFloat(finalPrice.toFixed(2)),
        breakdown: {
          directCost: parseFloat(totalDirectCost.toFixed(2)),
          overhead: parseFloat(overheadAmount.toFixed(2)),
          profit: parseFloat(profitAmount.toFixed(2)),
          tax: parseFloat(taxAmount.toFixed(2)),
        },
      };
    }),
};
