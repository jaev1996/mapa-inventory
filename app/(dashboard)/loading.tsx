import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
    return (
        <div className="flex min-h-screen w-full bg-zinc-50 dark:bg-black">
            {/* Sidebar Skeleton */}
            <div className="hidden border-r bg-gray-100/40 dark:bg-zinc-800/40 lg:block dark:border-zinc-700 min-h-screen w-64 p-4">
                <div className="h-14 mb-6 flex items-center px-2">
                    <Skeleton className="h-8 w-8 mr-2" />
                    <Skeleton className="h-6 w-32" />
                </div>
                <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} className="h-10 w-full" />
                    ))}
                </div>
            </div>

            {/* Main Content Skeleton */}
            <div className="flex flex-col w-full p-4 md:p-6 space-y-4">
                <Skeleton className="h-8 w-48 mb-4" />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-32 rounded-xl" />
                    ))}
                </div>
                <Skeleton className="h-96 w-full rounded-xl" />
            </div>
        </div>
    )
}
