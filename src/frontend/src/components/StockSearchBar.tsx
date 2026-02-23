import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useStockAutocomplete } from '../hooks/useStockAutocomplete';
import { Card } from '@/components/ui/card';

interface StockSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (symbol: string) => void;
}

export default function StockSearchBar({ value, onChange, onSearch }: StockSearchBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { filterSuggestions } = useStockAutocomplete();
  const [filteredSuggestions, setFilteredSuggestions] = useState<Array<{ symbol: string; name: string }>>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const filtered = filterSuggestions(value);
    setFilteredSuggestions(filtered);
    setIsOpen(value.length > 0 && filtered.length > 0);
  }, [value, filterSuggestions]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value) {
      onSearch(value.toUpperCase());
      setIsOpen(false);
    }
  };

  const handleSelectSuggestion = (symbol: string) => {
    onChange(symbol);
    onSearch(symbol);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Enter stock symbol (e.g., RELIANCE, TCS, INFY, SBIN)"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pr-10 h-12 text-lg bg-card border-2 focus:border-primary"
            autoComplete="off"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        </div>
        <Button type="submit" size="lg" className="h-12 px-8">
          Predict
        </Button>
      </form>

      {isOpen && filteredSuggestions.length > 0 && (
        <Card className="absolute z-50 w-full mt-2 max-h-80 overflow-y-auto shadow-lg">
          <div className="p-2">
            {filteredSuggestions.map((stock) => (
              <button
                key={stock.symbol}
                onClick={() => handleSelectSuggestion(stock.symbol)}
                className="w-full text-left px-4 py-3 hover:bg-accent rounded-md transition-colors"
              >
                <div className="font-semibold text-foreground">{stock.symbol}</div>
                <div className="text-sm text-muted-foreground">{stock.name}</div>
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
