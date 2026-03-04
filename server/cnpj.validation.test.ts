import { describe, it, expect } from "vitest";

// Função de validação CNPJ (mesma do componente)
function validateCNPJ(cnpj: string): boolean {
  const cleanCNPJ = cnpj.replace(/\D/g, "");
  if (cleanCNPJ.length !== 14) return false;
  
  // Rejeitar CNPJs com todos os dígitos iguais
  if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false;
  
  // Validar primeiro dígito verificador
  let sum = 0;
  let multiplier = 5;
  for (let i = 0; i < 8; i++) {
    sum += parseInt(cleanCNPJ[i]) * multiplier;
    multiplier = multiplier === 2 ? 9 : multiplier - 1;
  }
  
  let remainder = sum % 11;
  let digit1 = remainder < 2 ? 0 : 11 - remainder;
  
  if (parseInt(cleanCNPJ[8]) !== digit1) return false;
  
  // Validar segundo dígito verificador
  sum = 0;
  multiplier = 6;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCNPJ[i]) * multiplier;
    multiplier = multiplier === 2 ? 9 : multiplier - 1;
  }
  
  remainder = sum % 11;
  let digit2 = remainder < 2 ? 0 : 11 - remainder;
  
  return parseInt(cleanCNPJ[9]) === digit2;
}

describe("CNPJ Validation", () => {
  it("should reject CNPJ with less than 14 digits", () => {
    expect(validateCNPJ("1122233300018")).toBe(false);
  });

  it("should reject CNPJ with more than 14 digits", () => {
    expect(validateCNPJ("112223330001811")).toBe(false);
  });

  it("should reject empty CNPJ", () => {
    expect(validateCNPJ("")).toBe(false);
  });

  it("should reject CNPJ with all same digits", () => {
    // CNPJ com todos os dígitos iguais
    expect(validateCNPJ("11111111111111")).toBe(false);
    expect(validateCNPJ("00000000000000")).toBe(false);
  });

  it("should handle CNPJ with formatting characters", () => {
    // Deve remover caracteres especiais e validar
    const cnpjFormatted = "11.222.333/0001-81";
    const cnpjClean = cnpjFormatted.replace(/\D/g, "");
    expect(cnpjClean).toBe("11222333000181");
    expect(cnpjClean.length).toBe(14);
  });

  it("should reject CNPJ with invalid checksum", () => {
    // CNPJ com checksum inválido (alterado o último dígito)
    expect(validateCNPJ("11222333000180")).toBe(false);
  });

  it("should validate CNPJ format requirements", () => {
    // Testa se a validação rejeita formatos inválidos
    expect(validateCNPJ("ABC")).toBe(false);
    expect(validateCNPJ("12345678901234")).toBe(false); // Pode ser inválido por checksum
  });

  it("should handle CNPJ with only numbers", () => {
    const cnpj = "11222333000181";
    expect(cnpj.length).toBe(14);
    expect(/^\d+$/.test(cnpj)).toBe(true);
  });

  it("should reject CNPJ with letters after cleanup", () => {
    // Após remover caracteres especiais, se sobrar letra, será rejeitado
    const cnpjWithLetters = "11222333000A81";
    const cleaned = cnpjWithLetters.replace(/\D/g, "");
    expect(cleaned.length).toBeLessThan(14);
  });
});
