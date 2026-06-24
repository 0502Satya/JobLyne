"use client";

import React from "react";
import { useTableContext } from "../TableContext";
import TableRow from "./TableRow";

export default function TableBody({ children }: { children?: React.ReactNode }) {
  const {
    data,
    state,
    features,
    slots,
    columns,
    actions,
    virtualizer,
  } = useTableContext<any>();

  const isSelectable = features.selection?.enabled !== false;
  const isVirtualized = features.virtualization?.enabled;
  const activeColumns = columns.filter((col) => state.visibleColumns.includes(col.key));
  const colSpan = activeColumns.length + (isSelectable ? 1 : 0) + (actions ? 1 : 0);

  // Render Fallback States (only when no custom children are provided)
  if (!children) {
    if (slots?.Offline) {
      return (
        <tbody>
          <tr>
            <td colSpan={colSpan} className="p-8 text-center bg-surface-1">
              {slots.Offline}
            </td>
          </tr>
        </tbody>
      );
    }

    if (slots?.Error) {
      return (
        <tbody>
          <tr>
            <td colSpan={colSpan} className="p-8 text-center bg-surface-1">
              {slots.Error}
            </td>
          </tr>
        </tbody>
      );
    }

    if (slots?.Loading) {
      return (
        <tbody>
          <tr>
            <td colSpan={colSpan} className="p-0 bg-surface-1">
              {slots.Loading}
            </td>
          </tr>
        </tbody>
      );
    }

    if (data.length === 0) {
      return (
        <tbody>
          <tr>
            <td colSpan={colSpan} className="p-8 text-center bg-surface-1">
              {slots?.Empty || (
                <div className="flex flex-col items-center justify-center p-6 text-muted">
                  <span className="text-sm font-semibold mb-1">No Records Found</span>
                  <span className="text-xs">Adjust filter settings or search terms.</span>
                </div>
              )}
            </td>
          </tr>
        </tbody>
      );
    }
  }

  // If custom children are provided, render them directly inside tbody
  if (children) {
    return (
      <tbody className="divide-y divide-border/40 text-text bg-surface-1 relative">
        {children}
      </tbody>
    );
  }

  // Render Body Rows (Virtualized or Standard)
  return (
    <tbody role="rowgroup" className="divide-y divide-border/40 text-text bg-surface-1 relative">
      {isVirtualized && virtualizer ? (
        <>
          {/* Virtual spacing blocks */}
          {virtualizer.getVirtualItems().length > 0 && virtualizer.getVirtualItems()[0].start > 0 && (
            <tr style={{ height: `${virtualizer.getVirtualItems()[0].start}px` }} role="presentation">
              <td colSpan={colSpan} className="p-0 border-none" role="presentation" />
            </tr>
          )}

          {virtualizer.getVirtualItems().map((virtualItem: any) => {
            const row = data[virtualItem.index];
            return (
              <TableRow
                key={virtualItem.key}
                row={row}
                index={virtualItem.index}
                measureRef={virtualizer.measureElement}
              />
            );
          })}

          {virtualizer.getVirtualItems().length > 0 &&
            virtualizer.getTotalSize() -
              (virtualizer.getVirtualItems()[virtualizer.getVirtualItems().length - 1].start +
                virtualizer.getVirtualItems()[virtualizer.getVirtualItems().length - 1].size) >
              0 && (
              <tr
                style={{
                  height: `${
                    virtualizer.getTotalSize() -
                    (virtualizer.getVirtualItems()[virtualizer.getVirtualItems().length - 1].start +
                      virtualizer.getVirtualItems()[virtualizer.getVirtualItems().length - 1].size)
                  }px`,
                }}
                role="presentation"
              >
                <td colSpan={colSpan} className="p-0 border-none" role="presentation" />
              </tr>
            )}
        </>
      ) : (
        data.map((row: any, index: number) => (
          <TableRow key={index} row={row} index={index} />
        ))
      )}
    </tbody>
  );
}
