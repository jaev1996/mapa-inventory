'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface SearchableSelectOption {
    value: string;
    label: string;
}

interface SearchableSelectProps {
    options: SearchableSelectOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
    className?: string;
}

export function SearchableSelect({
    options,
    value,
    onChange,
    placeholder = "Seleccione una opción",
    searchPlaceholder = "Buscar...",
    emptyMessage = "No se encontraron resultados.",
    className
}: SearchableSelectProps) {
    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState("");
    const containerRef = React.useRef<HTMLDivElement>(null);

    const filteredOptions = options.filter(option =>
        option.label.toLowerCase().includes(search.toLowerCase())
    );

    const selectedOption = options.find(opt => opt.value === value);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        if (open) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open]);

    // Handle ESC key to close
    React.useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setOpen(false);
        };
        if (open) {
            window.addEventListener('keydown', handleEsc);
        }
        return () => window.removeEventListener('keydown', handleEsc);
    }, [open]);

    return (
        <div className={cn("relative w-full", className)} ref={containerRef}>
            <Button
                type="button"
                variant="outline"
                className={cn(
                    "w-full justify-between h-10 px-3 py-2 text-sm font-medium transition-all duration-200 text-left border-gray-200",
                    "hover:border-blue-300 hover:bg-white focus:ring-2 focus:ring-blue-100",
                    open && "border-blue-500 ring-2 ring-blue-100",
                    !selectedOption && "text-gray-400"
                )}
                onClick={() => setOpen(!open)}
            >
                <span className="truncate">
                    {selectedOption?.label || placeholder}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-40" />
            </Button>

            {open && (
                <div className="absolute z-50 mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden box-border">
                    <div className="p-3 border-b border-gray-50 flex items-center gap-2 sticky top-0 bg-white z-10">
                        <Search className="h-4 w-4 text-gray-400 shrink-0" />
                        <input
                            autoFocus
                            placeholder={searchPlaceholder}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="flex-1 h-8 bg-transparent border-none focus:outline-none text-sm placeholder:text-gray-400 text-gray-700"
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSearch("");
                                }}
                                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="h-3 w-3 text-gray-400" />
                            </button>
                        )}
                    </div>
                    <div className="max-h-60 overflow-y-auto p-1.5 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                        {filteredOptions.length === 0 ? (
                            <div className="py-8 text-center text-sm text-gray-400 font-medium italic">
                                {emptyMessage}
                            </div>
                        ) : (
                            filteredOptions.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    className={cn(
                                        "w-full flex items-center gap-2 px-3 py-2.5 text-sm rounded-lg transition-all duration-150 text-left",
                                        value === option.value
                                            ? "bg-blue-50 text-blue-700 font-bold"
                                            : "text-gray-600 hover:bg-gray-50 active:scale-[0.98]"
                                    )}
                                    onClick={() => {
                                        onChange(option.value);
                                        setOpen(false);
                                        setSearch("");
                                    }}
                                >
                                    <div className={cn(
                                        "h-4 w-4 flex items-center justify-center shrink-0 rounded-full border border-current transition-all",
                                        value === option.value
                                            ? "bg-blue-600 border-blue-600 text-white"
                                            : "border-gray-200 opacity-30 text-transparent"
                                    )}>
                                        <Check className="h-2.5 w-2.5" />
                                    </div>
                                    <span className="truncate">{option.label}</span>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
