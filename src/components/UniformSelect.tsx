import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface UniformSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  options: string[];
  renderOption?: (option: string) => React.ReactNode;
  searchPlaceholder?: string;
  className?: string;
}

export const UniformSelect: React.FC<UniformSelectProps> = ({
  value,
  onValueChange,
  placeholder,
  options,
  renderOption,
  searchPlaceholder = "Cerca...",
  className = ""
}) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);

  // Filtra opzioni in tempo reale
  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = options.filter(option =>
        option.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOptions(filtered);
      
      // Auto-seleziona se c'è un match esatto
      if (filtered.length === 1) {
        const exactMatch = filtered[0];
        if (exactMatch.toLowerCase().startsWith(searchTerm.toLowerCase())) {
          // Opzionale: auto-seleziona dopo un delay
          setTimeout(() => {
            if (searchTerm.length > 2) {
              onValueChange(exactMatch);
              setOpen(false);
              setSearchTerm('');
            }
          }, 500);
        }
      }
    } else {
      setFilteredOptions(options);
    }
  }, [searchTerm, options, onValueChange]);

  // Reset ricerca quando chiude
  useEffect(() => {
    if (!open) {
      setSearchTerm('');
      setFilteredOptions(options);
    }
  }, [open, options]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSelectOption = (option: string) => {
    onValueChange(option);
    setOpen(false);
    setSearchTerm('');
  };

  return (
    <Select value={value} onValueChange={onValueChange} open={open} onOpenChange={setOpen}>
      <SelectTrigger className={`select-trigger-uniform ${className}`}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="select-content-uniform">
        {/* Barra di ricerca */}
        <div className="search-container">
          <div className="search-input-wrapper">
            <Search className="search-icon" size={16} />
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
              autoFocus
            />
          </div>
          {searchTerm && (
            <div className="search-indicator">
              Ricerca: "{searchTerm}" ({filteredOptions.length} risultati)
            </div>
          )}
        </div>
        
        {/* Opzioni filtrate */}
        <div className="options-container">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <SelectItem 
                key={option} 
                value={option}
                className="select-item-uniform"
                onClick={() => handleSelectOption(option)}
              >
                {renderOption ? renderOption(option) : option}
              </SelectItem>
            ))
          ) : (
            <div className="no-results">
              Nessun risultato per "{searchTerm}"
            </div>
          )}
        </div>
      </SelectContent>
    </Select>
  );
};

// Componente semplificato per quando non serve ricerca
export const SimpleUniformSelect: React.FC<{
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  children: React.ReactNode;
  className?: string;
}> = ({ value, onValueChange, placeholder, children, className = "" }) => {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={`select-trigger-uniform ${className}`}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="select-content-uniform">
        {children}
      </SelectContent>
    </Select>
  );
};