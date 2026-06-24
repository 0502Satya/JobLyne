import React from "react";
import Button from "./Button";
import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationProps = {
  currentPage:     number;
  totalPages:      number;
  onPageChange:    (page: number) => void;
  siblingsCount?:  number;
  showEdgePages?:  boolean;
  className?:      string;
};

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingsCount = 1,
  showEdgePages = true,
  className = "",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  // Generate pagination items
  const siblingRangeStart = Math.max(1, currentPage - siblingsCount);
  const siblingRangeEnd = Math.min(totalPages, currentPage + siblingsCount);

  const pageItems: (number | "ellipsis-left" | "ellipsis-right")[] = [];

  if (showEdgePages) {
    // First page and left ellipsis
    if (siblingRangeStart > 1) {
      pageItems.push(1);
      if (siblingRangeStart > 2) {
        pageItems.push("ellipsis-left");
      }
    }

    // Sibling range
    for (let i = siblingRangeStart; i <= siblingRangeEnd; i++) {
      if (!pageItems.includes(i)) {
        pageItems.push(i);
      }
    }

    // Right ellipsis and last page
    if (siblingRangeEnd < totalPages) {
      if (siblingRangeEnd < totalPages - 1) {
        pageItems.push("ellipsis-right");
      }
      if (!pageItems.includes(totalPages)) {
        pageItems.push(totalPages);
      }
    }
  } else {
    for (let i = siblingRangeStart; i <= siblingRangeEnd; i++) {
      pageItems.push(i);
    }
  }

  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  return (
    <nav
      role="navigation"
      aria-label="Pagination navigation"
      className={`flex items-center justify-between gap-4 py-4 border-t border-border/40 w-full ${className}`}
    >
      {/* Mobile View */}
      <div className="flex-1 flex justify-between sm:hidden">
        <Button
          variant="outline"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={isFirstPage}
          aria-disabled={isFirstPage ? "true" : undefined}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={isLastPage}
          aria-disabled={isLastPage ? "true" : undefined}
        >
          Next
        </Button>
      </div>

      {/* Desktop View */}
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
                disabled={isFirstPage}
                aria-disabled={isFirstPage ? "true" : undefined}
                aria-label="Go to previous page"
                className="min-h-[32px] px-2.5 py-1"
              >
                <ChevronLeft size={16} aria-hidden="true" />
              </Button>
            </li>

            {pageItems.map((item, index) => {
              if (item === "ellipsis-left" || item === "ellipsis-right") {
                return (
                  <li key={`ellipsis-${index}`}>
                    <span className="px-2 text-muted text-sm" aria-hidden="true">...</span>
                  </li>
                );
              }

              const isCurrent = currentPage === item;
              return (
                <li key={item}>
                  <Button
                    variant="outline"
                    selected={isCurrent}
                    size="sm"
                    onClick={() => onPageChange(item)}
                    aria-label={`Go to page ${item}`}
                    aria-current={isCurrent ? "page" : undefined}
                    className="min-h-[32px] px-3 py-1"
                  >
                    {item}
                  </Button>
                </li>
              );
            })}

            <li>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={isLastPage}
                aria-disabled={isLastPage ? "true" : undefined}
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
