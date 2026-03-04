import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { trpc } from "@/lib/trpc";
import { Loader2, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

const formSchema = z.object({
  cnpj: z.string().min(14, "CNPJ deve conter 14 digitos"),
  companyName: z.string().min(3, "Nome da empresa obrigatorio"),
  legalName: z.string().optional(),
  taxRegime: z.enum(["simples_nacional", "lucro_presumido", "lucro_real"]),
  taxPercentage: z.coerce.number().min(0).max(100, "Percentual deve estar entre 0 e 100"),
});

type FormValues = z.infer<typeof formSchema>;

// Validar CNPJ usando algoritmo de checksum
function validateCNPJ(cnpj: string): boolean {
  const cleanCNPJ = cnpj.replace(/\D/g, "");
  if (cleanCNPJ.length !== 14) return false;
  
  // Rejeitar CNPJs com todos os dígitos iguais
  if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false;
  
  // Validar primeiro dígito verificador
  let sum = 0;
  let multiplier = 5;
  for (let i = 0; i < 8; i++) {
    sum += parseInt(cleanCNPJ[i]) * multiplier;
    multiplier = multiplier === 2 ? 9 : multiplier - 1;
  }
  
  let remainder = sum % 11;
  let digit1 = remainder < 2 ? 0 : 11 - remainder;
  
  if (parseInt(cleanCNPJ[8]) !== digit1) return false;
  
  // Validar segundo dígito verificador
  sum = 0;
  multiplier = 6;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCNPJ[i]) * multiplier;
    multiplier = multiplier === 2 ? 9 : multiplier - 1;
  }
  
  remainder = sum % 11;
  let digit2 = remainder < 2 ? 0 : 11 - remainder;
  
  return parseInt(cleanCNPJ[9]) === digit2;
}

