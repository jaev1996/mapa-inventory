'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function InventoryLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const tabs = [
        { name: 'Repuestos', href: '/admin/dashboard/inventario/repuestos' },
        { name: 'Marcas', href: '/admin/dashboard/inventario/marcas' },
        { name: 'Tipos', href: '/admin/dashboard/inventario/tipos' },
    ];

    return (
        <div className="container mx-auto py-10">
            <div className="mb-8 flex flex-col gap-4">
                <h1 className="text-3xl font-bold tracking-tight">Inventario</h1>
                <div className="flex space-x-4 border-b">
                    {tabs.map((tab) => (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            className={cn(
                                'border-b-2 px-4 py-2 text-sm font-medium transition-colors hover:text-primary',
                                pathname === tab.href
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-muted-foreground'
                            )}
                        >
                            {tab.name}
                        </Link>
                    ))}
                </div>
            </div>
            {children}
        </div>
    );
}
