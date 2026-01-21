'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
    LayoutDashboard,
    Box,
    ShoppingCart,
    Users,
    CreditCard,
    LifeBuoy,
    LogOut,
    Search
} from 'lucide-react'
import { UserRole } from '@/lib/types'
import { signOutAction } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'

interface SidebarProps {
    role: UserRole
}

export function Sidebar({ role }: SidebarProps) {
    const pathname = usePathname()

    const adminLinks = [
        { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Inventario', href: '/admin/dashboard/inventario/repuestos', icon: Box },
        { name: 'Gestión de Ventas', href: '/admin/dashboard/ventas', icon: ShoppingCart },
        { name: 'Equipo de Vendedores', href: '/admin/dashboard/vendedores', icon: Users },
        { name: 'Directorio de Clientes', href: '/admin/dashboard/clientes', icon: Users },
    ]

    const clientLinks = [
        { name: 'Catálogo de Repuestos', href: '/dashboard/catalogo', icon: Search },
        { name: 'Mis Compras', href: '/dashboard/mis-compras', icon: ShoppingCart },
        { name: 'Mis Pagos', href: '/dashboard/mis-pagos', icon: CreditCard },
        { name: 'Soporte Técnico', href: '/dashboard/soporte', icon: LifeBuoy },
    ]

    const links = role === 'admin' ? adminLinks : clientLinks

    return (
        <div className="border-r bg-gray-100/40 dark:bg-zinc-800/40 lg:block dark:border-zinc-700 min-h-screen w-64 flex flex-col">
            <div className="flex h-14 items-center border-b px-6 lg:h-[60px] dark:border-zinc-700">
                <Link className="flex items-center gap-2 font-semibold" href="/">
                    <Box className="h-6 w-6" />
                    <span className="">Mapa Inventory</span>
                </Link>
            </div>

            <nav className="flex-1 overflow-y-auto px-4 py-4">
                <ul className="grid gap-1">
                    {links.map((link) => {
                        const Icon = link.icon
                        const isActive = link.href === '/admin/dashboard'
                            ? pathname === link.href
                            : pathname === link.href || pathname.startsWith(link.href)

                        return (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-gray-900 dark:hover:text-gray-50",
                                        isActive
                                            ? "bg-gray-200 text-gray-900 dark:bg-zinc-700 dark:text-gray-50 font-medium"
                                            : "text-gray-500 dark:text-gray-400"
                                    )}
                                >
                                    <Icon className="h-4 w-4" />
                                    {link.name}
                                </Link>
                            </li>
                        )
                    })}
                </ul>
            </nav>

            <div className="p-4 border-t dark:border-zinc-700">
                <form action={signOutAction}>
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
                    >
                        <LogOut className="h-4 w-4" />
                        Cerrar Sesión
                    </Button>
                </form>
            </div>
        </div>
    )
}
