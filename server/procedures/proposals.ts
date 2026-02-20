import { z } from "zod";
import { protectedProcedure } from "../_core/trpc";
import { getDb, getCompanyByUserId } from "../db";
import { storagePut } from "../storage";

export const proposalsRouter = {
  generateProposalPDF: protectedProcedure
    .input(
      z.object({
        proposalNumber: z.string().min(1, "Número da proposta obrigatório"),
        clientName: z.string().min(1, "Nome do cliente obrigatório"),
        clientCNPJ: z.string().optional(),
        clientEmail: z.string().email().optional(),
        clientPhone: z.string().optional(),
        clientAddress: z.string().optional(),
        items: z.array(
          z.object({
            description: z.string(),
            quantity: z.number().positive(),
            unitPrice: z.number().positive(),
            unit: z.string().default("un"),
          })
        ).min(1, "Adicione pelo menos um item"),
        validityDays: z.number().default(30),
        paymentTerms: z.string().default("A combinar"),
        observations: z.string().optional(),
        tenderNumber: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const company = await getCompanyByUserId(ctx.user.id);
      if (!company) {
        throw new Error("Empresa não configurada. Configure seus dados antes de gerar propostas.");
      }

      // Calcular totais
      const items = input.items.map((item) => ({
        ...item,
        total: item.quantity * item.unitPrice,
      }));

      const subtotal = items.reduce((sum, item) => sum + item.total, 0);
      const taxPercentage = typeof company.taxPercentage === 'number' ? company.taxPercentage : 0;
      const tax = (subtotal * taxPercentage) / 100;
      const total = subtotal + tax;

      // Gerar HTML da proposta
      const html = generateProposalHTML({
        company,
        proposal: {
          number: input.proposalNumber,
          date: new Date().toLocaleDateString("pt-BR"),
          validity: input.validityDays,
          client: {
            name: input.clientName,
            cnpj: input.clientCNPJ,
            email: input.clientEmail,
            phone: input.clientPhone,
            address: input.clientAddress,
          },
          items,
          subtotal,
          tax,
          total,
          paymentTerms: input.paymentTerms,
          observations: input.observations,
          tenderNumber: input.tenderNumber,
        },
      });

      // Converter HTML para PDF usando WeasyPrint (via shell)
      // Para agora, retornamos o HTML que será convertido no frontend
      return {
        success: true,
        html,
        proposalNumber: input.proposalNumber,
        fileName: `Proposta_${input.proposalNumber}_${new Date().getTime()}.pdf`,
        totals: {
          subtotal,
          tax,
          total,
        },
      };
    }),

  listProposals: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    // Aqui você buscaria as propostas do banco de dados
    // Por enquanto, retornamos um array vazio
    return [];
  }),
};

