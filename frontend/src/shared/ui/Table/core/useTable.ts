"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useSorting } from "./useSorting";
import { useSelection } from "./useSelection";
import { useVisibility } from "./useVisibility";
import { usePinnedColumns } from "./usePinnedColumns";
import { useKeyboard } from "./useKeyboard";
import { TableState, TableProps, Column, SortKey, TableInstance } from "../types";

export function useTable<T>({
  columns,
  data,
  getRowId = (row: any) => row.id || row.key || "",
  state: controlledState,
  defaultState,
  onStateChange,
  features = {},
  slots,
  actions,
  onColumnResize,
}: TableProps<T>): TableInstance<T> {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // ── Central State Machine ───────────────────────────────────────────
  const [internalState, setInternalState] = useState<TableState>(() => ({
    sortKeys: defaultState?.sortKeys || [],
    selectedRowIds: defaultState?.selectedRowIds || new Set(),
    visibleColumns: defaultState?.visibleColumns || columns.map((c) => c.key),
    density: defaultState?.density || "comfortable",
    columnWidths: defaultState?.columnWidths || {},
    focusedCell: null,
    filters: defaultState?.filters || [],
  }));

  const activeState = useMemo<TableState>(() => {
    return {
      sortKeys: controlledState?.sortKeys ?? internalState.sortKeys,
      selectedRowIds: controlledState?.selectedRowIds ?? internalState.selectedRowIds,
      visibleColumns: controlledState?.visibleColumns ?? internalState.visibleColumns,
      density: controlledState?.density ?? internalState.density,
      columnWidths: controlledState?.columnWidths ?? internalState.columnWidths,
      focusedCell: controlledState?.focusedCell ?? internalState.focusedCell,
      filters: controlledState?.filters ?? internalState.filters,
    };
  }, [controlledState, internalState]);

  const updateState = useCallback((updater: (prev: TableState) => TableState) => {
    if (onStateChange) {
      const nextState = updater(activeState);
      onStateChange(nextState);
    } else {
      setInternalState(updater);
    }
  }, [onStateChange, activeState]);

  // ── Accessibility Announcer ──────────────────────────────────────────
  const [announcement, setAnnouncement] = useState("");
  const announce = (message: string) => {
    setAnnouncement(message);
    setTimeout(() => setAnnouncement(""), 1000);
  };

  // ── Integrate Sorting hook ───────────────────────────────────────────
  const sortingHook = useSorting({
    columns,
    data,
    sortKeys: activeState.sortKeys,
    onSortChange: (nextKeys) => {
      updateState((prev) => ({ ...prev, sortKeys: nextKeys }));
    },
    manualSorting: features.sorting?.manual,
  });

  const handleSortToggle = (columnKey: string, isShift: boolean) => {
    const col = columns.find((c) => c.key === columnKey);
    const colName = typeof col?.header === "string" ? col.header : columnKey;
    const existing = activeState.sortKeys.find((sk) => sk.key === columnKey);
    let nextDir = "ascending";
    if (existing) {
      if (existing.direction === "asc") nextDir = "descending";
      else nextDir = "none";
    }
    announce(`Table sorted by column ${colName}, ${nextDir}`);
    sortingHook.handleSortToggle(columnKey, isShift);
  };

  // ── Integrate Selection hook ──────────────────────────────────────────
  const selectionHook = useSelection({
    data: sortingHook.sortedData,
    getRowId,
    selectedRowIds: activeState.selectedRowIds,
    onSelectionChange: (nextSelected) => {
      updateState((prev) => ({ ...prev, selectedRowIds: nextSelected }));
    },
    selectionConfig: features.selection,
  });

  // ── Integrate Visibility hook ────────────────────────────────────────
  const visibilityHook = useVisibility({
    columns,
    visibleColumns: activeState.visibleColumns,
    onVisibleColumnsChange: (nextVisible) => {
      updateState((prev) => ({ ...prev, visibleColumns: nextVisible }));
    },
  });

  // ── Integrate Pinned Columns offsets ──────────────────────────────────
  const isSelectable = features.selection?.enabled !== false;
  const pinnedHook = usePinnedColumns({
    columns,
    visibleColumns: activeState.visibleColumns,
    columnWidths: activeState.columnWidths,
    isSelectable,
    hasActions: !!actions,
  });

  // ── Dynamic calculations for keyboard boundary bounds ─────────────────
  const activeColumns = useMemo(() => {
    return columns.filter((col) => activeState.visibleColumns.includes(col.key));
  }, [columns, activeState.visibleColumns]);

  const totalCols = activeColumns.length + (isSelectable ? 1 : 0) + (actions ? 1 : 0);

  // ── Integrate Keyboard hook ───────────────────────────────────────────
  const keyboardHook = useKeyboard({
    containerRef,
    totalRows: sortingHook.sortedData.length,
    totalCols,
  });

  // Keep focus state in sync with central state
  useEffect(() => {
    if (keyboardHook.focusedCell !== activeState.focusedCell) {
      updateState((prev) => ({ ...prev, focusedCell: keyboardHook.focusedCell }));
    }
  }, [keyboardHook.focusedCell, activeState.focusedCell, updateState]);

  // ── Integrate TanStack Virtualizer ────────────────────────────────────
  const virtualizer = useVirtualizer({
    count: sortingHook.sortedData.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => (activeState.density === "comfortable" ? 52 : 40),
    overscan: features.virtualization?.overscan ?? 5,
  });

  // ── Central Handlers ──────────────────────────────────────────────────
  const setDensity = (density: "comfortable" | "compact") => {
    updateState((prev) => ({ ...prev, density }));
  };

  const handleColumnResize = (columnKey: string, width: number) => {
    updateState((prev) => ({
      ...prev,
      columnWidths: { ...prev.columnWidths, [columnKey]: width },
    }));
    if (onColumnResize) {
      onColumnResize(columnKey, width);
    }
  };

  return {
    columns,
    data: sortingHook.sortedData,
    getRowId,
    state: activeState,
    onStateChange,
    features,
    slots,
    actions,
    containerRef,
    toggleRowSelection: selectionHook.toggleRowSelection,
    toggleSelectAll: selectionHook.toggleSelectAll,
    isAllSelected: selectionHook.isAllSelected,
    isSomeSelected: selectionHook.isSomeSelected,
    handleSortToggle,
    toggleColumnVisibility: visibilityHook.toggleColumnVisibility,
    setDensity,
    handleColumnResize,
    onColumnResize,
    leftOffsets: pinnedHook.leftOffsets,
    rightOffsets: pinnedHook.rightOffsets,
    setFocusedCell: keyboardHook.setFocusedCell,
    virtualizer: features.virtualization?.enabled ? virtualizer : undefined,
    announcement,
    announce,
  };
}
