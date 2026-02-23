import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, AlertCircle } from 'lucide-react';
import { useStockAutocomplete } from '../hooks/useStockAutocomplete';
import { Card } from '@/components/ui/card';

interface StockSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (symbol: string) => void;
}

export default function StockSearchBar({ value, onChange, onSearch }: StockSearchBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string>('');
  const { filterSuggestions } = useStockAutocomplete();
  const [filteredSuggestions, setFilteredSuggestions] = useState<Array<{ symbol: string; name: string }>>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const filtered = filterSuggestions(value);
    setFilteredSuggestions(filtered);
    setIsOpen(value.length > 0 && filtered.length > 0);
    
    // Clear error when user types
    if (error && value) {
      setError('');
    }
  }, [value, filterSuggestions, error]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const validateSymbol = (symbol: string): boolean => {
    if (!symbol || symbol.trim().length === 0) {
      setError('Please enter a stock symbol');
      return false;
    }
    
    if (symbol.length > 10) {
      setError('Stock symbol must be 10 characters or less');
      return false;
    }
    
    if (/^\d/.test(symbol)) {
      setError('Stock symbol cannot start with a number');
      return false;
    }
    
    if (!/^[A-Za-z0-9&-]+$/.test(symbol)) {
      setError('Stock symbol contains invalid characters');
      return false;
    }
    
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (validateSymbol(value)) {
      onSearch(value.toUpperCase());
      setIsOpen(false);
    }
  };

  const handleSelectSuggestion = (symbol: string) => {
    setError('');
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
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Enter stock symbol (e.g., RELIANCE, TCS, INFY, SBIN)"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              className={`pr-10 h-12 text-lg bg-card border-2 focus:border-primary ${error ? 'border-destructive' : ''}`}
              autoComplete="off"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          </div>
          <Button type="submit" size="lg" className="h-12 px-8">
            Predict
          </Button>
        </div>
        
        {error && (
          <div className="flex items-center gap-2 text-destructive text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
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
