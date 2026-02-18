import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { CompanySetupForm } from "@/components/CompanySetupForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export default function CompanySettings() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { data: company, isLoading } = trpc.company.getProfile.useQuery();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acesso Restrito</CardTitle>
            <CardDescription>Voce precisa estar autenticado</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/")} className="w-full">Voltar</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Configuracoes da Empresa</h1>
          <p className="text-muted-foreground mt-2">Gerencie os dados e documentos da sua empresa</p>
        </div>

        {company ? (
          <div className="space-y-6">
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <CardTitle className="text-green-900">Empresa Configurada</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-green-700 font-semibold">CNPJ</p>
                    <p className="text-green-900">{company.cnpj}</p>
                  </div>
                  <div>
                    <p className="text-sm text-green-700 font-semibold">Razao Social</p>
                    <p className="text-green-900">{company.companyName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-green-700 font-semibold">Regime Tributario</p>
                    <p className="text-green-900">{company.taxRegime}</p>
                  </div>
                  <div>
                    <p className="text-sm text-green-700 font-semibold">Percentual de Imposto</p>
                    <p className="text-green-900">{company.taxPercentage}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Atualizar Dados</CardTitle>
                <CardDescription>Modifique as informacoes da sua empresa</CardDescription>
              </CardHeader>
              <CardContent>
                <CompanySetupForm
                  onSuccess={() => {
                    window.location.reload();
                  }}
                />
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <CardTitle className="text-yellow-900">Empresa nao Configurada</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-yellow-800">Configure sua empresa para comecara usar o sistema</p>
              </CardContent>
            </Card>

            <CompanySetupForm
              onSuccess={() => {
                window.location.reload();
              }}
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
