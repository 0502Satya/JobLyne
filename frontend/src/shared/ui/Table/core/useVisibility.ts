import { useState, useMemo } from "react";
import { Column } from "../types";

export type UseVisibilityProps<T> = {
  columns: Column<T>[];
  visibleColumns?: string[];
  defaultVisibleColumns?: string[];
  onVisibleColumnsChange?: (visibleColumns: string[]) => void;
};

export function useVisibility<T>({
  columns,
  visibleColumns: controlledVisibleColumns,
  defaultVisibleColumns,
  onVisibleColumnsChange,
}: UseVisibilityProps<T>) {
  const allColumnKeys = useMemo(() => columns.map((col) => col.key), [columns]);

  const [internalVisibleColumns, setInternalVisibleColumns] = useState<string[]>(
    defaultVisibleColumns || allColumnKeys
  );

  const visibleColumns = controlledVisibleColumns !== undefined ? controlledVisibleColumns : internalVisibleColumns;

  const toggleColumnVisibility = (columnKey: string) => {
    const nextVisible = visibleColumns.includes(columnKey)
      ? visibleColumns.filter((k) => k !== columnKey)
      : [...visibleColumns, columnKey];

    if (controlledVisibleColumns === undefined) {
      setInternalVisibleColumns(nextVisible);
    }
    if (onVisibleColumnsChange) {
      onVisibleColumnsChange(nextVisible);
    }
  };

  return {
    visibleColumns,
    toggleColumnVisibility,
  };
}
