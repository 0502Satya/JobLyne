import { useState, useMemo } from "react";

export type UseSelectionProps<T> = {
  data: T[];
  getRowId: (row: T) => string;
  selectedRowIds?: Set<string>;
  defaultSelectedRowIds?: Set<string>;
  onSelectionChange?: (selectedIds: Set<string>, selectedRows: T[]) => void;
  selectionConfig?: {
    enabled?: boolean;
    multiple?: boolean;
  };
};

export function useSelection<T>({
  data,
  getRowId,
  selectedRowIds: controlledSelectedIds,
  defaultSelectedRowIds,
  onSelectionChange,
  selectionConfig,
}: UseSelectionProps<T>) {
  const [internalSelectedIds, setInternalSelectedIds] = useState<Set<string>>(
    defaultSelectedRowIds || new Set()
  );

  const selectedRowIds = controlledSelectedIds !== undefined ? controlledSelectedIds : internalSelectedIds;

  const toggleRowSelection = (rowId: string) => {
    const isMultiple = selectionConfig?.multiple !== false;
    const nextSelected = new Set(selectedRowIds);

    if (nextSelected.has(rowId)) {
      nextSelected.delete(rowId);
    } else {
      if (!isMultiple) {
        nextSelected.clear();
      }
      nextSelected.add(rowId);
    }

    if (controlledSelectedIds === undefined) {
      setInternalSelectedIds(nextSelected);
    }

    if (onSelectionChange) {
      const selectedRows = data.filter((row) => nextSelected.has(getRowId(row)));
      onSelectionChange(nextSelected, selectedRows);
    }
  };

  const isAllSelected = useMemo(() => {
    if (data.length === 0) return false;
    return data.every((row) => selectedRowIds.has(getRowId(row)));
  }, [data, selectedRowIds, getRowId]);

  const isSomeSelected = useMemo(() => {
    if (isAllSelected) return false;
    return data.some((row) => selectedRowIds.has(getRowId(row)));
  }, [data, selectedRowIds, getRowId, isAllSelected]);

  const toggleSelectAll = () => {
    const nextSelected = new Set<string>();
    if (!isAllSelected) {
      data.forEach((row) => nextSelected.add(getRowId(row)));
    }

    if (controlledSelectedIds === undefined) {
      setInternalSelectedIds(nextSelected);
    }

    if (onSelectionChange) {
      const selectedRows = data.filter((row) => nextSelected.has(getRowId(row)));
      onSelectionChange(nextSelected, selectedRows);
    }
  };

  return {
    selectedRowIds,
    toggleRowSelection,
    toggleSelectAll,
    isAllSelected,
    isSomeSelected,
  };
}
