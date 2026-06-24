"use client";

import { createContext, useContext } from "react";
import { TableInstance } from "./types";

const TableContext = createContext<TableInstance<any> | null>(null);

export function useTableContext<T>() {
  const context = useContext(TableContext);
  if (!context) {
    throw new Error("useTableContext must be used within a Table component");
  }
  return context as TableInstance<T>;
}

export default TableContext;
export { TableContext };
