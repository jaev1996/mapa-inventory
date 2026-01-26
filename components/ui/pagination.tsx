
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    className?: string;
    showFirstLast?: boolean;
}

export function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    className = "",
    showFirstLast = true,
}: PaginationProps) {
    // If no pages or just one, don't show pagination
    if (totalPages <= 1) return null;

    // Generate page numbers
    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            // Show all pages if less than max
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Logic for showing a window of pages with ellipses
            // Always include first and last, and current page neighbors

            // Start window
            let startPage = Math.max(1, currentPage - 1);
            let endPage = Math.min(totalPages, currentPage + 1);

            // Adjust window if at edges
            if (currentPage === 1) {
                endPage = Math.min(totalPages, 3);
            } else if (currentPage === totalPages) {
                startPage = Math.max(1, totalPages - 2);
            }

            // Add pages
            if (startPage > 1) {
                pages.push(1);
                if (startPage > 2) pages.push("...");
            }

            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }

            if (endPage < totalPages) {
                if (endPage < totalPages - 1) pages.push("...");
                pages.push(totalPages);
            }
        }
        return pages;
    };

    return (
        <div className={`flex items-center justify-center space-x-2 ${className}`}>
            {/* First Page */}
            {showFirstLast && (
                <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                    title="Primera página"
                >
                    <ChevronsLeft className="h-4 w-4" />
                </Button>
            )}

            {/* Previous Page */}
            <Button
                variant="outline"
                size="icon-sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                title="Anterior"
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Page Numbers */}
            {getPageNumbers().map((page, index) => (
                <div key={index}>
                    {page === "..." ? (
                        <span className="px-2 text-muted-foreground">...</span>
                    ) : (
                        <Button
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => onPageChange(page as number)}
                            className="w-8 h-8 p-0"
                        >
                            {page}
                        </Button>
                    )}
                </div>
            ))}

            {/* Next Page */}
            <Button
                variant="outline"
                size="icon-sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                title="Siguiente"
            >
                <ChevronRight className="h-4 w-4" />
            </Button>

            {/* Last Page */}
            {showFirstLast && (
                <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    title="Última página"
                >
                    <ChevronsRight className="h-4 w-4" />
                </Button>
            )}
        </div>
    );
}