function generateProposalHTML(data: any) {
  const { company, proposal } = data;

  const itemsHTML = proposal.items
    .map(
      (item: any) =>
        `
    <tr>
      <td style="border: 1px solid #ddd; padding: 10px; text-align: left;">${item.description}</td>
      <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${item.quantity}</td>
      <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${item.unit}</td>
      <td style="border: 1px solid #ddd; padding: 10px; text-align: right;">R$ ${item.unitPrice.toFixed(2)}</td>
      <td style="border: 1px solid #ddd; padding: 10px; text-align: right;">R$ ${item.total.toFixed(2)}</td>
    </tr>
  `
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Proposta Comercial</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Arial', sans-serif;
      color: #333;
      line-height: 1.6;
    }
    
    .container {
      max-width: 210mm;
      height: 297mm;
      margin: 0 auto;
      padding: 20mm;
      background: white;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 3px solid #0066cc;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    
    .company-info {
      flex: 1;
    }
    
    .company-logo {
      max-width: 150px;
      margin-bottom: 10px;
    }
    
    .company-name {
      font-size: 18px;
      font-weight: bold;
      color: #0066cc;
      margin-bottom: 5px;
    }
    
    .company-details {
      font-size: 11px;
      color: #666;
      line-height: 1.4;
    }
    
    .proposal-header {
      text-align: right;
      font-size: 12px;
    }
    
    .proposal-title {
      font-size: 16px;
      font-weight: bold;
      color: #0066cc;
      margin-bottom: 10px;
    }
    
    .proposal-meta {
      font-size: 11px;
      line-height: 1.8;
    }
    
    .section {
      margin-bottom: 25px;
    }
    
    .section-title {
      font-size: 12px;
      font-weight: bold;
      background: #f0f0f0;
      padding: 8px 10px;
      margin-bottom: 10px;
      border-left: 4px solid #0066cc;
    }
    
    .client-info {
      font-size: 11px;
      line-height: 1.8;
    }
    
    .client-info-row {
      display: flex;
      margin-bottom: 5px;
    }
    
    .client-info-label {
      width: 100px;
      font-weight: bold;
      color: #0066cc;
    }
    
    .client-info-value {
      flex: 1;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    
    table thead {
      background: #0066cc;
      color: white;
    }
    
    table th {
      padding: 10px;
      text-align: left;
      font-size: 11px;
      font-weight: bold;
    }
    
    table td {
      border: 1px solid #ddd;
      padding: 10px;
      font-size: 11px;
    }
    
    .totals {
      width: 50%;
      margin-left: auto;
      margin-bottom: 20px;
    }
    
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 10px;
      border-bottom: 1px solid #ddd;
      font-size: 11px;
    }
    
    .total-row.subtotal {
      font-weight: normal;
    }
    
    .total-row.tax {
      font-weight: normal;
    }
    
    .total-row.grand-total {
      background: #0066cc;
      color: white;
      font-weight: bold;
      font-size: 13px;
    }
    
    .observations {
      background: #f9f9f9;
      padding: 10px;
      border-left: 4px solid #0066cc;
      font-size: 10px;
      line-height: 1.6;
      margin-bottom: 20px;
    }
    
    .footer {
      border-top: 2px solid #0066cc;
      padding-top: 15px;
      margin-top: 30px;
      font-size: 10px;
      color: #666;
      text-align: center;
    }
    
    .signature-area {
      display: flex;
      justify-content: space-around;
      margin-top: 40px;
      font-size: 10px;
    }
    
    .signature-line {
      width: 150px;
      text-align: center;
      border-top: 1px solid #333;
      padding-top: 5px;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="company-info">
        ${company.logoUrl ? `<img src="${company.logoUrl}" class="company-logo" alt="Logo">` : ""}
        <div class="company-name">${company.companyName}</div>
        <div class="company-details">
          <div>CNPJ: ${company.cnpj}</div>
          <div>${company.legalName || ""}</div>
          ${company.bankingData ? `<div>Contato: ${JSON.parse(company.bankingData).phone || ""}</div>` : ""}
        </div>
      </div>
      <div class="proposal-header">
        <div class="proposal-title">PROPOSTA COMERCIAL</div>
        <div class="proposal-meta">
          <div><strong>Nº:</strong> ${proposal.number}</div>
          <div><strong>Data:</strong> ${proposal.date}</div>
          <div><strong>Validade:</strong> ${proposal.validity} dias</div>
          ${proposal.tenderNumber ? `<div><strong>Edital:</strong> ${proposal.tenderNumber}</div>` : ""}
        </div>
      </div>
    </div>

    <!-- Client Info -->
    <div class="section">
      <div class="section-title">CLIENTE</div>
      <div class="client-info">
        <div class="client-info-row">
          <div class="client-info-label">Razão Social:</div>
          <div class="client-info-value">${proposal.client.name}</div>
        </div>
        ${proposal.client.cnpj ? `
        <div class="client-info-row">
          <div class="client-info-label">CNPJ:</div>
          <div class="client-info-value">${proposal.client.cnpj}</div>
        </div>
        ` : ""}
        ${proposal.client.address ? `
        <div class="client-info-row">
          <div class="client-info-label">Endereço:</div>
          <div class="client-info-value">${proposal.client.address}</div>
        </div>
        ` : ""}
        ${proposal.client.phone ? `
        <div class="client-info-row">
          <div class="client-info-label">Telefone:</div>
          <div class="client-info-value">${proposal.client.phone}</div>
        </div>
        ` : ""}
        ${proposal.client.email ? `
        <div class="client-info-row">
          <div class="client-info-label">Email:</div>
          <div class="client-info-value">${proposal.client.email}</div>
        </div>
        ` : ""}
      </div>
    </div>

    <!-- Items -->
    <div class="section">
      <div class="section-title">ITENS DA PROPOSTA</div>
      <table>
        <thead>
          <tr>
            <th>Descrição</th>
            <th style="width: 80px;">Qtd.</th>
            <th style="width: 60px;">Un.</th>
            <th style="width: 100px;">Valor Unit.</th>
            <th style="width: 100px;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHTML}
        </tbody>
      </table>
    </div>

    <!-- Totals -->
    <div class="totals">
      <div class="total-row subtotal">
        <span>Subtotal:</span>
        <span>R$ ${proposal.subtotal.toFixed(2)}</span>
      </div>
      <div class="total-row tax">
        <span>Impostos (${company.taxPercentage || 0}%):</span>
        <span>R$ ${proposal.tax.toFixed(2)}</span>
      </div>
      <div class="total-row grand-total">
        <span>TOTAL:</span>
        <span>R$ ${proposal.total.toFixed(2)}</span>
      </div>
    </div>

    <!-- Payment Terms -->
    <div class="section">
      <div class="section-title">CONDIÇÕES COMERCIAIS</div>
      <div style="font-size: 11px; line-height: 1.8;">
        <div><strong>Prazo de Pagamento:</strong> ${proposal.paymentTerms}</div>
        <div><strong>Validade da Proposta:</strong> ${proposal.validity} dias a partir da data acima</div>
      </div>
    </div>

    <!-- Observations -->
    ${proposal.observations ? `
    <div class="observations">
      <strong>Observações:</strong><br>
      ${proposal.observations}
    </div>
    ` : ""}

    <!-- Signature Area -->
    <div class="signature-area">
      <div class="signature-line">
        Assinatura e Carimbo
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>Esta proposta foi gerada automaticamente pelo sistema Licitador Inteligente</p>
      <p>Conforme Lei 14.133/2021</p>
    </div>
  </div>
</body>
</html>
  `;
}
