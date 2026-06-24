import { useState, useMemo } from "react";
import { SortKey, Column } from "../types";

export type UseSortingProps<T> = {
  columns: Column<T>[];
  data: T[];
  sortKeys?: SortKey[];
  defaultSortKeys?: SortKey[];
  onSortChange?: (sortKeys: SortKey[]) => void;
  manualSorting?: boolean;
};

export function useSorting<T>({
  columns,
  data,
  sortKeys: controlledSortKeys,
  defaultSortKeys,
  onSortChange,
  manualSorting = false,
}: UseSortingProps<T>) {
  const [internalSortKeys, setInternalSortKeys] = useState<SortKey[]>(
    defaultSortKeys || []
  );

  const sortKeys = controlledSortKeys !== undefined ? controlledSortKeys : internalSortKeys;

  const handleSortToggle = (columnKey: string, isShift: boolean) => {
    let nextSortKeys: SortKey[] = [...sortKeys];
    const existingIndex = nextSortKeys.findIndex((sk) => sk.key === columnKey);

    if (existingIndex > -1) {
      const existing = nextSortKeys[existingIndex];
      if (existing.direction === "asc") {
        nextSortKeys[existingIndex] = { key: columnKey, direction: "desc" };
      } else {
        nextSortKeys.splice(existingIndex, 1);
      }
    } else {
      if (isShift) {
        nextSortKeys.push({ key: columnKey, direction: "asc" });
      } else {
        nextSortKeys = [{ key: columnKey, direction: "asc" }];
      }
    }

    if (controlledSortKeys === undefined) {
      setInternalSortKeys(nextSortKeys);
    }
    if (onSortChange) {
      onSortChange(nextSortKeys);
    }
  };

  const sortedData = useMemo(() => {
    if (manualSorting || sortKeys.length === 0) return data;

    return [...data].sort((a, b) => {
      for (const sort of sortKeys) {
        const col = columns.find((c) => c.key === sort.key);
        if (!col) continue;

        let valA: any = undefined;
        let valB: any = undefined;

        if (col.sortAccessor) {
          valA = col.sortAccessor(a);
          valB = col.sortAccessor(b);
        } else if (col.accessor) {
          valA = a[col.accessor];
          valB = b[col.accessor];
        } else {
          valA = (a as any)[sort.key];
          valB = (b as any)[sort.key];
        }

        if (valA === valB) continue;

        const isAsc = sort.direction === "asc";
        if (valA == null) return isAsc ? 1 : -1;
        if (valB == null) return isAsc ? -1 : 1;

        if (typeof valA === "string" && typeof valB === "string") {
          const comp = valA.localeCompare(valB);
          if (comp !== 0) return isAsc ? comp : -comp;
        } else {
          if (valA < valB) return isAsc ? -1 : 1;
          if (valA > valB) return isAsc ? 1 : -1;
        }
      }
      return 0;
    });
  }, [data, sortKeys, manualSorting, columns]);

  return {
    sortKeys,
    handleSortToggle,
    sortedData,
  };
}
