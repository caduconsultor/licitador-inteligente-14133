import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Eye, FileText } from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";

export default function DeclarationsGenerator() {
  const [selectedType, setSelectedType] = useState<"juridica" | "tecnica" | "fiscal" | "economica">("juridica");
  const [previewHTML, setPreviewHTML] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Dados comuns
  const [tenderNumber, setTenderNumber] = useState("");
  const [tenderObject, setTenderObject] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");

  // Dados jurídicos
  const [legalRepName, setLegalRepName] = useState("");
  const [legalRepCPF, setLegalRepCPF] = useState("");
  const [legalRepPosition, setLegalRepPosition] = useState("Representante Legal");

  // Dados técnicos
  const [techName, setTechName] = useState("");
  const [techCPF, setTechCPF] = useState("");
  const [techCREA, setTechCREA] = useState("");
  const [yearsExp, setYearsExp] = useState("");
  const [previousProjects, setPreviousProjects] = useState("");

  const generateMutation = trpc.declarations.generateDeclaration.useMutation({
    onSuccess: (data) => {
      setPreviewHTML(data.html);
      setShowPreview(true);
      toast.success("Declaração gerada com sucesso!");
      downloadPDF(data.html, data.fileName);
    },
    onError: (error) => {
      toast.error("Erro ao gerar declaração: " + error.message);
    },
  });

  const downloadPDF = (html: string, fileName: string) => {
    const element = document.createElement("div");
    element.innerHTML = html;

    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
    document.head.appendChild(script);

    script.onload = () => {
      const opt = {
        margin: 0,
        filename: fileName,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: "portrait", unit: "mm", format: "a4" },
      };
      (window as any).html2pdf().set(opt).from(element).save();
    };
  };

  const handleGenerate = () => {
    generateMutation.mutate({
      type: selectedType,
      tenderNumber: tenderNumber || undefined,
      tenderObject: tenderObject || undefined,
      legalRepresentativeName: legalRepName || undefined,
      legalRepresentativeCPF: legalRepCPF || undefined,
      legalRepresentativePosition: legalRepPosition || undefined,
      technicalResponsibleName: techName || undefined,
      technicalResponsibleCPF: techCPF || undefined,
      technicalResponsibleCREA: techCREA || undefined,
      yearsOfExperience: yearsExp ? parseInt(yearsExp) : undefined,
      previousProjects: previousProjects || undefined,
      additionalInfo: additionalInfo || undefined,
    });
  };

  const declarationTypes = [
    {
      id: "juridica",
      title: "Habilitação Jurídica",
      description: "Declara capacidade jurídica e regularidade da empresa",
      icon: "⚖️",
    },
    {
      id: "tecnica",
      title: "Habilitação Técnica",
      description: "Declara capacidade técnica e experiência profissional",
      icon: "🔧",
    },
    {
      id: "fiscal",
      title: "Habilitação Fiscal, Social e Trabalhista",
      description: "Declara regularidade fiscal, INSS, FGTS e trabalhista",
      icon: "📋",
    },
    {
      id: "economica",
      title: "Habilitação Econômico-Financeira",
      description: "Declara saúde financeira e capacidade econômica",
      icon: "💰",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Gerador de Declarações</h1>
          <p className="text-gray-600 mt-2">Crie declarações padrão Lei 14.133/2021</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {declarationTypes.map((type) => (
            <Card
              key={type.id}
              className={`cursor-pointer transition ${
                selectedType === type.id ? "border-blue-500 bg-blue-50" : "hover:border-gray-400"
              }`}
              onClick={() => setSelectedType(type.id as any)}
            >
              <CardHeader>
                <div className="text-3xl mb-2">{type.icon}</div>
                <CardTitle className="text-base">{type.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-600">{type.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulário */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dados Comuns */}
            <Card>
              <CardHeader>
                <CardTitle>Informações Gerais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Número do Edital (opcional)</Label>
                  <Input
                    value={tenderNumber}
                    onChange={(e) => setTenderNumber(e.target.value)}
                    placeholder="Ex: 2024/001"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Objeto da Licitação (opcional)</Label>
                  <Textarea
                    value={tenderObject}
                    onChange={(e) => setTenderObject(e.target.value)}
                    placeholder="Descrição do objeto"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Dados Específicos por Tipo */}
            {selectedType === "juridica" && (
              <Card>
                <CardHeader>
                  <CardTitle>Dados do Representante Legal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nome do Representante</Label>
                    <Input
                      value={legalRepName}
                      onChange={(e) => setLegalRepName(e.target.value)}
                      placeholder="Nome completo"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>CPF</Label>
                      <Input
                        value={legalRepCPF}
                        onChange={(e) => setLegalRepCPF(e.target.value)}
                        placeholder="000.000.000-00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Cargo/Posição</Label>
                      <Input
                        value={legalRepPosition}
                        onChange={(e) => setLegalRepPosition(e.target.value)}
                        placeholder="Ex: Diretor, Presidente"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedType === "tecnica" && (
              <Card>
                <CardHeader>
                  <CardTitle>Dados do Responsável Técnico</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nome do Responsável</Label>
                    <Input
                      value={techName}
                      onChange={(e) => setTechName(e.target.value)}
                      placeholder="Nome completo"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>CPF</Label>
                      <Input
                        value={techCPF}
                        onChange={(e) => setTechCPF(e.target.value)}
                        placeholder="000.000.000-00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>CREA/CAU</Label>
                      <Input
                        value={techCREA}
                        onChange={(e) => setTechCREA(e.target.value)}
                        placeholder="Número do registro"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Anos de Experiência</Label>
                    <Input
                      type="number"
                      value={yearsExp}
                      onChange={(e) => setYearsExp(e.target.value)}
                      placeholder="Ex: 10"
                      min="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Projetos Anteriores (opcional)</Label>
                    <Textarea
                      value={previousProjects}
                      onChange={(e) => setPreviousProjects(e.target.value)}
                      placeholder="Descreva projetos similares executados"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedType === "fiscal" && (
              <Card>
                <CardHeader>
                  <CardTitle>Dados do Representante Legal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nome do Representante</Label>
                    <Input
                      value={legalRepName}
                      onChange={(e) => setLegalRepName(e.target.value)}
                      placeholder="Nome completo"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>CPF</Label>
                    <Input
                      value={legalRepCPF}
                      onChange={(e) => setLegalRepCPF(e.target.value)}
                      placeholder="000.000.000-00"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedType === "economica" && (
              <Card>
                <CardHeader>
                  <CardTitle>Dados do Representante Legal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nome do Representante</Label>
                    <Input
                      value={legalRepName}
                      onChange={(e) => setLegalRepName(e.target.value)}
                      placeholder="Nome completo"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>CPF</Label>
                    <Input
                      value={legalRepCPF}
                      onChange={(e) => setLegalRepCPF(e.target.value)}
                      placeholder="000.000.000-00"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Informações Adicionais */}
            <Card>
              <CardHeader>
                <CardTitle>Informações Adicionais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Observações (opcional)</Label>
                  <Textarea
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                    placeholder="Adicione informações complementares"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ações */}
          <div className="space-y-6">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Ações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={handleGenerate}
                  disabled={generateMutation.isPending}
                  className="w-full"
                  size="lg"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {generateMutation.isPending ? "Gerando..." : "Gerar Declaração"}
                </Button>

                {previewHTML && (
                  <Button
                    onClick={() => setShowPreview(!showPreview)}
                    variant="outline"
                    className="w-full"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {showPreview ? "Ocultar" : "Visualizar"}
                  </Button>
                )}

                <div className="text-xs text-gray-500 p-3 bg-gray-50 rounded">
                  <p className="font-semibold mb-2">Tipo Selecionado:</p>
                  <p>
                    {declarationTypes.find((t) => t.id === selectedType)?.title}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Preview */}
        {showPreview && previewHTML && (
          <Card>
            <CardHeader>
              <CardTitle>Visualização da Declaração</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="border rounded-lg p-4 bg-white max-h-96 overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: previewHTML }}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
