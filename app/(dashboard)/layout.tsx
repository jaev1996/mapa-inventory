import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/Sidebar'
import { getUserRole } from '@/lib/supabase/user-role'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const role = await getUserRole()

    if (!role) {
        redirect('/login')
    }

    return (
        <div className="flex min-h-screen w-full bg-zinc-50 dark:bg-black text-black dark:text-white">
            <Sidebar role={role} />
            <div className="flex flex-col w-full">
                {/* Header could go here usually, e.g. for Mobile Toggle */}
                <main className="flex-1 p-4 md:p-6 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}
