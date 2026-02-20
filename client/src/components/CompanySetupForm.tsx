import { useState } from "react";
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
import { Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const formSchema = z.object({
  cnpj: z.string().min(14, "CNPJ deve conter 14 digitos"),
  companyName: z.string().min(3, "Nome da empresa obrigatorio"),
  legalName: z.string().optional(),
  taxRegime: z.enum(["simples_nacional", "lucro_presumido", "lucro_real"]),
  taxPercentage: z.coerce.number().min(0).max(100, "Percentual deve estar entre 0 e 100"),
});

type FormValues = z.infer<typeof formSchema>;

export function CompanySetupForm({ onSuccess }: { onSuccess?: () => void }) {
  const [cnpjData, setCnpjData] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);

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
    onSuccess: () => {
      toast.success("Empresa cadastrada com sucesso!");
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao cadastrar empresa");
    },
  });

  const handleSearchCNPJ = async () => {
    const cnpj = form.getValues("cnpj");
    if (!cnpj || cnpj.length < 14) {
      toast.error("Digite um CNPJ valido");
      return;
    }

    setIsSearching(true);
    try {
      const result = await searchCNPJMutation.refetch();
      if (result.data?.success && result.data.data) {
        setCnpjData(result.data.data);
        form.setValue("companyName", result.data.data.name || "");
        form.setValue("legalName", result.data.data.legalName || "");
        toast.success("Dados encontrados!");
      } else {
        toast.error("CNPJ nao encontrado");
      }
    } catch (error) {
      toast.error("Erro ao buscar CNPJ");
    } finally {
      setIsSearching(false);
    }
  };

  const onSubmit = (values: FormValues) => {
    upsertMutation.mutate({
      ...values,
      taxPercentage: typeof values.taxPercentage === 'string' ? parseFloat(values.taxPercentage) : values.taxPercentage,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configurar Dados da Empresa</CardTitle>
          <CardDescription>Preencha as informacoes da sua empresa para comecar</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
                <h3 className="font-semibold text-sm">1. Buscar Dados via CNPJ</h3>
                <div className="flex gap-2">
                  <FormField
                    control={form.control}
                    name="cnpj"
                    render={({ field }) => (
                      <FormItem className="flex-1">
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
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    onClick={handleSearchCNPJ}
                    disabled={isSearching || form.getValues("cnpj").length < 14}
                    className="mt-8"
                  >
                    {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Buscar"}
                  </Button>
                </div>
                {cnpjData && (
                  <div className="flex items-center gap-2 text-green-600 text-sm">
                    <CheckCircle2 className="h-4 w-4" />
                    Dados encontrados com sucesso
                  </div>
                )}
              </div>

              <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
                <h3 className="font-semibold text-sm">2. Informacoes da Empresa</h3>
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Razao Social</FormLabel>
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

              <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
                <h3 className="font-semibold text-sm">3. Informacoes Fiscais</h3>
                <FormField
                  control={form.control}
                  name="taxRegime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Regime Tributario</FormLabel>
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
                      <FormDescription>Selecione o regime tributario</FormDescription>
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
                  "Salvar Configuracoes"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
