"use client";

import React, { useRef } from "react";
import { useTableContext } from "../TableContext";
import TableCell from "./TableCell";
import Checkbox from "../../Checkbox";

type TableRowProps<T> = {
  row: T;
  index: number;
  measureRef?: (element: HTMLTableRowElement | null) => void;
  children?: React.ReactNode;
};

export default function TableRow<T>({ row, index, measureRef, children }: TableRowProps<T>) {
  const {
    getRowId,
    features,
    state,
    toggleRowSelection,
    columns,
    actions,
    setFocusedCell,
    containerRef,
    data,
  } = useTableContext<T>();

  const isSelectable = features.selection?.enabled !== false;
  const activeColumns = columns.filter((col) => state.visibleColumns.includes(col.key));
  const rowId = getRowId(row);
  const isSelected = state.selectedRowIds.has(rowId);

  const rowRef = useRef<HTMLTableRowElement | null>(null);

  const setRowRef = (el: HTMLTableRowElement | null) => {
    rowRef.current = el;
    if (measureRef) {
      measureRef(el);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTableRowElement>) => {
    if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) return;

    if (!state.focusedCell) return;
    e.preventDefault();

    const maxRows = data.length;
    const totalCols = activeColumns.length + (isSelectable ? 1 : 0) + (actions ? 1 : 0);

    let nextRow = state.focusedCell.rowIndex;
    let nextCol = state.focusedCell.colIndex;

    switch (e.key) {
      case "ArrowUp":
        nextRow = Math.max(0, state.focusedCell.rowIndex - 1);
        break;
      case "ArrowDown":
        nextRow = Math.min(maxRows - 1, state.focusedCell.rowIndex + 1);
        break;
      case "ArrowLeft":
        nextCol = Math.max(0, state.focusedCell.colIndex - 1);
        break;
      case "ArrowRight":
        nextCol = Math.min(totalCols - 1, state.focusedCell.colIndex + 1);
        break;
    }

    setFocusedCell({ rowIndex: nextRow, colIndex: nextCol });

    // Focus target cell in the DOM
    const cellEl = containerRef.current?.querySelector<HTMLElement>(
      `[data-row-index="${nextRow}"][data-col-index="${nextCol}"]`
    );
    cellEl?.focus();
  };

  return (
    <tr
      ref={setRowRef}
      role="row"
      onKeyDown={handleKeyDown}
      className={[
        "transition-colors hover:bg-[var(--table-row-hover)] border-b border-[var(--table-border)]",
        isSelected ? "bg-[var(--table-row-selected)]" : "bg-[var(--table-bg)]",
        state.density === "compact" ? "h-10" : "h-13",
      ].join(" ")}
      aria-selected={isSelectable ? isSelected : undefined}
    >
      {children || (
        <>
          {/* Checkbox Selection Column */}
          {isSelectable && (
            <td
              role="gridcell"
              data-row-index={index}
              data-col-index={0}
              tabIndex={state.focusedCell?.rowIndex === index && state.focusedCell?.colIndex === 0 ? 0 : -1}
              onFocus={() => setFocusedCell({ rowIndex: index, colIndex: 0 })}
              className={[
                "p-4 sticky left-0 z-10 bg-inherit border-r border-[var(--table-border)] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset",
                state.density === "compact" ? "py-2" : "py-4",
              ].join(" ")}
              style={{ width: "48px", minWidth: "48px" }}
            >
              <div className="flex items-center justify-center">
                <Checkbox
                  checked={isSelected}
                  onChange={() => toggleRowSelection(rowId)}
                  aria-label={`Select row ${index + 1}`}
                />
              </div>
            </td>
          )}

          {/* Dynamic Data Cells */}
          {activeColumns.map((col, colIndex) => {
            const navigationColIndex = colIndex + (isSelectable ? 1 : 0);
            return (
              <TableCell
                key={col.key}
                row={row}
                column={col}
                rowIndex={index}
                colIndex={navigationColIndex}
              />
            );
          })}

          {/* Actions Column */}
          {actions && (
            <td
              role="gridcell"
              data-row-index={index}
              data-col-index={activeColumns.length + (isSelectable ? 1 : 0)}
              tabIndex={
                state.focusedCell?.rowIndex === index &&
                state.focusedCell?.colIndex === activeColumns.length + (isSelectable ? 1 : 0)
                  ? 0
                  : -1
              }
              onFocus={() =>
                setFocusedCell({
                  rowIndex: index,
                  colIndex: activeColumns.length + (isSelectable ? 1 : 0),
                })
              }
              className={[
                "p-4 sticky right-0 z-10 bg-inherit border-l border-[var(--table-border)] text-right focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset",
                state.density === "compact" ? "py-2" : "py-4",
              ].join(" ")}
              style={{ width: "80px", minWidth: "80px" }}
            >
              {actions(row)}
            </td>
          )}
        </>
      )}
    </tr>
  );
}
