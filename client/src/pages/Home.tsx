import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { FileText, Settings, BarChart3, Upload, CheckCircle2, AlertCircle } from "lucide-react";

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          <p className="text-white mt-4">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold text-white mb-4">Licitador Inteligente</h1>
              <p className="text-xl text-slate-300 mb-8">Plataforma completa para gestao de licitacoes publicas conforme Lei 14.133/2021</p>
              <a href={getLoginUrl()}>
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  Entrar com Manus
                </Button>
              </a>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mt-16">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <Upload className="h-8 w-8 text-blue-400 mb-2" />
                  <CardTitle className="text-white">Upload de Editais</CardTitle>
                  <CardDescription>Envie PDFs e Word para analise automatica</CardDescription>
                </CardHeader>
                <CardContent className="text-slate-300">
                  Extraia automaticamente prazos, requisitos de habilitacao e itens/lotes usando IA
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <BarChart3 className="h-8 w-8 text-green-400 mb-2" />
                  <CardTitle className="text-white">Calculadora de Precos</CardTitle>
                  <CardDescription>Precifique produtos e servicos</CardDescription>
                </CardHeader>
                <CardContent className="text-slate-300">
                  Calcule automaticamente custos, impostos, margens e frete com precisao
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <FileText className="h-8 w-8 text-purple-400 mb-2" />
                  <CardTitle className="text-white">Gerador de Propostas</CardTitle>
                  <CardDescription>Crie propostas em PDF</CardDescription>
                </CardHeader>
                <CardContent className="text-slate-300">
                  Gere automaticamente propostas comerciais e declaracoes conforme Lei 14.133/2021
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <Settings className="h-8 w-8 text-orange-400 mb-2" />
                  <CardTitle className="text-white">Gestao de Documentos</CardTitle>
                  <CardDescription>Controle de validade</CardDescription>
                </CardHeader>
                <CardContent className="text-slate-300">
                  Gerencie documentos da empresa com alertas automaticos de vencimento
                </CardContent>
              </Card>
            </div>

            <div className="mt-16 p-8 bg-slate-800 rounded-lg border border-slate-700">
              <h2 className="text-2xl font-bold text-white mb-4">Conformidade com Lei 14.133/2021</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-slate-300">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                  <span>Habilitacao juridica, tecnica, fiscal e economico-financeira</span>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                  <span>Controle de validade de documentos (180 dias)</span>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                  <span>Declaracoes padrao e customizadas</span>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                  <span>Analise inteligente de editais com IA</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-2">Bem-vindo ao Licitador Inteligente</h1>
            <p className="text-lg text-muted-foreground">Gerencie suas licitacoes publicas de forma inteligente e eficiente</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurar Empresa</CardTitle>
                <CardDescription>Comece preenchendo os dados da sua empresa</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Configure CNPJ, regime tributario, dados bancarios e logomarca
                </p>
                <Button onClick={() => setLocation("/settings/company")} className="w-full">
                  Ir para Configuracoes
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upload de Editais</CardTitle>
                <CardDescription>Analise automatica com IA</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Envie seus editais em PDF ou Word para analise automatica
                </p>
                <Button onClick={() => setLocation("/tenders")} className="w-full">
                  Ir para Editais
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
