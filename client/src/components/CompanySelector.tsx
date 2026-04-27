import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useLocation } from "wouter";

export function CompanySelector() {
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [, setLocation] = useLocation();

  // Buscar lista de empresas
  const { data: companies = [], isLoading } = trpc.company.list.useQuery();

  // Carregar empresa selecionada do localStorage
  useEffect(() => {
    const saved = localStorage.getItem("selectedCompanyId");
    if (saved) {
      setSelectedCompanyId(parseInt(saved));
    } else if (companies.length > 0) {
      setSelectedCompanyId(companies[0].id);
      localStorage.setItem("selectedCompanyId", companies[0].id.toString());
    }
  }, [companies]);

  const handleSelectCompany = (id: string) => {
    const companyId = parseInt(id);
    setSelectedCompanyId(companyId);
    localStorage.setItem("selectedCompanyId", id);
  };

  const selectedCompany = companies.find(c => c.id === selectedCompanyId);

  return (
    <div className="flex items-center gap-2">
      <Select
        value={selectedCompanyId?.toString() || ""}
        onValueChange={handleSelectCompany}
        disabled={isLoading || companies.length === 0}
      >
        <SelectTrigger className="w-[250px]">
          <SelectValue placeholder="Selecione uma empresa" />
        </SelectTrigger>
        <SelectContent>
          {companies.map((company) => (
            <SelectItem key={company.id} value={company.id.toString()}>
              {company.companyName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        size="sm"
        onClick={() => setLocation("/settings/company")}
        title="Adicionar nova empresa"
      >
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  );
}

// Hook para obter a empresa selecionada
export function useSelectedCompany() {
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const { data: companies = [] } = trpc.company.list.useQuery();

  useEffect(() => {
    const saved = localStorage.getItem("selectedCompanyId");
    if (saved) {
      setSelectedCompanyId(parseInt(saved));
    } else if (companies.length > 0) {
      setSelectedCompanyId(companies[0].id);
    }
  }, [companies]);

  const selectedCompany = companies.find(c => c.id === selectedCompanyId);

  return {
    selectedCompanyId,
    selectedCompany,
    companies,
  };
}
