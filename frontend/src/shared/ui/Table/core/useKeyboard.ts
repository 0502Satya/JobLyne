import React, { useState } from "react";

export type UseKeyboardProps = {
  containerRef: React.RefObject<HTMLDivElement | null>;
  totalRows: number;
  totalCols: number;
};

export function useKeyboard({ containerRef, totalRows, totalCols }: UseKeyboardProps) {
  const [focusedCell, setFocusedCell] = useState<{ rowIndex: number; colIndex: number } | null>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTableRowElement>, rowIndex: number) => {
    if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) return;

    if (!focusedCell) return;
    e.preventDefault();

    let nextRow = focusedCell.rowIndex;
    let nextCol = focusedCell.colIndex;

    switch (e.key) {
      case "ArrowUp":
        nextRow = Math.max(0, focusedCell.rowIndex - 1);
        break;
      case "ArrowDown":
        nextRow = Math.min(totalRows - 1, focusedCell.rowIndex + 1);
        break;
      case "ArrowLeft":
        nextCol = Math.max(0, focusedCell.colIndex - 1);
        break;
      case "ArrowRight":
        nextCol = Math.min(totalCols - 1, focusedCell.colIndex + 1);
        break;
    }

    setFocusedCell({ rowIndex: nextRow, colIndex: nextCol });

    // Focus target cell in the DOM
    const cellEl = containerRef.current?.querySelector<HTMLElement>(
      `[data-row-index="${nextRow}"][data-col-index="${nextCol}"]`
    );
    cellEl?.focus();
  };

  return {
    focusedCell,
    setFocusedCell,
    handleKeyDown,
  };
}
