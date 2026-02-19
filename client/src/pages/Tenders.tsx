import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TenderUpload } from "@/components/TenderUpload";
import { trpc } from "@/lib/trpc";
import { Trash2, Eye, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Tenders() {
  const [, setLocation] = useLocation();
  const { data: tenders = [], isLoading, refetch } = trpc.tenders.listTenders.useQuery();
  const deleteMutation = trpc.tenders.deleteTender.useMutation();

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar este edital?")) return;

    try {
      const result = await deleteMutation.mutateAsync({ id });
      if (result.success) {
        toast.success("Edital deletado");
        refetch();
      } else {
        toast.error("Erro ao deletar edital");
      }
    } catch (error) {
      toast.error("Erro ao deletar edital");
    }
  };

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Editais</h1>
        <p className="text-gray-600 mt-2">Gerencie e analise seus editais de licitacao</p>
      </div>

      <TenderUpload />

      <div>
        <h2 className="text-2xl font-bold mb-4">Editais Analisados</h2>
        {isLoading ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-600">Carregando editais...</p>
            </CardContent>
          </Card>
        ) : tenders.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-600">Nenhum edital analisado ainda</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {tenders.map((tender) => (
              <Card key={tender.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{tender.fileName}</CardTitle>
                      <CardDescription>
                        Analisado em {format(new Date(tender.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </CardDescription>
                    </div>
                    <Badge className={getRiskColor(tender.riskLevel || "medium")}>
                      Risco: {getRiskLabel(tender.riskLevel || "medium")}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {tender.tenderObject && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Objeto da Licitacao</p>
                      <p className="text-sm text-gray-600">{tender.tenderObject}</p>
                    </div>
                  )}

                  {tender.analysisStatus === "completed" && (
                    <div className="flex items-center gap-2 text-green-700 text-sm">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Analise concluida</span>
                    </div>
                  )}

                  {tender.analysisStatus === "error" && (
                    <div className="flex items-center gap-2 text-red-700 text-sm">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Erro na analise</span>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setLocation(`/tenders/${tender.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalhes
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(tender.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
