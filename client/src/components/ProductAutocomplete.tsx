import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Plus } from "lucide-react";

interface ProductAutocompleteProps {
  onProductSelect: (product: any) => void;
  disabled?: boolean;
}

export default function ProductAutocomplete({ onProductSelect, disabled }: ProductAutocompleteProps) {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const { data: products } = trpc.products.search.useQuery(
    { query },
    { enabled: query.length > 0 }
  );

  const handleSelectProduct = (product: any) => {
    setSelectedProduct(product);
    setQuery(product.name);
    setShowSuggestions(false);
    onProductSelect(product);
  };

  const handleClear = () => {
    setQuery("");
    setSelectedProduct(null);
    setShowSuggestions(false);
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Input
          placeholder="Digite o nome do produto..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          disabled={disabled}
          className="pr-10"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {showSuggestions && query.length > 0 && products && products.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-64 overflow-y-auto">
          {products.map((product) => (
            <div
              key={product.id}
              className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0 flex justify-between items-center"
              onClick={() => handleSelectProduct(product)}
            >
              <div className="flex-1">
                <div className="font-medium text-sm">{product.name}</div>
                <div className="text-xs text-gray-600">
                  {product.brand && `${product.brand} - `}
                  {product.model && `${product.model} - `}
                  R$ {parseFloat(product.cost.toString()).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                  /{product.unit}
                </div>
              </div>
            </div>
          ))}
        </Card>
      )}

      {showSuggestions && query.length > 0 && (!products || products.length === 0) && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 p-3 text-sm text-gray-500">
          Nenhum produto encontrado
        </Card>
      )}
    </div>
  );
}
