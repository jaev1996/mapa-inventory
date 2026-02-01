'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, Filter } from 'lucide-react';
import { useDebounce } from 'use-debounce';
import { useEffect } from 'react';

export function AuditFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [codigo, setCodigo] = useState(searchParams.get('codigo') || '');
    const [usuario, setUsuario] = useState(searchParams.get('usuario') || '');

    const [debouncedCodigo] = useDebounce(codigo, 500);
    const [debouncedUsuario] = useDebounce(usuario, 500);

    useEffect(() => {
        const params = new URLSearchParams(searchParams);

        if (debouncedCodigo) {
            params.set('codigo', debouncedCodigo);
        } else {
            params.delete('codigo');
        }

        if (debouncedUsuario) {
            params.set('usuario', debouncedUsuario);
        } else {
            params.delete('usuario');
        }

        router.push(`?${params.toString()}`);
    }, [debouncedCodigo, debouncedUsuario, router, searchParams]);

    const handleClear = () => {
        setCodigo('');
        setUsuario('');
        router.push('?');
    };

    return (
        <div className="flex flex-col md:flex-row gap-4 bg-muted/20 p-4 rounded-lg border">
            <div className="flex-1 space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">
                    <Search className="h-3 w-3" />
                    Filtrar por Nota de Entrega
                </label>
                <Input
                    placeholder="Ej: NE-0001"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    className="bg-white"
                />
            </div>

            <div className="flex-1 space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">
                    <Filter className="h-3 w-3" />
                    Filtrar por Usuario
                </label>
                <Input
                    placeholder="Email o ID de usuario..."
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value)}
                    className="bg-white"
                />
            </div>

            <div className="flex items-end pb-0.5">
                {(codigo || usuario) && (
                    <Button
                        variant="ghost"
                        onClick={handleClear}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                        <X className="mr-2 h-4 w-4" />
                        Limpiar Filtros
                    </Button>
                )}
            </div>
        </div>
    );
}
