import { useMemo } from "react";
import { Column } from "../types";

export type UsePinnedColumnsProps<T> = {
  columns: Column<T>[];
  visibleColumns: string[];
  columnWidths: Record<string, number>;
  isSelectable: boolean;
  hasActions: boolean;
};

export function usePinnedColumns<T>({
  columns,
  visibleColumns,
  columnWidths,
  isSelectable,
  hasActions,
}: UsePinnedColumnsProps<T>) {
  const leftOffsets = useMemo(() => {
    const offsets: Record<string, number> = {};
    let sum = 0;
    if (isSelectable) {
      sum = 48; // Selection checkbox column width
    }
    columns.forEach((col) => {
      if (!visibleColumns.includes(col.key)) return;
      if (col.pinned === "left") {
        offsets[col.key] = sum;
        sum += columnWidths[col.key] || col.width || 150;
      }
    });
    return offsets;
  }, [columns, visibleColumns, isSelectable, columnWidths]);

  const rightOffsets = useMemo(() => {
    const offsets: Record<string, number> = {};
    let sum = 0;
    if (hasActions) {
      sum = 80; // Actions column width
    }
    const visibleCols = columns.filter((col) => visibleColumns.includes(col.key));
    for (let i = visibleCols.length - 1; i >= 0; i--) {
      const col = visibleCols[i];
      if (col.pinned === "right") {
        offsets[col.key] = sum;
        sum += columnWidths[col.key] || col.width || 150;
      }
    }
    return offsets;
  }, [columns, visibleColumns, hasActions, columnWidths]);

  return {
    leftOffsets,
    rightOffsets,
  };
}
