import React from "react";

export type SortDirection = "asc" | "desc" | "none";

export type SortKey = {
  key: string;
  direction: "asc" | "desc";
};

export type Filter = {
  columnKey: string;
  value: any;
};

export type TableView = {
  name: string;
  sortKeys: SortKey[];
  visibleColumns: string[];
  pinnedColumns: string[];
  filters: Filter[];
  density: "comfortable" | "compact";
};

export type ColumnMeta = {
  tooltip?: string;
  description?: string;
  className?: string;
  headerClassName?: string;
  cellClassName?: string;
};

export type Column<T> = {
  key: string;
  header: React.ReactNode;
  align?: "left" | "right" | "center";
  pinned?: "left" | "right" | "none";
  width?: number; // width in px
  sortable?: boolean;
  resizable?: boolean;
  minWidth?: number;
  maxWidth?: number;
  canHide?: boolean;
  accessor?: keyof T;
  sortAccessor?: (row: T) => unknown;
  render?: (row: T, value: any, index: number) => React.ReactNode;
  meta?: ColumnMeta;
};

export type TableSlots = {
  Loading?: React.ReactNode;
  Error?: React.ReactNode;
  Offline?: React.ReactNode;
  Empty?: React.ReactNode;
};

export type TableState = {
  sortKeys: SortKey[];
  selectedRowIds: Set<string>;
  visibleColumns: string[];
  density: "comfortable" | "compact";
  columnWidths: Record<string, number>;
  focusedCell: { rowIndex: number; colIndex: number } | null;
  filters: Filter[];
};

export type TableSelectionConfig = {
  enabled?: boolean;
  multiple?: boolean;
};

export type TableVirtualizationConfig = {
  enabled?: boolean;
  overscan?: number;
  containerHeight?: number;
};

export type TableSortingConfig = {
  enabled?: boolean;
  manual?: boolean;
};

export type TableFilteringConfig = {
  enabled?: boolean;
  manual?: boolean;
};

export type TableFeatureConfig = {
  selection?: TableSelectionConfig;
  virtualization?: TableVirtualizationConfig;
  sorting?: TableSortingConfig;
  filtering?: TableFilteringConfig;
};

export type TableProps<T> = {
  columns: Column<T>[];
  data: T[];
  getRowId?: (row: T) => string;
  
  // States & State handlers
  state?: Partial<TableState>;
  defaultState?: Partial<TableState>;
  onStateChange?: (state: TableState) => void;
  
  // Configurations
  features?: TableFeatureConfig;
  slots?: TableSlots;
  actions?: (row: T) => React.ReactNode;
  caption?: string;
  className?: string;
  onColumnResize?: (columnKey: string, width: number) => void;
};

export type TableInstance<T> = {
  columns: Column<T>[];
  data: T[];
  getRowId: (row: T) => string;
  state: TableState;
  onStateChange?: (state: TableState) => void;
  features: TableFeatureConfig;
  slots?: TableSlots;
  actions?: (row: T) => React.ReactNode;
  containerRef: React.RefObject<HTMLDivElement | null>;
  toggleRowSelection: (rowId: string) => void;
  toggleSelectAll: () => void;
  isAllSelected: boolean;
  isSomeSelected: boolean;
  handleSortToggle: (columnKey: string, isShift: boolean) => void;
  toggleColumnVisibility: (columnKey: string) => void;
  setDensity: (density: "comfortable" | "compact") => void;
  handleColumnResize: (columnKey: string, width: number) => void;
  onColumnResize?: (columnKey: string, width: number) => void;
  leftOffsets: Record<string, number>;
  rightOffsets: Record<string, number>;
  setFocusedCell: (cell: { rowIndex: number; colIndex: number } | null) => void;
  virtualizer?: any;
  announcement: string;
  announce: (message: string) => void;
};
