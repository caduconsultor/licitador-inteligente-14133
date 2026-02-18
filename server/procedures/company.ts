import { protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import axios from "axios";

/**
 * Busca dados de CNPJ via API ReceitaWS
 * API pública e gratuita que retorna dados da Receita Federal
 */
export const searchCNPJ = protectedProcedure
  .input(z.object({
    cnpj: z.string().regex(/^\d{14}$/, "CNPJ deve conter 14 dígitos"),
  }))
  .query(async ({ input }) => {
    try {
      // Remove caracteres especiais do CNPJ
      const cleanCNPJ = input.cnpj.replace(/\D/g, "");

      // Chama API ReceitaWS
      const response = await axios.get(
        `https://www.receitaws.com.br/v1/cnpj/${cleanCNPJ}`,
        { timeout: 10000 }
      );

      if (response.data.status === "ERROR") {
        return {
          success: false,
          error: "CNPJ não encontrado na Receita Federal",
        };
      }

      // Extrai dados relevantes
      return {
        success: true,
        data: {
          cnpj: response.data.cnpj,
          companyName: response.data.nome,
          legalName: response.data.nome_fantasia || response.data.nome,
          address: {
            street: response.data.logradouro,
            number: response.data.numero,
            complement: response.data.complemento,
            city: response.data.municipio,
            state: response.data.uf,
            zipCode: response.data.cep,
          },
          phone: response.data.telefone,
          email: response.data.email,
          status: response.data.situacao,
          registrationDate: response.data.data_constituicao,
        },
      };
    } catch (error) {
      console.error("Erro ao buscar CNPJ:", error);
      return {
        success: false,
        error: "Erro ao buscar dados do CNPJ. Tente novamente.",
      };
    }
  });

/**
 * Valida CNPJ usando algoritmo de verificação
 */
export function validateCNPJ(cnpj: string): boolean {
  const cleanCNPJ = cnpj.replace(/\D/g, "");

  if (cleanCNPJ.length !== 14) return false;

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false;

  // Calcula primeiro dígito verificador
  let size = cleanCNPJ.length - 2;
  let numbers = cleanCNPJ.substring(0, size);
  let digits = cleanCNPJ.substring(size);
  let sum = 0;
  let pos = size - 7;

  for (let i = size; i >= 1; i--) {
    sum += Number(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== Number(digits.charAt(0))) return false;

  // Calcula segundo dígito verificador
  size = size + 1;
  numbers = cleanCNPJ.substring(0, size);
  sum = 0;
  pos = size - 7;

  for (let i = size; i >= 1; i--) {
    sum += Number(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== Number(digits.charAt(1))) return false;

  return true;
}
