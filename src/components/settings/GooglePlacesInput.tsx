import React, { useState, useCallback } from 'react';
import { MapPin } from 'lucide-react';

interface AddressDetails {
  street_address: string;
  postal_code: string;
  city: string;
  province: string;
  country: string;
  full_address: string;
}

interface GooglePlacesInputProps {
  value: string;
  onChange: (value: string) => void;
  onAddressSelect?: (details: AddressDetails) => void;
  placeholder?: string;
}

interface Suggestion {
  id: string;
  display_name: string;
  main_text: string;
  secondary_text: string;
  address_details: AddressDetails;
}

// Funzione debounce
function debounce(func: (...args: any[]) => void, wait: number) {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export const GooglePlacesInput: React.FC<GooglePlacesInputProps> = ({ 
  value, 
  onChange, 
  onAddressSelect,
  placeholder = "Inizia a digitare un indirizzo..." 
}) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Usa Nominatim (OpenStreetMap) come alternativa gratuita a Google
  const searchPlaces = useCallback(
    debounce(async (query: string) => {
      if (query.length < 3) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }
      
      setIsLoading(true);
      setShowSuggestions(true);
      
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(query)}&countrycodes=it&accept-language=it`
        );
        
        const data = await response.json();
        
        const formattedSuggestions: Suggestion[] = data.map((item: any) => {
          const address = item.address || {};
          const streetAddress = `${address.house_number || ''} ${address.road || ''}`.trim();
          const city = address.city || address.town || address.village || '';
          const province = address.state || address.province || '';
          const country = address.country || 'Italia';
          const postalCode = address.postcode || '';
          
          return {
            id: item.place_id,
            display_name: item.display_name,
            main_text: streetAddress || city || 'Indirizzo',
            secondary_text: `${postalCode} ${city}, ${country}`.trim(),
            address_details: {
              street_address: streetAddress,
              postal_code: postalCode,
              city: city,
              province: province,
              country: country,
              full_address: item.display_name
            }
          };
        });
        
        setSuggestions(formattedSuggestions);
        
      } catch (error) {
        console.error('Errore ricerca luoghi:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 500),
    []
  );
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    if (newValue.trim()) {
      searchPlaces(newValue);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };
  
  const selectSuggestion = (suggestion: Suggestion) => {
    setInputValue(suggestion.display_name);
    onChange(suggestion.display_name);
    
    // Chiama onAddressSelect con i dettagli dell'indirizzo
    if (onAddressSelect) {
      onAddressSelect(suggestion.address_details);
    }
    
    setSuggestions([]);
    setShowSuggestions(false);
  };
  
  const handleBlur = () => {
    // Delay per permettere il click su suggestion
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };
  
  const handleFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };
  
  return (
    <div className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-ring bg-background text-foreground"
        />
        
        {isLoading && (
          <div className="absolute right-3 top-3">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-background border border-border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto mt-1">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              onClick={() => selectSuggestion(suggestion)}
              className="p-3 hover:bg-muted cursor-pointer border-b border-border last:border-b-0"
            >
              <div className="font-medium text-foreground">{suggestion.main_text}</div>
              <div className="text-sm text-muted-foreground">{suggestion.secondary_text}</div>
            </div>
          ))}
        </div>
      )}
      
      {showSuggestions && suggestions.length === 0 && !isLoading && inputValue.length >= 3 && (
        <div className="absolute top-full left-0 right-0 bg-background border border-border rounded-lg shadow-lg z-50 mt-1">
          <div className="p-3 text-muted-foreground text-center">
            Nessun risultato trovato
          </div>
        </div>
      )}
    </div>
  );
};