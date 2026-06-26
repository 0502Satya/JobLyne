"use client";

import React from "react";
import { useTableContext } from "../TableContext";
import { Column } from "../types";

type TableCellProps<T> = {
  row: T;
  column: Column<T>;
  rowIndex: number;
  colIndex: number;
};

export default function TableCell<T>({ row, column, rowIndex, colIndex }: TableCellProps<T>) {
  const {
    leftOffsets,
    rightOffsets,
    state,
    setFocusedCell,
  } = useTableContext<T>();

  const isPinnedLeft = column.pinned === "left";
  const isPinnedRight = column.pinned === "right";

  const stickyStyle: React.CSSProperties = {};
  if (isPinnedLeft) {
    stickyStyle.position = "sticky";
    stickyStyle.left = leftOffsets[column.key] || 0;
    stickyStyle.zIndex = 10;
  } else if (isPinnedRight) {
    stickyStyle.position = "sticky";
    stickyStyle.right = rightOffsets[column.key] || 0;
    stickyStyle.zIndex = 10;
  }

  const currentWidth = state.columnWidths[column.key] || column.width || 150;
  stickyStyle.width = `${currentWidth}px`;
  stickyStyle.minWidth = `${currentWidth}px`;

  const alignClass = {
    left: "text-left",
    right: "text-right",
    center: "text-center",
  }[column.align || "left"];

  // Retrieve raw value from row
  let value: any = undefined;
  if (column.accessor) {
    value = row[column.accessor];
  } else {
    value = (row as any)[column.key];
  }

  const cellContent = column.render ? column.render(row, value, rowIndex) : String(value ?? "");
  const isFocused = state.focusedCell?.rowIndex === rowIndex && state.focusedCell?.colIndex === colIndex;

  return (
    <td
      role="gridcell"
      data-row-index={rowIndex}
      data-col-index={colIndex}
      tabIndex={isFocused ? 0 : -1}
      onFocus={() => setFocusedCell({ rowIndex, colIndex })}
      className={[
        "p-4 border-r border-[var(--table-border)] truncate focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset bg-inherit",
        alignClass,
        isPinnedLeft || isPinnedRight ? "bg-[var(--table-bg)] shadow-xs" : "",
        state.density === "compact" ? "py-2" : "py-4",
        column.meta?.cellClassName || "",
      ].join(" ")}
      style={stickyStyle}
    >
      {cellContent}
    </td>
  );
}
