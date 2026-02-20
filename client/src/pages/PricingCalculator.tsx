import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, DollarSign, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";

export default function PricingCalculator() {
  const [productTab, setProductTab] = useState("products");

  // Product pricing state
  const [productName, setProductName] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [quantity, setQuantity] = useState("");
  const [profitMargin, setProfitMargin] = useState("30");
  const [taxRegime, setTaxRegime] = useState("simples_nacional");
  const [taxPercentage, setTaxPercentage] = useState("15");
  const [freightType, setFreightType] = useState("percentage");
  const [freightValue, setFreightValue] = useState("10");
  const [weight, setWeight] = useState("");

  // BDI state
  const [serviceName, setServiceName] = useState("");
  const [directCost, setDirectCost] = useState("");
  const [laborCost, setLaborCost] = useState("");
  const [equipmentCost, setEquipmentCost] = useState("");
  const [materialCost, setMaterialCost] = useState("");
  const [overheadPercentage, setOverheadPercentage] = useState("20");
  const [profitPercentage, setProfitPercentage] = useState("15");
  const [bdiTaxPercentage, setBdiTaxPercentage] = useState("15");

  const [productResult, setProductResult] = useState<any>(null);
  const [bdiResult, setBdiResult] = useState<any>(null);

  const productMutation = trpc.pricing.calculateProductPrice.useMutation({
    onSuccess: (data) => {
      setProductResult(data);
      toast.success("Cálculo realizado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao calcular: " + error.message);
    },
  });

  const bdiMutation = trpc.pricing.calculateBDI.useMutation({
    onSuccess: (data) => {
      setBdiResult(data);
      toast.success("Cálculo BDI realizado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao calcular BDI: " + error.message);
    },
  });

  const handleCalculateProduct = () => {
    if (!productName || !unitCost || !quantity) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    productMutation.mutate({
      productName,
      unitCost: parseFloat(unitCost),
      quantity: parseFloat(quantity),
      profitMargin: parseFloat(profitMargin),
      taxRegime: taxRegime as any,
      taxPercentage: parseFloat(taxPercentage),
      freightPercentage: freightType === "percentage" ? parseFloat(freightValue) : 0,
      freightType: freightType as any,
      freightValue: freightType !== "percentage" ? parseFloat(freightValue) : 0,
      weight: weight ? parseFloat(weight) : undefined,
    });
  };

  const handleCalculateBDI = () => {
    if (!serviceName || !directCost) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    bdiMutation.mutate({
      serviceName,
      directCost: parseFloat(directCost),
      laborCost: parseFloat(laborCost) || 0,
      equipmentCost: parseFloat(equipmentCost) || 0,
      materialCost: parseFloat(materialCost) || 0,
      overheadPercentage: parseFloat(overheadPercentage),
      profitMarcentage: parseFloat(profitPercentage),
      taxPercentage: parseFloat(bdiTaxPercentage),
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Calculadora de Precificação</h1>
          <p className="text-gray-600 mt-2">Calcule preços de produtos e serviços com precisão</p>
        </div>

        <Tabs value={productTab} onValueChange={setProductTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="services">Serviços/Obras (BDI)</TabsTrigger>
          </TabsList>

          {/* Produtos Tab */}
          <TabsContent value="products" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Formulário */}
              <Card>
                <CardHeader>
                  <CardTitle>Cálculo de Produto</CardTitle>
                  <CardDescription>Preencha os dados do produto para calcular o preço final</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nome do Produto *</Label>
                    <Input
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      placeholder="Ex: Parafuso M8"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Custo Unitário (R$) *</Label>
                      <Input
                        type="number"
                        value={unitCost}
                        onChange={(e) => setUnitCost(e.target.value)}
                        placeholder="0.00"
                        step="0.01"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Quantidade *</Label>
                      <Input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        placeholder="1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Regime Tributário</Label>
                    <Select value={taxRegime} onValueChange={setTaxRegime}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="simples_nacional">Simples Nacional</SelectItem>
                        <SelectItem value="lucro_presumido">Lucro Presumido</SelectItem>
                        <SelectItem value="lucro_real">Lucro Real</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Percentual de Imposto (%)</Label>
                    <Input
                      type="number"
                      value={taxPercentage}
                      onChange={(e) => setTaxPercentage(e.target.value)}
                      placeholder="15"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Margem de Lucro (%)</Label>
                    <Input
                      type="number"
                      value={profitMargin}
                      onChange={(e) => setProfitMargin(e.target.value)}
                      placeholder="30"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Tipo de Frete</Label>
                    <Select value={freightType} onValueChange={setFreightType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentual (%)</SelectItem>
                        <SelectItem value="per_weight">Por Peso (R$/kg)</SelectItem>
                        <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Valor de Frete</Label>
                      <Input
                        type="number"
                        value={freightValue}
                        onChange={(e) => setFreightValue(e.target.value)}
                        placeholder="10"
                        step="0.01"
                      />
                    </div>
                    {freightType === "per_weight" && (
                      <div className="space-y-2">
                        <Label>Peso (kg)</Label>
                        <Input
                          type="number"
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          placeholder="0"
                          step="0.1"
                        />
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={handleCalculateProduct}
                    disabled={productMutation.isPending}
                    className="w-full"
                  >
                    <Calculator className="w-4 h-4 mr-2" />
                    {productMutation.isPending ? "Calculando..." : "Calcular Preço"}
                  </Button>
                </CardContent>
              </Card>

              {/* Resultado */}
              {productResult && (
                <Card className="bg-green-50 border-green-200">
                  <CardHeader>
                    <CardTitle className="text-green-700">Resultado</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">Produto</p>
                      <p className="text-lg font-semibold">{productResult.productName}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Quantidade</p>
                        <p className="text-lg font-semibold">{productResult.quantity}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Preço Unitário</p>
                        <p className="text-lg font-semibold text-green-600">
                          R$ {productResult.unitPrice.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <p className="text-sm text-gray-600 mb-2">Breakdown</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Custo Unitário:</span>
                          <span>R$ {productResult.breakdown.unitCost.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Imposto ({productResult.taxPercentage}%):</span>
                          <span>R$ {productResult.breakdown.tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Frete:</span>
                          <span>R$ {productResult.breakdown.freight.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Lucro ({productResult.profitMargin}%):</span>
                          <span>R$ {productResult.breakdown.profit.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4 bg-white rounded p-3">
                      <p className="text-sm text-gray-600">Preço Total</p>
                      <p className="text-2xl font-bold text-green-600">
                        R$ {productResult.totalPrice.toFixed(2)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Serviços/BDI Tab */}
          <TabsContent value="services" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Formulário */}
              <Card>
                <CardHeader>
                  <CardTitle>Cálculo BDI (Serviços/Obras)</CardTitle>
                  <CardDescription>Calcule preços com Benefícios e Despesas Indiretas</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nome do Serviço/Obra *</Label>
                    <Input
                      value={serviceName}
                      onChange={(e) => setServiceName(e.target.value)}
                      placeholder="Ex: Consultoria de TI"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Custo Direto Base (R$) *</Label>
                    <Input
                      type="number"
                      value={directCost}
                      onChange={(e) => setDirectCost(e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Custo de Mão de Obra (R$)</Label>
                      <Input
                        type="number"
                        value={laborCost}
                        onChange={(e) => setLaborCost(e.target.value)}
                        placeholder="0.00"
                        step="0.01"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Custo de Equipamento (R$)</Label>
                      <Input
                        type="number"
                        value={equipmentCost}
                        onChange={(e) => setEquipmentCost(e.target.value)}
                        placeholder="0.00"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Custo de Material (R$)</Label>
                    <Input
                      type="number"
                      value={materialCost}
                      onChange={(e) => setMaterialCost(e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Overhead (%)</Label>
                      <Input
                        type="number"
                        value={overheadPercentage}
                        onChange={(e) => setOverheadPercentage(e.target.value)}
                        placeholder="20"
                        min="0"
                        max="100"
                        step="0.1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Lucro (%)</Label>
                      <Input
                        type="number"
                        value={profitPercentage}
                        onChange={(e) => setProfitPercentage(e.target.value)}
                        placeholder="15"
                        min="0"
                        max="100"
                        step="0.1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Imposto (%)</Label>
                    <Input
                      type="number"
                      value={bdiTaxPercentage}
                      onChange={(e) => setBdiTaxPercentage(e.target.value)}
                      placeholder="15"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>

                  <Button
                    onClick={handleCalculateBDI}
                    disabled={bdiMutation.isPending}
                    className="w-full"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    {bdiMutation.isPending ? "Calculando..." : "Calcular BDI"}
                  </Button>
                </CardContent>
              </Card>

              {/* Resultado BDI */}
              {bdiResult && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-blue-700">Resultado BDI</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">Serviço/Obra</p>
                      <p className="text-lg font-semibold">{bdiResult.serviceName}</p>
                    </div>

                    <div className="border-t pt-4">
                      <p className="text-sm text-gray-600 mb-2">Custos Diretos</p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Mão de Obra:</span>
                          <span>R$ {bdiResult.directCosts.labor.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Equipamento:</span>
                          <span>R$ {bdiResult.directCosts.equipment.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Material:</span>
                          <span>R$ {bdiResult.directCosts.material.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-semibold border-t pt-1">
                          <span>Total Direto:</span>
                          <span>R$ {bdiResult.directCosts.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <p className="text-sm text-gray-600 mb-2">BDI ({bdiResult.bdiPercentage}%)</p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Overhead:</span>
                          <span>R$ {bdiResult.indirectCosts.overhead.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Lucro:</span>
                          <span>R$ {bdiResult.indirectCosts.profit.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-semibold border-t pt-1">
                          <span>Total BDI:</span>
                          <span>R$ {bdiResult.indirectCosts.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <p className="text-sm text-gray-600">Imposto</p>
                      <p className="text-sm">R$ {bdiResult.taxAmount.toFixed(2)}</p>
                    </div>

                    <div className="border-t pt-4 bg-white rounded p-3">
                      <p className="text-sm text-gray-600">Preço Final</p>
                      <p className="text-2xl font-bold text-blue-600">
                        R$ {bdiResult.finalPrice.toFixed(2)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
