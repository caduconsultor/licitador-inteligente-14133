import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, CheckCircle2, Clock, FileText, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";

const DOCUMENT_TYPES = [
  { value: "cnpj", label: "CNPJ" },
  { value: "certidao_judicial", label: "Certidao Judicial" },
  { value: "certidao_negativa_federal", label: "Certidao Negativa Federal" },
  { value: "certidao_negativa_estadual", label: "Certidao Negativa Estadual" },
  { value: "fgts", label: "FGTS" },
  { value: "inss", label: "INSS" },
  { value: "justica_trabalho", label: "Justica do Trabalho" },
  { value: "balanco_patrimonial", label: "Balanco Patrimonial" },
  { value: "dre", label: "DRE" },
  { value: "atestado_tecnico", label: "Atestado Tecnico" },
  { value: "outro", label: "Outro" },
];

export default function Documents() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<string>("");
  const [expirationDate, setExpirationDate] = useState<string>("");

  const listQuery = trpc.documents.listDocuments.useQuery();
  const uploadMutation = trpc.documents.uploadDocument.useMutation({
    onSuccess: () => {
      toast.success("Documento enviado com sucesso!");
      setSelectedFile(null);
      setDocumentType("");
      setExpirationDate("");
      listQuery.refetch();
    },
    onError: (error) => {
      toast.error("Erro ao enviar documento: " + error.message);
    },
  });

  const deleteMutation = trpc.documents.deleteDocument.useMutation({
    onSuccess: () => {
      toast.success("Documento removido!");
      listQuery.refetch();
    },
    onError: () => {
      toast.error("Erro ao remover documento");
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Arquivo muito grande (máximo 10MB)");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !documentType) {
      toast.error("Selecione um arquivo e tipo de documento");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = (e.target?.result as string).split(",")[1];
      uploadMutation.mutate({
        fileName: selectedFile.name,
        fileContent: base64,
        mimeType: selectedFile.type,
        documentType,
        expirationDate: expirationDate || undefined,
      });
    };
    reader.readAsDataURL(selectedFile);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "valid":
        return "text-green-600 bg-green-50";
      case "warning":
        return "text-yellow-600 bg-yellow-50";
      case "critical":
        return "text-red-600 bg-red-50";
      case "expired":
        return "text-red-700 bg-red-100";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "valid":
        return <CheckCircle2 className="w-5 h-5" />;
      case "warning":
        return <Clock className="w-5 h-5" />;
      case "critical":
        return <AlertCircle className="w-5 h-5" />;
      case "expired":
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Documentos</h1>
          <p className="text-gray-600 mt-2">Gerencie seus documentos de habilitação com alertas automáticos de vencimento</p>
        </div>

        {/* Upload Card */}
        <Card>
          <CardHeader>
            <CardTitle>Enviar Novo Documento</CardTitle>
            <CardDescription>Faça upload de certidões, registros e outros documentos necessários</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de Documento</Label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de documento" />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Data de Vencimento (opcional)</Label>
              <Input
                type="date"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
              />
              <p className="text-sm text-gray-500">Se não preenchido, será considerado 180 dias a partir de hoje</p>
            </div>

            <div className="space-y-2">
              <Label>Arquivo</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition">
                <input
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-input"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                <label htmlFor="file-input" className="cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm font-medium">
                    {selectedFile ? selectedFile.name : "Clique para selecionar ou arraste um arquivo"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX, JPG, PNG (máx. 10MB)</p>
                </label>
              </div>
            </div>

            <Button
              onClick={handleUpload}
              disabled={!selectedFile || !documentType || uploadMutation.isPending}
              className="w-full"
            >
              {uploadMutation.isPending ? "Enviando..." : "Enviar Documento"}
            </Button>
          </CardContent>
        </Card>

        {/* Documents List */}
        <Card>
          <CardHeader>
            <CardTitle>Meus Documentos</CardTitle>
            <CardDescription>
              {listQuery.data?.length || 0} documento(s) cadastrado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {listQuery.isLoading ? (
              <p className="text-gray-500">Carregando documentos...</p>
            ) : listQuery.data?.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nenhum documento cadastrado ainda</p>
            ) : (
              <div className="space-y-3">
                {listQuery.data?.map((doc: any) => (
                  <div
                    key={doc.id}
                    className={`flex items-center justify-between p-4 rounded-lg border ${getStatusColor(
                      doc.status
                    )}`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {getStatusIcon(doc.status)}
                      <div className="flex-1">
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-sm opacity-75">
                          {DOCUMENT_TYPES.find((t) => t.value === doc.documentType)?.label || doc.documentType}
                        </p>
                        {doc.expirationDate && (
                          <p className="text-xs opacity-75 mt-1">
                            Vence em: {new Date(doc.expirationDate).toLocaleDateString("pt-BR")}
                            {doc.daysUntilExpiration >= 0
                              ? ` (${doc.daysUntilExpiration} dias)`
                              : " (VENCIDO)"}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMutation.mutate({ id: doc.id })}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alerts */}
        {listQuery.data?.some((doc: any) => doc.status === "critical" || doc.status === "expired") && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-700">Alertas de Vencimento</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {listQuery.data
                  ?.filter((doc: any) => doc.status === "critical" || doc.status === "expired")
                  .map((doc: any) => (
                    <li key={doc.id} className="text-sm text-red-700">
                      • {doc.name} vence em{" "}
                      {doc.expirationDate
                        ? new Date(doc.expirationDate).toLocaleDateString("pt-BR")
                        : "data desconhecida"}
                    </li>
                  ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
