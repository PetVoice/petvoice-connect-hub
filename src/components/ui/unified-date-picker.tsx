import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface UnifiedDatePickerProps {
  label: string;
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: (date: Date) => boolean;
  className?: string;
}

export const UnifiedDatePicker: React.FC<UnifiedDatePickerProps> = ({
  label,
  value,
  onChange,
  placeholder = "Seleziona data",
  required = false,
  disabled,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn("space-y-2", className)}>
      <Label className="flex items-center gap-1">
        {label}
        {required && <span className="text-foreground">*</span>}
      </Label>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(value, 'dd/MM/yyyy') : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={(date) => {
              onChange(date);
              setIsOpen(false);
            }}
            initialFocus
            className="pointer-events-auto"
            disabled={disabled}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};