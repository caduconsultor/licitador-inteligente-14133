import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { AlertTriangle, CheckCircle, Clock, FileText, TrendingUp, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const COLORS = ["#10b981", "#f59e0b", "#ef4444"];
const RISK_COLORS = { low: "#10b981", medium: "#f59e0b", high: "#ef4444" };

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = trpc.dashboard.getStatistics.useQuery();
  const { data: timeline, isLoading: timelineLoading } = trpc.dashboard.getTendersTimeline.useQuery();

  if (statsLoading || timelineLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  const riskData = [
    { name: "Baixo Risco", value: stats?.tenders.riskLow || 0, color: "#10b981" },
    { name: "Médio Risco", value: stats?.tenders.riskMedium || 0, color: "#f59e0b" },
    { name: "Alto Risco", value: stats?.tenders.riskHigh || 0, color: "#ef4444" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600 mt-2">Visão geral de suas licitações e propostas</p>
        </div>

        {(stats?.alerts.criticalTenders?.length || 0) > 0 && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>{stats?.alerts.criticalTenders?.length} edital(is)</strong> com prazos críticos nos próximos 7 dias!
            </AlertDescription>
          </Alert>
        )}

        {(stats?.alerts.expiringDocuments?.length || 0) > 0 && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>{stats?.alerts.expiringDocuments?.length} documento(s)</strong> vencerão nos próximos 30 dias!
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total de Editais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.tenders.total || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Editais analisados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Prazos Críticos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{stats?.tenders.critical || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Próximos 7 dias</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Propostas Geradas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.proposals.total || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Total de propostas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Documentos Vencendo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{stats?.documents.expiring || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Próximos 30 dias</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Risco dos Editais</CardTitle>
              <CardDescription>Análise de risco dos editais cadastrados</CardDescription>
            </CardHeader>
            <CardContent>
              {stats?.tenders.total === 0 ? (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  Nenhum edital cadastrado
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={riskData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {riskData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Editais por Mês (Últimos 6 meses)</CardTitle>
              <CardDescription>Tendência de editais cadastrados</CardDescription>
            </CardHeader>
            <CardContent>
              {!timeline || timeline.length === 0 ? (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  Sem dados disponíveis
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={timeline}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" name="Editais" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-red-500" />
                Prazos Críticos
              </CardTitle>
              <CardDescription>Editais com prazo nos próximos 7 dias</CardDescription>
            </CardHeader>
            <CardContent>
              {!stats?.alerts.criticalTenders || stats.alerts.criticalTenders.length === 0 ? (
                <p className="text-gray-500 text-sm">Nenhum edital com prazo crítico</p>
              ) : (
                <div className="space-y-3">
                  {stats.alerts.criticalTenders.map((tender) => (
                    <div key={tender.id} className="flex items-start justify-between p-3 bg-red-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{tender.title}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          {tender.deadlineSubmission
                            ? format(new Date(tender.deadlineSubmission), "dd 'de' MMMM", { locale: ptBR })
                            : "Data não definida"}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`ml-2 ${
                          tender.riskLevel === "high"
                            ? "bg-red-100 text-red-800"
                            : tender.riskLevel === "medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                        }`}
                      >
                        {tender.riskLevel === "high" ? "Alto Risco" : tender.riskLevel === "medium" ? "Médio Risco" : "Baixo Risco"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-500" />
                Documentos Vencendo
              </CardTitle>
              <CardDescription>Documentos que vencem nos próximos 30 dias</CardDescription>
            </CardHeader>
            <CardContent>
              {!stats?.alerts.expiringDocuments || stats.alerts.expiringDocuments.length === 0 ? (
                <p className="text-gray-500 text-sm">Todos os documentos estão válidos</p>
              ) : (
                <div className="space-y-3">
                  {stats.alerts.expiringDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-start justify-between p-3 bg-yellow-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{doc.documentType || "Documento"}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          Vence em:{" "}
                          {doc.expirationDate
                            ? format(new Date(doc.expirationDate), "dd 'de' MMMM", { locale: ptBR })
                            : "Data não definida"}
                        </p>
                      </div>
                      <Badge variant="outline" className="ml-2 bg-yellow-100 text-yellow-800">
                        Atenção
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Propostas Recentes
            </CardTitle>
            <CardDescription>Últimas propostas geradas (últimos 30 dias)</CardDescription>
          </CardHeader>
          <CardContent>
            {!stats?.proposals.recent || stats.proposals.recent.length === 0 ? (
              <p className="text-gray-500 text-sm">Nenhuma proposta gerada recentemente</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2">Título</th>
                      <th className="text-left py-2 px-2">Data</th>
                      <th className="text-right py-2 px-2">Valor Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.proposals.recent.map((proposal) => (
                      <tr key={proposal.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-2">{proposal.title}</td>
                        <td className="py-2 px-2">
                          {proposal.createdAt
                            ? format(new Date(proposal.createdAt), "dd/MM/yyyy", { locale: ptBR })
                            : "-"}
                        </td>
                        <td className="text-right py-2 px-2 font-medium">
                          {proposal.totalSale
                            ? `R$ ${parseFloat(proposal.totalSale.toString()).toLocaleString("pt-BR", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}`
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
