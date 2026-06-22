import React from "react";
import Button from "./Button";
import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
};

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  // Show a window of page numbers
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  const visiblePages = pages.slice(startPage - 1, endPage);

  return (
    <nav
      role="navigation"
      aria-label="Pagination Navigation"
      className={`flex items-center justify-between gap-4 py-4 border-t border-border/40 w-full ${className}`}
    >
      <div className="flex-1 flex justify-between sm:hidden">
        <Button
          variant="outline"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted">
            Showing page <span className="font-semibold text-text">{currentPage}</span> of{" "}
            <span className="font-semibold text-text">{totalPages}</span>
          </p>
        </div>
        <div>
          <ul className="inline-flex items-center -space-x-px gap-1">
            <li>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Go to previous page"
                className="min-h-[32px] px-2.5 py-1"
              >
                <ChevronLeft size={16} aria-hidden="true" />
              </Button>
            </li>
            {startPage > 1 && (
              <>
                <li>
                  <Button
                    variant={currentPage === 1 ? "primary" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(1)}
                    aria-label="Go to page 1"
                    className="min-h-[32px] px-3 py-1"
                  >
                    1
                  </Button>
                </li>
                {startPage > 2 && (
                  <li>
                    <span className="px-2 text-muted text-sm">...</span>
                  </li>
                )}
              </>
            )}
            {visiblePages.map((page) => (
              <li key={page}>
                <Button
                  variant={currentPage === page ? "primary" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(page)}
                  aria-label={`Go to page ${page}`}
                  aria-current={currentPage === page ? "page" : undefined}
                  className="min-h-[32px] px-3 py-1"
                >
                  {page}
                </Button>
              </li>
            ))}
            {endPage < totalPages && (
              <>
                {endPage < totalPages - 1 && (
                  <li>
                    <span className="px-2 text-muted text-sm">...</span>
                  </li>
                )}
                <li>
                  <Button
                    variant={currentPage === totalPages ? "primary" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(totalPages)}
                    aria-label={`Go to page ${totalPages}`}
                    className="min-h-[32px] px-3 py-1"
                  >
                    {totalPages}
                  </Button>
                </li>
              </>
            )}
            <li>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Go to next page"
                className="min-h-[32px] px-2.5 py-1"
              >
                <ChevronRight size={16} aria-hidden="true" />
              </Button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
