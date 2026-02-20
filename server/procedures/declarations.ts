import { z } from "zod";
import { protectedProcedure } from "../_core/trpc";
import { getDb, getCompanyByUserId } from "../db";

export const declarationsRouter = {
  generateDeclaration: protectedProcedure
    .input(
      z.object({
        type: z.enum(["juridica", "tecnica", "fiscal", "economica"]),
        tenderNumber: z.string().optional(),
        tenderObject: z.string().optional(),
        legalRepresentativeName: z.string().optional(),
        legalRepresentativeCPF: z.string().optional(),
        legalRepresentativePosition: z.string().optional(),
        technicalResponsibleName: z.string().optional(),
        technicalResponsibleCPF: z.string().optional(),
        technicalResponsibleCREA: z.string().optional(),
        yearsOfExperience: z.number().optional(),
        previousProjects: z.string().optional(),
        additionalInfo: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const company = await getCompanyByUserId(ctx.user.id);
      if (!company) {
        throw new Error("Empresa não configurada.");
      }

      let html = "";

      switch (input.type) {
        case "juridica":
          html = generateJuridicaDeclaration(company, input);
          break;
        case "tecnica":
          html = generateTecnicaDeclaration(company, input);
          break;
        case "fiscal":
          html = generateFiscalDeclaration(company, input);
          break;
        case "economica":
          html = generateEconomicaDeclaration(company, input);
          break;
      }

      return {
        success: true,
        html,
        type: input.type,
        fileName: `Declaracao_${input.type}_${new Date().getTime()}.pdf`,
      };
    }),
};

function generateJuridicaDeclaration(company: any, input: any) {
  const legalRepName = input.legalRepresentativeName || "___________________________";
  const legalRepCPF = input.legalRepresentativeCPF || "___________________________";
  const legalRepPosition = input.legalRepresentativePosition || "Representante Legal";

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Declaração de Habilitação Jurídica</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 210mm; margin: 0 auto; padding: 40px; }
    .header { text-align: center; margin-bottom: 40px; }
    .title { font-size: 16px; font-weight: bold; margin-bottom: 20px; }
    .content { text-align: justify; margin-bottom: 20px; }
    .signature-area { margin-top: 60px; }
    .signature-line { border-top: 1px solid #000; width: 300px; text-align: center; margin-top: 40px; }
    .footer { margin-top: 40px; font-size: 12px; text-align: center; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="title">DECLARAÇÃO DE HABILITAÇÃO JURÍDICA</div>
      <div style="margin-bottom: 20px;">Conforme Lei 14.133/2021</div>
    </div>

    <div class="content">
      <p><strong>${company.companyName}</strong>, inscrita no CNPJ sob nº <strong>${company.cnpj}</strong>, por intermédio de seu representante legal infra-assinado, vem por este meio DECLARAR, sob as penas da lei, que:</p>

      <p>1. A empresa encontra-se devidamente constituída e registrada, com poderes para participar de licitações e contratar com a Administração Pública;</p>

      <p>2. Não se encontra em situação de dissolução, liquidação, falência ou concordata;</p>

      <p>3. Possui capacidade jurídica e técnica para executar os serviços/fornecimentos objeto desta licitação ${input.tenderNumber ? `nº ${input.tenderNumber}` : ""};</p>

      <p>4. Não está impedida de contratar com a Administração Pública, conforme disposto na Lei 14.133/2021;</p>

      <p>5. Cumpre com as obrigações de natureza fiscal, trabalhista e previdenciária;</p>

      <p>6. Declara-se apta a participar de procedimentos licitatórios e a cumprir com todas as obrigações decorrentes de eventual contratação.</p>

      ${input.additionalInfo ? `<p>7. ${input.additionalInfo}</p>` : ""}
    </div>

    <div class="signature-area">
      <p>Por ser verdade, firmo a presente declaração.</p>
      
      <p style="margin-top: 40px;">
        _________________________, ${new Date().toLocaleDateString("pt-BR")}
      </p>

      <div class="signature-line">
        ${legalRepName}
      </div>
      <p style="text-align: center; font-size: 12px;">CPF: ${legalRepCPF}</p>
      <p style="text-align: center; font-size: 12px;">${legalRepPosition}</p>
    </div>

    <div class="footer">
      <p>Declaração gerada automaticamente pelo sistema Licitador Inteligente</p>
    </div>
  </div>
</body>
</html>
  `;
}

function generateTecnicaDeclaration(company: any, input: any) {
  const techName = input.technicalResponsibleName || "___________________________";
  const techCPF = input.technicalResponsibleCPF || "___________________________";
  const techCREA = input.technicalResponsibleCREA || "___________________________";
  const yearsExp = input.yearsOfExperience || "___";

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Declaração de Habilitação Técnica</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 210mm; margin: 0 auto; padding: 40px; }
    .header { text-align: center; margin-bottom: 40px; }
    .title { font-size: 16px; font-weight: bold; margin-bottom: 20px; }
    .content { text-align: justify; margin-bottom: 20px; }
    .signature-area { margin-top: 60px; }
    .signature-line { border-top: 1px solid #000; width: 300px; text-align: center; margin-top: 40px; }
    .footer { margin-top: 40px; font-size: 12px; text-align: center; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="title">DECLARAÇÃO DE HABILITAÇÃO TÉCNICA</div>
      <div style="margin-bottom: 20px;">Conforme Lei 14.133/2021</div>
    </div>

    <div class="content">
      <p><strong>${company.companyName}</strong>, inscrita no CNPJ sob nº <strong>${company.cnpj}</strong>, por intermédio de seu responsável técnico infra-assinado, vem por este meio DECLARAR, sob as penas da lei, que:</p>

      <p>1. Possui capacidade técnica e operacional para executar os serviços/fornecimentos objeto desta licitação ${input.tenderNumber ? `nº ${input.tenderNumber}` : ""};</p>

      <p>2. Dispõe de profissionais qualificados e experientes para a execução dos trabalhos, sendo o responsável técnico:</p>

      <p style="margin-left: 20px;">
        <strong>Nome:</strong> ${techName}<br>
        <strong>CPF:</strong> ${techCPF}<br>
        <strong>CREA/CAU:</strong> ${techCREA}<br>
        <strong>Anos de Experiência:</strong> ${yearsExp} anos
      </p>

      <p>3. Possui conhecimento técnico adequado para o desenvolvimento das atividades propostas;</p>

      <p>4. Compromete-se a manter responsável técnico qualificado durante toda a execução do contrato;</p>

      <p>5. Possui infraestrutura, equipamentos e recursos necessários para a execução dos serviços;</p>

      ${input.previousProjects ? `<p>6. Possui experiência comprovada em projetos similares: ${input.previousProjects}</p>` : "<p>6. Possui experiência comprovada em projetos similares.</p>"}

      ${input.additionalInfo ? `<p>7. ${input.additionalInfo}</p>` : ""}
    </div>

    <div class="signature-area">
      <p>Por ser verdade, firmo a presente declaração.</p>
      
      <p style="margin-top: 40px;">
        _________________________, ${new Date().toLocaleDateString("pt-BR")}
      </p>

      <div class="signature-line">
        ${techName}
      </div>
      <p style="text-align: center; font-size: 12px;">CPF: ${techCPF}</p>
      <p style="text-align: center; font-size: 12px;">CREA/CAU: ${techCREA}</p>
    </div>

    <div class="footer">
      <p>Declaração gerada automaticamente pelo sistema Licitador Inteligente</p>
    </div>
  </div>
</body>
</html>
  `;
}

function generateFiscalDeclaration(company: any, input: any) {
  const legalRepName = input.legalRepresentativeName || "___________________________";
  const legalRepCPF = input.legalRepresentativeCPF || "___________________________";

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Declaração de Habilitação Fiscal, Social e Trabalhista</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 210mm; margin: 0 auto; padding: 40px; }
    .header { text-align: center; margin-bottom: 40px; }
    .title { font-size: 16px; font-weight: bold; margin-bottom: 20px; }
    .content { text-align: justify; margin-bottom: 20px; }
    .signature-area { margin-top: 60px; }
    .signature-line { border-top: 1px solid #000; width: 300px; text-align: center; margin-top: 40px; }
    .footer { margin-top: 40px; font-size: 12px; text-align: center; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="title">DECLARAÇÃO DE HABILITAÇÃO FISCAL, SOCIAL E TRABALHISTA</div>
      <div style="margin-bottom: 20px;">Conforme Lei 14.133/2021</div>
    </div>

    <div class="content">
      <p><strong>${company.companyName}</strong>, inscrita no CNPJ sob nº <strong>${company.cnpj}</strong>, por intermédio de seu representante legal infra-assinado, vem por este meio DECLARAR, sob as penas da lei, que:</p>

      <p>1. Encontra-se em dia com suas obrigações fiscais perante a Fazenda Federal, Estadual e Municipal;</p>

      <p>2. Possui Inscrição Estadual regularizada e em situação ativa junto à Secretaria da Fazenda;</p>

      <p>3. Encontra-se em dia com suas obrigações perante o Instituto Nacional do Seguro Social (INSS);</p>

      <p>4. Encontra-se em dia com suas obrigações perante o Fundo de Garantia do Tempo de Serviço (FGTS);</p>

      <p>5. Encontra-se em dia com suas obrigações perante a Justiça do Trabalho;</p>

      <p>6. Não possui débitos inscritos em dívida ativa da União, Estado ou Município;</p>

      <p>7. Declara estar ciente de que a apresentação de documentação falsa ou enganosa enseja sanções administrativas e penais;</p>

      <p>8. Compromete-se a manter regularizadas todas as obrigações fiscais, sociais e trabalhistas durante a vigência de eventual contrato.</p>

      ${input.additionalInfo ? `<p>9. ${input.additionalInfo}</p>` : ""}
    </div>

    <div class="signature-area">
      <p>Por ser verdade, firmo a presente declaração.</p>
      
      <p style="margin-top: 40px;">
        _________________________, ${new Date().toLocaleDateString("pt-BR")}
      </p>

      <div class="signature-line">
        ${legalRepName}
      </div>
      <p style="text-align: center; font-size: 12px;">CPF: ${legalRepCPF}</p>
    </div>

    <div class="footer">
      <p>Declaração gerada automaticamente pelo sistema Licitador Inteligente</p>
    </div>
  </div>
</body>
</html>
  `;
}

function generateEconomicaDeclaration(company: any, input: any) {
  const legalRepName = input.legalRepresentativeName || "___________________________";
  const legalRepCPF = input.legalRepresentativeCPF || "___________________________";

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Declaração de Habilitação Econômico-Financeira</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 210mm; margin: 0 auto; padding: 40px; }
    .header { text-align: center; margin-bottom: 40px; }
    .title { font-size: 16px; font-weight: bold; margin-bottom: 20px; }
    .content { text-align: justify; margin-bottom: 20px; }
    .signature-area { margin-top: 60px; }
    .signature-line { border-top: 1px solid #000; width: 300px; text-align: center; margin-top: 40px; }
    .footer { margin-top: 40px; font-size: 12px; text-align: center; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="title">DECLARAÇÃO DE HABILITAÇÃO ECONÔMICO-FINANCEIRA</div>
      <div style="margin-bottom: 20px;">Conforme Lei 14.133/2021</div>
    </div>

    <div class="content">
      <p><strong>${company.companyName}</strong>, inscrita no CNPJ sob nº <strong>${company.cnpj}</strong>, por intermédio de seu representante legal infra-assinado, vem por este meio DECLARAR, sob as penas da lei, que:</p>

      <p>1. Possui capacidade econômico-financeira para executar os serviços/fornecimentos objeto desta licitação ${input.tenderNumber ? `nº ${input.tenderNumber}` : ""};</p>

      <p>2. Não se encontra em situação de insolvência, falência ou concordata;</p>

      <p>3. Possui patrimônio líquido mínimo compatível com a execução do objeto da licitação;</p>

      <p>4. Dispõe de recursos financeiros necessários para a execução dos trabalhos conforme cronograma proposto;</p>

      <p>5. Compromete-se a manter a saúde financeira durante toda a execução do contrato;</p>

      <p>6. Declara que as informações financeiras fornecidas são verdadeiras e completas;</p>

      <p>7. Autoriza a Administração a verificar sua situação econômico-financeira junto a órgãos competentes;</p>

      <p>8. Compromete-se a fornecer, quando solicitado, demonstrações financeiras atualizadas.</p>

      ${input.additionalInfo ? `<p>9. ${input.additionalInfo}</p>` : ""}
    </div>

    <div class="signature-area">
      <p>Por ser verdade, firmo a presente declaração.</p>
      
      <p style="margin-top: 40px;">
        _________________________, ${new Date().toLocaleDateString("pt-BR")}
      </p>

      <div class="signature-line">
        ${legalRepName}
      </div>
      <p style="text-align: center; font-size: 12px;">CPF: ${legalRepCPF}</p>
    </div>

    <div class="footer">
      <p>Declaração gerada automaticamente pelo sistema Licitador Inteligente</p>
    </div>
  </div>
</body>
</html>
  `;
}
