import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export function TenderUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const analyzeTender = trpc.tenders.analyzeTender.useMutation();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = async (file: File) => {
    if (!file.name.match(/\.(pdf|docx?|txt)$/i)) {
      toast.error("Formato nao suportado. Use PDF, Word ou TXT");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Maximo 10MB");
      return;
    }

    setIsLoading(true);
    try {
      const text = await file.text();
      
      const result = await analyzeTender.mutateAsync({
        fileName: file.name,
        fileContent: text,
        mimeType: file.type,
      });

      if (result.success) {
        toast.success("Edital analisado com sucesso!");
      } else {
        toast.error(result.error || "Erro ao analisar edital");
      }
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao processar arquivo");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload de Edital</CardTitle>
        <CardDescription>Envie um PDF ou Word para analise automatica</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 bg-gray-50"
          }`}
        >
          <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium mb-2">Arraste seu edital aqui</p>
          <p className="text-sm text-gray-600 mb-4">ou clique para selecionar</p>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileInput}
            accept=".pdf,.doc,.docx,.txt"
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analisando...
              </>
            ) : (
              "Selecionar Arquivo"
            )}
          </Button>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Formatos suportados: PDF, Word (.doc, .docx), TXT. Tamanho maximo: 10MB
          </AlertDescription>
        </Alert>

        {analyzeTender.data?.success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Edital analisado com sucesso! Verifique a lista de editais.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
