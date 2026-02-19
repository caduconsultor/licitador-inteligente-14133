import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, AlertTriangle, CheckCircle2, FileText } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const REQUIRED_DOCUMENTS = {
  juridical: [
    "Ato constitutivo da empresa",
    "Comprovante de inscricao no CNPJ",
    "Comprovante de regularidade fiscal",
  ],
  technical: [
    "Atestado de capacidade tecnica",
    "Certificacoes e qualificacoes",
    "Referencias de trabalhos anteriores",
  ],
  fiscal: [
    "Comprovante de regularidade com Receita Federal",
    "Comprovante de regularidade com FGTS",
    "Comprovante de regularidade com Seguridade Social",
    "Comprovante de regularidade com Justica do Trabalho",
  ],
  economic: [
    "Balanco patrimonial",
    "Demonstracao de resultado do exercicio",
    "Comprovante de patrimonio minimo",
  ],
};

export default function TenderDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({});

  const { data: tender, isLoading } = trpc.tenders.getTender.useQuery(
    { id: parseInt(id || "0") },
    { enabled: !!id }
  );

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRiskLabel = (risk: string) => {
    switch (risk) {
      case "low":
        return "Baixo";
      case "medium":
        return "Medio";
      case "high":
        return "Alto";
      default:
        return "Desconhecido";
    }
  };

  const handleCheckDoc = (docKey: string) => {
    setCheckedDocs((prev) => ({
      ...prev,
      [docKey]: !prev[docKey],
    }));
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => setLocation("/tenders")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">Carregando edital...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!tender) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => setLocation("/tenders")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">Edital nao encontrado</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const requirements = tender.habilitationRequirements as any || {};
  const items = tender.items as any[] || [];

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => setLocation("/tenders")}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar para Editais
      </Button>

      <div>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold">{tender.title}</h1>
            <p className="text-gray-600 mt-2">
              Analisado em {format(new Date(tender.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </div>
          <Badge className={getRiskColor(tender.riskLevel || "medium")}>
            Risco: {getRiskLabel(tender.riskLevel || "medium")}
          </Badge>
        </div>
      </div>

      {tender.tenderObject && (
        <Card>
          <CardHeader>
            <CardTitle>Objeto da Licitacao</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{tender.tenderObject}</p>
          </CardContent>
        </Card>
      )}

      {tender.estimatedValue && (
        <Card>
          <CardHeader>
            <CardTitle>Valor Estimado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">R$ {tender.estimatedValue}</p>
          </CardContent>
        </Card>
      )}

      {items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Itens/Lotes</CardTitle>
            <CardDescription>Produtos ou servicos a serem fornecidos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {items.map((item: any, idx: number) => (
                <div key={idx} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium">Item {item.number || idx + 1}</p>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{item.quantity} {item.unit}</p>
                      {item.estimatedValue && (
                        <p className="text-sm text-gray-600">R$ {item.estimatedValue}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Requisitos de Habilitacao</CardTitle>
          <CardDescription>Conforme Lei 14.133/2021</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(REQUIRED_DOCUMENTS).map(([category, docs]) => {
            const categoryReqs = requirements[category] || [];
            const categoryLabel =
              category === "juridical"
                ? "Juridica"
                : category === "technical"
                ? "Tecnica"
                : category === "fiscal"
                ? "Fiscal, Social e Trabalhista"
                : "Economico-Financeira";

            return (
              <div key={category} className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3">Habilitacao {categoryLabel}</h3>
                <div className="space-y-2">
                  {docs.map((doc) => (
                    <div key={doc} className="flex items-center space-x-2">
                      <Checkbox
                        id={doc}
                        checked={checkedDocs[doc] || false}
                        onCheckedChange={() => handleCheckDoc(doc)}
                      />
                      <label
                        htmlFor={doc}
                        className="text-sm cursor-pointer flex-1"
                      >
                        {doc}
                      </label>
                      {checkedDocs[doc] && (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {tender.judgmentCriteria && (
        <Card>
          <CardHeader>
            <CardTitle>Criterios de Julgamento</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{tender.judgmentCriteria}</p>
          </CardContent>
        </Card>
      )}

      {tender.deadlineSubmission && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Prazo para envio de propostas:</strong>{" "}
            {format(new Date(tender.deadlineSubmission), "dd/MM/yyyy HH:mm", { locale: ptBR })}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setLocation("/tenders")}>
          Voltar
        </Button>
        <Button>
          <FileText className="h-4 w-4 mr-2" />
          Gerar Proposta
        </Button>
      </div>
    </div>
  );
}
