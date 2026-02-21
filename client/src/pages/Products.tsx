import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Upload, Trash2, Edit2 } from "lucide-react";
import { toast } from "sonner";
import Papa from "papaparse";

const productSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  brand: z.string().optional(),
  model: z.string().optional(),
  unit: z.string().min(1, "Unidade é obrigatória"),
  cost: z.coerce.number().min(0, "Custo deve ser positivo"),
});

const supplierSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  cnpj: z.string().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
});

type ProductFormData = z.infer<typeof productSchema>;
type SupplierFormData = z.infer<typeof supplierSchema>;

export default function Products() {
  const [openProductDialog, setOpenProductDialog] = useState(false);
  const [openSupplierDialog, setOpenSupplierDialog] = useState(false);

  const { data: products, refetch: refetchProducts } = trpc.products.list.useQuery();
  const { data: suppliers, refetch: refetchSuppliers } = trpc.suppliers.list.useQuery();

  const createProductMutation = trpc.products.create.useMutation();
  const deleteProductMutation = trpc.products.delete.useMutation();
  const importProductsMutation = trpc.products.importCSV.useMutation();

  const createSupplierMutation = trpc.suppliers.create.useMutation();
  const deleteSupplierMutation = trpc.suppliers.delete.useMutation();

  const productForm = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: { name: "", brand: "", model: "", unit: "un", cost: 0 },
  });

  const supplierForm = useForm({
    resolver: zodResolver(supplierSchema),
    defaultValues: { name: "", cnpj: "", phone: "", whatsapp: "", email: "" },
  });

  const handleCreateProduct = async (data: any) => {
    try {
      await createProductMutation.mutateAsync({
        ...data,
        cost: data.cost,
      });
      toast.success("Produto criado com sucesso!");
      productForm.reset();
      setOpenProductDialog(false);
      refetchProducts();
    } catch (error) {
      toast.error("Erro ao criar produto");
    }
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      await deleteProductMutation.mutateAsync({ id });
      toast.success("Produto deletado com sucesso!");
      refetchProducts();
    } catch (error) {
      toast.error("Erro ao deletar produto");
    }
  };

  const handleCreateSupplier = async (data: any) => {
    try {
      await createSupplierMutation.mutateAsync(data);
      toast.success("Fornecedor criado com sucesso!");
      supplierForm.reset();
      setOpenSupplierDialog(false);
      refetchSuppliers();
    } catch (error) {
      toast.error("Erro ao criar fornecedor");
    }
  };

  const handleDeleteSupplier = async (id: number) => {
    try {
      await deleteSupplierMutation.mutateAsync({ id });
      toast.success("Fornecedor deletado com sucesso!");
      refetchSuppliers();
    } catch (error) {
      toast.error("Erro ao deletar fornecedor");
    }
  };

  const handleCSVImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results: any) => {
        try {
          const csvData = results.data.map((row: any) => ({
            name: row.name || row.Nome || "",
            brand: row.brand || row.Marca || "",
            model: row.model || row.Modelo || "",
            unit: row.unit || row.Unidade || "un",
            cost: parseFloat(row.cost || row.Custo || "0"),
          }));

          await importProductsMutation.mutateAsync({ csvData });
          toast.success(`${csvData.length} produtos importados com sucesso!`);
          refetchProducts();
        } catch (error) {
          toast.error("Erro ao importar produtos");
        }
      },
      error: (error: any) => {
        toast.error("Erro ao ler arquivo CSV");
      },
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Produtos e Fornecedores</h1>
          <p className="text-gray-600 mt-2">Gerencie seu catálogo de produtos e fornecedores</p>
        </div>

        <Tabs defaultValue="products" className="w-full">
          <TabsList>
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="suppliers">Fornecedores</TabsTrigger>
          </TabsList>

          {/* Aba de Produtos */}
          <TabsContent value="products">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Produtos</CardTitle>
                  <CardDescription>Cadastre e gerencie seus produtos</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Dialog open={openProductDialog} onOpenChange={setOpenProductDialog}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Novo Produto
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Novo Produto</DialogTitle>
                        <DialogDescription>Adicione um novo produto ao seu catálogo</DialogDescription>
                      </DialogHeader>
                      <Form {...productForm}>
                        <form onSubmit={productForm.handleSubmit(handleCreateProduct)} className="space-y-4">
                          <FormField
                            control={productForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nome do Produto</FormLabel>
                                <FormControl>
                                  <Input placeholder="Ex: Parafuso M8" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={productForm.control}
                            name="brand"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Marca</FormLabel>
                                <FormControl>
                                  <Input placeholder="Ex: Tigre" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={productForm.control}
                            name="model"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Modelo</FormLabel>
                                <FormControl>
                                  <Input placeholder="Ex: Premium" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={productForm.control}
                            name="unit"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Unidade</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="un">Unidade</SelectItem>
                                    <SelectItem value="kg">Quilograma</SelectItem>
                                    <SelectItem value="m">Metro</SelectItem>
                                    <SelectItem value="m2">Metro Quadrado</SelectItem>
                                    <SelectItem value="m3">Metro Cúbico</SelectItem>
                                    <SelectItem value="l">Litro</SelectItem>
                                    <SelectItem value="h">Hora</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={productForm.control}
                            name="cost"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Custo Unitário (R$)</FormLabel>
                                <FormControl>
                                  <Input type="number" step="0.01" placeholder="0.00" value={field.value?.toString() || "0"} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button type="submit" className="w-full">
                            Criar Produto
                          </Button>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>

                  <label>
                    <Button variant="outline" asChild>
                      <span>
                        <Upload className="w-4 h-4 mr-2" />
                        Importar CSV
                      </span>
                    </Button>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleCSVImport}
                      className="hidden"
                    />
                  </label>
                </div>
              </CardHeader>
              <CardContent>
                {!products || products.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Nenhum produto cadastrado</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-2">Nome</th>
                          <th className="text-left py-2 px-2">Marca</th>
                          <th className="text-left py-2 px-2">Modelo</th>
                          <th className="text-left py-2 px-2">Unidade</th>
                          <th className="text-right py-2 px-2">Custo</th>
                          <th className="text-center py-2 px-2">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((product) => (
                          <tr key={product.id} className="border-b hover:bg-gray-50">
                            <td className="py-2 px-2 font-medium">{product.name}</td>
                            <td className="py-2 px-2">{product.brand || "-"}</td>
                            <td className="py-2 px-2">{product.model || "-"}</td>
                            <td className="py-2 px-2">{product.unit}</td>
                            <td className="text-right py-2 px-2">
                              R$ {parseFloat(product.cost.toString()).toLocaleString("pt-BR", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </td>
                            <td className="text-center py-2 px-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteProduct(product.id)}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba de Fornecedores */}
          <TabsContent value="suppliers">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Fornecedores</CardTitle>
                  <CardDescription>Cadastre e gerencie seus fornecedores</CardDescription>
                </div>
                <Dialog open={openSupplierDialog} onOpenChange={setOpenSupplierDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Novo Fornecedor
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Novo Fornecedor</DialogTitle>
                      <DialogDescription>Adicione um novo fornecedor</DialogDescription>
                    </DialogHeader>
                    <Form {...supplierForm}>
                      <form onSubmit={supplierForm.handleSubmit(handleCreateSupplier)} className="space-y-4">
                        <FormField
                          control={supplierForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome do Fornecedor</FormLabel>
                              <FormControl>
                                <Input placeholder="Ex: Distribuidora ABC" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={supplierForm.control}
                          name="cnpj"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CNPJ</FormLabel>
                              <FormControl>
                                <Input placeholder="00.000.000/0000-00" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={supplierForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Telefone</FormLabel>
                              <FormControl>
                                <Input placeholder="(11) 3000-0000" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={supplierForm.control}
                          name="whatsapp"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>WhatsApp</FormLabel>
                              <FormControl>
                                <Input placeholder="(11) 99999-9999" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={supplierForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="contato@fornecedor.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit" className="w-full">
                          Criar Fornecedor
                        </Button>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {!suppliers || suppliers.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Nenhum fornecedor cadastrado</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-2">Nome</th>
                          <th className="text-left py-2 px-2">CNPJ</th>
                          <th className="text-left py-2 px-2">Telefone</th>
                          <th className="text-left py-2 px-2">Email</th>
                          <th className="text-center py-2 px-2">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {suppliers.map((supplier) => (
                          <tr key={supplier.id} className="border-b hover:bg-gray-50">
                            <td className="py-2 px-2 font-medium">{supplier.name}</td>
                            <td className="py-2 px-2">{supplier.cnpj || "-"}</td>
                            <td className="py-2 px-2">{supplier.phone || "-"}</td>
                            <td className="py-2 px-2">{supplier.email || "-"}</td>
                            <td className="text-center py-2 px-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteSupplier(supplier.id)}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
