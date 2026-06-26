import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Table from "../ui/Table";
import { Column } from "../types";

type TestData = {
  id: string;
  name: string;
  role: string;
};

const columns: Column<TestData>[] = [
  { key: "id", header: "ID", sortable: true },
  { key: "name", header: "Name", sortable: true },
  { key: "role", header: "Role", sortable: false },
];

const data: TestData[] = [
  { id: "1", name: "Alice", role: "Developer" },
  { id: "2", name: "Bob", role: "Designer" },
];

describe("Table Component", () => {
  it("renders headers and rows correctly", () => {
    render(<Table columns={columns} data={data} />);

    // Verify headers
    expect(screen.getByText("ID")).toBeInTheDocument();
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Role")).toBeInTheDocument();

    // Verify row data
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Developer")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.getByText("Designer")).toBeInTheDocument();
  });

  it("handles sorting when header is clicked", () => {
    const handleStateChange = vi.fn();
    render(
      <Table
        columns={columns}
        data={data}
        onStateChange={handleStateChange}
      />
    );

    const idHeader = screen.getByText("ID");
    fireEvent.click(idHeader);

    expect(handleStateChange).toHaveBeenCalled();
  });

  it("handles selection checkboxes when enabled", () => {
    const handleStateChange = vi.fn();
    render(
      <Table
        columns={columns}
        data={data}
        features={{ selection: { enabled: true, multiple: true } }}
        onStateChange={handleStateChange}
      />
    );

    // Get the selection checkboxes
    const checkboxes = screen.getAllByRole("checkbox");
    // Header select-all checkbox, plus row checkboxes
    expect(checkboxes.length).toBe(3);

    fireEvent.click(checkboxes[1]); // select first row
    expect(handleStateChange).toHaveBeenCalled();
  });

  it("applies design token css classes to layout and rows", () => {
    const { container } = render(<Table columns={columns} data={data} />);

    // Container should use CSS variables
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("border-[var(--table-border)]");
    expect(wrapper).toHaveClass("bg-[var(--table-bg)]");

    // Head should use CSS variables
    const thead = container.querySelector("thead");
    expect(thead).toHaveClass("bg-[var(--table-header-bg)]");
    expect(thead).toHaveClass("border-[var(--table-border)]");

    // Rows should use hover/selected CSS variables
    const rows = container.querySelectorAll("tbody tr");
    expect(rows[0]).toHaveClass("hover:bg-[var(--table-row-hover)]");
    expect(rows[0]).toHaveClass("border-[var(--table-border)]");
  });
});
