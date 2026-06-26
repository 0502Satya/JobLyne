"use client";

import React from "react";
import TableContext from "../TableContext";
import { TableProps } from "../types";
import { useTable } from "../core/useTable";
import TableHeader from "./TableHeader";
import TableBody from "./TableBody";

export default function Table<T>({
  className = "",
  children,
  ...props
}: TableProps<T> & { children?: React.ReactNode }) {
  const instance = useTable(props);

  const totalCols =
    instance.columns.filter((c) => instance.state.visibleColumns.includes(c.key)).length +
    (instance.features.selection?.enabled !== false ? 1 : 0) +
    (instance.actions ? 1 : 0);

  return (
    <TableContext.Provider value={instance}>
      {/* Scrollable grid viewport container */}
      <div
        ref={instance.containerRef}
        className={`w-full overflow-auto border border-[var(--table-border)] bg-[var(--table-bg)] rounded-xl relative ${className}`}
        style={{
          height: instance.features.virtualization?.enabled
            ? `${instance.features.virtualization.containerHeight || 400}px`
            : "auto",
          maxHeight: "100%",
        }}
      >
        <table
          role="grid"
          aria-colcount={totalCols}
          aria-rowcount={instance.data.length + 1}
          className="w-full border-collapse border-spacing-0 relative table-fixed"
        >
          {children || (
            <>
              <TableHeader />
              <TableBody />
            </>
          )}
        </table>
      </div>
    </TableContext.Provider>
  );
}