export function CompanySetupForm({ onSuccess }: { onSuccess?: () => void }) {
  const [cnpjData, setCnpjData] = useState<any>(null);
  const [cnpjStatus, setCnpjStatus] = useState<"idle" | "valid" | "invalid" | "searching" | "found" | "not_found">("idle");
  const [autoSearchTimeout, setAutoSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const utils = trpc.useUtils();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      cnpj: "",
      companyName: "",
      legalName: "",
      taxRegime: "simples_nacional",
      taxPercentage: 0,
    } as any,
  });

  const searchCNPJMutation = trpc.company.searchCNPJ.useQuery(
    { cnpj: form.watch("cnpj") },
    { enabled: false }
  );

  const upsertMutation = trpc.company.upsert.useMutation({
    onSuccess: async () => {
      toast.success("Empresa cadastrada com sucesso!");
      await utils.company.getProfile.invalidate();
      form.reset();
      setCnpjData(null);
      setCnpjStatus("idle");
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao cadastrar empresa");
    },
  });

  // Validação e busca automática em tempo real
  useEffect(() => {
    const cnpj = form.watch("cnpj");
    
    // Limpar timeout anterior
    if (autoSearchTimeout) {
      clearTimeout(autoSearchTimeout);
    }

    if (!cnpj || cnpj.length === 0) {
      setCnpjStatus("idle");
      setCnpjData(null);
      return;
    }

    // Validar formato
    if (cnpj.length < 14) {
      setCnpjStatus("invalid");
      setCnpjData(null);
      return;
    }

    // Validar CNPJ usando checksum
    if (!validateCNPJ(cnpj)) {
      setCnpjStatus("invalid");
      setCnpjData(null);
      return;
    }

    // CNPJ é válido, mostrar status
    setCnpjStatus("valid");

    // Buscar automaticamente após 500ms de inatividade
    const timeout = setTimeout(async () => {
      setCnpjStatus("searching");
      try {
        const result = await searchCNPJMutation.refetch();
        if (result.data?.success && result.data.data) {
          setCnpjData(result.data.data);
          form.setValue("companyName", result.data.data.name || "");
          form.setValue("legalName", result.data.data.legalName || "");
          setCnpjStatus("found");
        } else {
          setCnpjStatus("not_found");
        }
      } catch (error) {
        console.error("Erro ao buscar CNPJ:", error);
        setCnpjStatus("not_found");
      }
    }, 500);

    setAutoSearchTimeout(timeout);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [form.watch("cnpj")]);

  const handleManualSearch = async () => {
    const cnpj = form.getValues("cnpj");
    if (!cnpj || cnpj.length < 14) {
      toast.error("Digite um CNPJ válido");
      return;
    }

    if (!validateCNPJ(cnpj)) {
      toast.error("CNPJ inválido");
      return;
    }

    setCnpjStatus("searching");
    try {
      const result = await searchCNPJMutation.refetch();
      if (result.data?.success && result.data.data) {
        setCnpjData(result.data.data);
        form.setValue("companyName", result.data.data.name || "");
        form.setValue("legalName", result.data.data.legalName || "");
        setCnpjStatus("found");
        toast.success("Dados encontrados!");
      } else {
        setCnpjStatus("not_found");
        toast.error("CNPJ não encontrado na base de dados");
      }
    } catch (error) {
      console.error("Erro ao buscar CNPJ:", error);
      setCnpjStatus("not_found");
      toast.error("Erro ao buscar CNPJ");
    }
  };

  const onSubmit = (values: FormValues) => {
    upsertMutation.mutate({
      ...values,
      taxPercentage: typeof values.taxPercentage === 'string' ? parseFloat(values.taxPercentage) : values.taxPercentage,
    });
  };

  const getCNPJStatusIcon = () => {
    switch (cnpjStatus) {
      case "valid":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "invalid":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "searching":
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      case "found":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "not_found":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getCNPJStatusMessage = () => {
    switch (cnpjStatus) {
      case "valid":
        return "CNPJ válido - buscando dados...";
      case "invalid":
        return "CNPJ inválido";
      case "searching":
        return "Buscando dados da empresa...";
      case "found":
        return "Dados encontrados com sucesso!";
      case "not_found":
        return "CNPJ não encontrado. Preencha os dados manualmente.";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configurar Dados da Empresa</CardTitle>
          <CardDescription>Preencha as informações da sua empresa para começar</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <h3 className="font-semibold text-sm">1. Buscar Dados via CNPJ</h3>
                <div className="flex flex-col sm:flex-row gap-2">
                  <FormField
                    control={form.control}
                    name="cnpj"
                    render={({ field }) => (
                      <FormItem className="flex-1 w-full">
                        <FormLabel>CNPJ</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="00.000.000/0000-00"
                            {...field}
                            onChange={(e) => {
                              let value = e.target.value.replace(/\D/g, "");
                              if (value.length > 14) value = value.slice(0, 14);
                              field.onChange(value);
                            }}
                            className={cnpjStatus === "invalid" ? "border-red-500" : cnpjStatus === "valid" || cnpjStatus === "found" ? "border-green-500" : ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    onClick={handleManualSearch}
                    disabled={cnpjStatus === "searching" || form.getValues("cnpj").length < 14 || cnpjStatus === "invalid"}
                    className="mt-8 sm:mt-8 w-full sm:w-auto"
                    variant="outline"
                  >
                    {cnpjStatus === "searching" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Buscar"
                    )}
                  </Button>
                </div>

                {/* Status message */}
                {cnpjStatus !== "idle" && (
                  <div className={`flex items-center gap-2 text-sm p-3 rounded-md ${
                    cnpjStatus === "valid" ? "bg-blue-50 text-blue-700" :
                    cnpjStatus === "invalid" ? "bg-red-50 text-red-700" :
                    cnpjStatus === "searching" ? "bg-blue-50 text-blue-700" :
                    cnpjStatus === "found" ? "bg-green-50 text-green-700" :
                    "bg-yellow-50 text-yellow-700"
                  }`}>
                    {getCNPJStatusIcon()}
                    <span>{getCNPJStatusMessage()}</span>
                  </div>
                )}

                {/* Found data preview */}
                {cnpjData && cnpjStatus === "found" && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md space-y-2">
                    <p className="text-sm font-semibold text-green-900">Dados Encontrados:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-green-800">
                      <div>
                        <p className="font-semibold">Razão Social:</p>
                        <p>{cnpjData.name}</p>
                      </div>
                      {cnpjData.legalName && (
                        <div>
                          <p className="font-semibold">Nome Fantasia:</p>
                          <p>{cnpjData.legalName}</p>
                        </div>
                      )}
                      {cnpjData.city && (
                        <div>
                          <p className="font-semibold">Cidade:</p>
                          <p>{cnpjData.city}, {cnpjData.state}</p>
                        </div>
                      )}
                      {cnpjData.status && (
                        <div>
                          <p className="font-semibold">Situação:</p>
                          <p>{cnpjData.status}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <h3 className="font-semibold text-sm">2. Informações da Empresa</h3>
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Razão Social</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome da empresa" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="legalName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Fantasia</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome fantasia (opcional)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <h3 className="font-semibold text-sm">3. Informações Fiscais</h3>
                <FormField
                  control={form.control}
                  name="taxRegime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Regime Tributário</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="simples_nacional">Simples Nacional</SelectItem>
                          <SelectItem value="lucro_presumido">Lucro Presumido</SelectItem>
                          <SelectItem value="lucro_real">Lucro Real</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>Selecione o regime tributário</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="taxPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Percentual de Imposto (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Ex: 15.5"
                          step="0.01"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Percentual total de impostos</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" disabled={upsertMutation.isPending} className="w-full">
                {upsertMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Configurações"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
