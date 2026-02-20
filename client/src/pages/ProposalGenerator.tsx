import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Download, Eye } from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";

interface ProposalItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  unit: string;
}

export default function ProposalGenerator() {
  const [proposalNumber, setProposalNumber] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientCNPJ, setClientCNPJ] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [validityDays, setValidityDays] = useState("30");
  const [paymentTerms, setPaymentTerms] = useState("A combinar");
  const [observations, setObservations] = useState("");
  const [tenderNumber, setTenderNumber] = useState("");

  const [items, setItems] = useState<ProposalItem[]>([]);
  const [currentItem, setCurrentItem] = useState<Partial<ProposalItem>>({
    description: "",
    quantity: 1,
    unitPrice: 0,
    unit: "un",
  });

  const [previewHTML, setPreviewHTML] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const generateMutation = trpc.proposals.generateProposalPDF.useMutation({
    onSuccess: (data) => {
      setPreviewHTML(data.html);
      setShowPreview(true);
      toast.success("Proposta gerada com sucesso!");
      downloadPDF(data.html, data.fileName);
    },
    onError: (error) => {
      toast.error("Erro ao gerar proposta: " + error.message);
    },
  });

  const downloadPDF = (html: string, fileName: string) => {
    // Usar WeasyPrint via API ou HTML2PDF no cliente
    const element = document.createElement("div");
    element.innerHTML = html;
    
    // Para download simples, usar html2pdf library
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

  const handleAddItem = () => {
    if (!currentItem.description || !currentItem.quantity || !currentItem.unitPrice) {
      toast.error("Preencha todos os campos do item");
      return;
    }

    const newItem: ProposalItem = {
      id: Math.random().toString(),
      description: currentItem.description || "",
      quantity: currentItem.quantity || 1,
      unitPrice: currentItem.unitPrice || 0,
      unit: currentItem.unit || "un",
    };

    setItems([...items, newItem]);
    setCurrentItem({
      description: "",
      quantity: 1,
      unitPrice: 0,
      unit: "un",
    });
    toast.success("Item adicionado!");
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
    toast.success("Item removido!");
  };

  const handleGenerateProposal = () => {
    if (!proposalNumber || !clientName || items.length === 0) {
      toast.error("Preencha número da proposta, nome do cliente e adicione itens");
      return;
    }

    generateMutation.mutate({
      proposalNumber,
      clientName,
      clientCNPJ: clientCNPJ || undefined,
      clientEmail: clientEmail || undefined,
      clientPhone: clientPhone || undefined,
      clientAddress: clientAddress || undefined,
      items: items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        unit: item.unit,
      })),
      validityDays: parseInt(validityDays),
      paymentTerms,
      observations: observations || undefined,
      tenderNumber: tenderNumber || undefined,
    });
  };

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Gerador de Propostas</h1>
          <p className="text-gray-600 mt-2">Crie propostas comerciais profissionais em PDF</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulário */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dados da Proposta */}
            <Card>
              <CardHeader>
                <CardTitle>Dados da Proposta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Número da Proposta *</Label>
                    <Input
                      value={proposalNumber}
                      onChange={(e) => setProposalNumber(e.target.value)}
                      placeholder="Ex: 2024-001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Validade (dias)</Label>
                    <Input
                      type="number"
                      value={validityDays}
                      onChange={(e) => setValidityDays(e.target.value)}
                      placeholder="30"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Número do Edital (opcional)</Label>
                  <Input
                    value={tenderNumber}
                    onChange={(e) => setTenderNumber(e.target.value)}
                    placeholder="Ex: 2024/001"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Dados do Cliente */}
            <Card>
              <CardHeader>
                <CardTitle>Dados do Cliente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Razão Social *</Label>
                  <Input
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Nome da empresa"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>CNPJ</Label>
                    <Input
                      value={clientCNPJ}
                      onChange={(e) => setClientCNPJ(e.target.value)}
                      placeholder="00.000.000/0000-00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefone</Label>
                    <Input
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="cliente@empresa.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Endereço</Label>
                  <Input
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                    placeholder="Rua, número, complemento"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Itens da Proposta */}
            <Card>
              <CardHeader>
                <CardTitle>Itens da Proposta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4 border rounded-lg p-4 bg-gray-50">
                  <div className="space-y-2">
                    <Label>Descrição do Item</Label>
                    <Textarea
                      value={currentItem.description || ""}
                      onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })}
                      placeholder="Ex: Consultoria de TI - 40 horas"
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Quantidade</Label>
                      <Input
                        type="number"
                        value={currentItem.quantity || 1}
                        onChange={(e) => setCurrentItem({ ...currentItem, quantity: parseFloat(e.target.value) })}
                        min="1"
                        step="0.01"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Unidade</Label>
                      <Input
                        value={currentItem.unit || "un"}
                        onChange={(e) => setCurrentItem({ ...currentItem, unit: e.target.value })}
                        placeholder="un, h, m, etc"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Valor Unitário (R$)</Label>
                      <Input
                        type="number"
                        value={currentItem.unitPrice || 0}
                        onChange={(e) => setCurrentItem({ ...currentItem, unitPrice: parseFloat(e.target.value) })}
                        step="0.01"
                        min="0"
                      />
                    </div>
                  </div>

                  <Button onClick={handleAddItem} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Item
                  </Button>
                </div>

                {/* Lista de Itens */}
                {items.length > 0 && (
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between items-start p-3 bg-gray-50 rounded border">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.description}</p>
                          <p className="text-xs text-gray-600">
                            {item.quantity} {item.unit} × R$ {item.unitPrice.toFixed(2)} = R${" "}
                            {(item.quantity * item.unitPrice).toFixed(2)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Condições Comerciais */}
            <Card>
              <CardHeader>
                <CardTitle>Condições Comerciais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Prazo de Pagamento</Label>
                  <Input
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    placeholder="Ex: 30 dias após emissão"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Observações</Label>
                  <Textarea
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                    placeholder="Adicione observações, condições especiais, etc"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resumo e Ações */}
          <div className="space-y-6">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Resumo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Itens</p>
                  <p className="text-2xl font-bold">{items.length}</p>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600 mb-2">Subtotal</p>
                  <p className="text-xl font-bold">R$ {subtotal.toFixed(2)}</p>
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={handleGenerateProposal}
                    disabled={generateMutation.isPending}
                    className="w-full"
                    size="lg"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {generateMutation.isPending ? "Gerando..." : "Gerar Proposta"}
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
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Preview */}
        {showPreview && previewHTML && (
          <Card>
            <CardHeader>
              <CardTitle>Visualização da Proposta</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="border rounded-lg p-4 bg-white"
                dangerouslySetInnerHTML={{ __html: previewHTML }}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
