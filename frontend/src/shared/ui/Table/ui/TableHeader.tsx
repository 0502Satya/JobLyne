"use client";

import React from "react";
import { useTableContext } from "../TableContext";
import { ArrowUp, ArrowDown } from "lucide-react";
import Checkbox from "../../Checkbox";

export default function TableHeader() {
  const {
    columns,
    state,
    features,
    leftOffsets,
    rightOffsets,
    handleSortToggle,
    isAllSelected,
    isSomeSelected,
    toggleSelectAll,
    handleColumnResize,
    actions,
    announcement,
  } = useTableContext<any>();

  const isSelectable = features.selection?.enabled !== false;
  const activeColumns = columns.filter((col) => state.visibleColumns.includes(col.key));

  const startResize = (e: React.MouseEvent, columnKey: string, currentWidth: number) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newWidth = Math.max(50, currentWidth + deltaX);
      handleColumnResize(columnKey, newWidth);
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  return (
    <thead className="bg-surface-2 border-b border-border/40 text-left text-xs font-semibold text-muted tracking-wider uppercase sticky top-0 z-20">
      <tr role="row">
        {/* Bulk Selection checkbox header cell */}
        {isSelectable && (
          <th
            role="columnheader"
            scope="col"
            className="p-4 w-12 sticky left-0 bg-surface-2 z-30 border-r border-border/10"
            style={{ width: "48px", minWidth: "48px" }}
          >
            <div className="flex items-center justify-center">
              <Checkbox
                checked={isAllSelected}
                indeterminate={isSomeSelected}
                onChange={toggleSelectAll}
                aria-label="Select all rows"
              />
            </div>
          </th>
        )}

        {/* Dynamic header columns */}
        {activeColumns.map((col) => {
          const isSorted = state.sortKeys.find((sk: any) => sk.key === col.key);
          const alignClass = {
            left: "text-left",
            right: "text-right",
            center: "text-center",
          }[col.align || "left"];

          const isPinnedLeft = col.pinned === "left";
          const isPinnedRight = col.pinned === "right";

          const stickyStyle: React.CSSProperties = {};
          if (isPinnedLeft) {
            stickyStyle.position = "sticky";
            stickyStyle.left = leftOffsets[col.key] || 0;
            stickyStyle.zIndex = 30;
          } else if (isPinnedRight) {
            stickyStyle.position = "sticky";
            stickyStyle.right = rightOffsets[col.key] || 0;
            stickyStyle.zIndex = 30;
          }

          const currentWidth = state.columnWidths[col.key] || col.width || 150;
          stickyStyle.width = `${currentWidth}px`;
          stickyStyle.minWidth = `${currentWidth}px`;

          const headerLabelId = `header-label-${col.key}`;

          const handleKeyDown = (e: React.KeyboardEvent) => {
            if (col.sortable && (e.key === "Enter" || e.key === " ")) {
              e.preventDefault();
              handleSortToggle(col.key, e.shiftKey);
            }
          };

          return (
            <th
              key={col.key}
              role="columnheader"
              scope="col"
              className={[
                "p-4 relative border-r border-border/10 select-none group",
                isPinnedLeft || isPinnedRight ? "bg-surface-2" : "",
                alignClass,
                col.meta?.headerClassName || "",
              ].join(" ")}
              style={stickyStyle}
              aria-sort={
                isSorted
                  ? isSorted.direction === "asc"
                    ? "ascending"
                    : "descending"
                  : "none"
              }
            >
              <div
                id={headerLabelId}
                tabIndex={col.sortable ? 0 : undefined}
                role={col.sortable ? "button" : undefined}
                onClick={col.sortable ? (e) => handleSortToggle(col.key, e.shiftKey) : undefined}
                onKeyDown={handleKeyDown}
                className={[
                  "flex items-center gap-1.5 focus-visible:outline-none focus-visible:underline focus-visible:text-text",
                  col.sortable ? "cursor-pointer hover:text-text" : "",
                  col.align === "right" ? "justify-end" : col.align === "center" ? "justify-center" : "",
                ].join(" ")}
              >
                <span>{col.header}</span>
                {col.sortable && (
                  <span className="text-muted shrink-0 flex">
                    {isSorted ? (
                      isSorted.direction === "asc" ? (
                        <ArrowUp size={14} className="text-primary" aria-hidden="true" />
                      ) : (
                        <ArrowDown size={14} className="text-primary" aria-hidden="true" />
                      )
                    ) : (
                      <ArrowUp size={14} className="opacity-0 group-hover:opacity-40 transition-opacity" aria-hidden="true" />
                    )}
                  </span>
                )}
              </div>

              {/* Drag Resize Handle */}
              {col.resizable !== false && (
                <div
                  onMouseDown={(e) => startResize(e, col.key, currentWidth)}
                  className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/50 transition-colors"
                  role="presentation"
                  aria-hidden="true"
                />
              )}
            </th>
          );
        })}

        {/* Actions column head cell */}
        {actions && (
          <th
            role="columnheader"
            scope="col"
            className="p-4 w-20 sticky right-0 bg-surface-2 z-30 text-right border-l border-border/10"
            style={{ width: "80px", minWidth: "80px" }}
          >
            Actions
          </th>
        )}
      </tr>

      {/* Screen Reader Live Region Announcer for Sort Updates */}
      <tr className="sr-only" aria-hidden="true">
        <th colSpan={activeColumns.length + (isSelectable ? 1 : 0) + (actions ? 1 : 0)}>
          <div role="status" aria-live="polite">
            {announcement}
          </div>
        </th>
      </tr>
    </thead>
  );
}
