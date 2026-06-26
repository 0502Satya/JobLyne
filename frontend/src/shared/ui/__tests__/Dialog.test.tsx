import React from "react";
import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Dialog from "../Dialog";

// jsdom doesn't support showModal() and close() on HTMLDialogElement by default.
// Mock them here to test React wrapper state transitions.
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute("open", "");
    // Trigger custom event or sync visibility
    this.dispatchEvent(new Event("toggle"));
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("toggle"));
  });
});

describe("Dialog Component", () => {
  it("does not render open attribute if isOpen is false", () => {
    const { container } = render(
      <Dialog isOpen={false} onClose={() => {}}>
        Dialog Content
      </Dialog>
    );
    const dialog = container.querySelector("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog).not.toHaveAttribute("open");
  });

  it("renders open attribute and content if isOpen is true", () => {
    render(
      <Dialog isOpen={true} onClose={() => {}}>
        Dialog Content
      </Dialog>
    );
    const dialogElement = screen.getByText("Dialog Content");
    expect(dialogElement).toBeInTheDocument();
    
    const dialog = dialogElement.closest("dialog");
    expect(dialog).toHaveAttribute("open");
  });

  it("handles sizing attributes correctly", () => {
    const { rerender } = render(
      <Dialog isOpen={true} onClose={() => {}} size="sm">
        Small Dialog
      </Dialog>
    );
    let dialog = screen.getByText("Small Dialog").closest("dialog");
    expect(dialog).toHaveClass("max-w-sm");

    rerender(
      <Dialog isOpen={true} onClose={() => {}} size="lg">
        Large Dialog
      </Dialog>
    );
    dialog = screen.getByText("Large Dialog").closest("dialog");
    expect(dialog).toHaveClass("max-w-2xl");
  });

  it("renders status border colors and warning/info icons correctly", () => {
    const { rerender, container } = render(
      <Dialog isOpen={true} onClose={() => {}} status="destructive">
        Destructive Info
      </Dialog>
    );
    let dialog = screen.getByText("Destructive Info").closest("dialog");
    expect(dialog).toHaveClass("border-l-4");
    expect(dialog).toHaveClass("border-l-error");

    rerender(
      <Dialog isOpen={true} onClose={() => {}} status="warning">
        Warning Info
      </Dialog>
    );
    dialog = screen.getByText("Warning Info").closest("dialog");
    expect(dialog).toHaveClass("border-l-4");
    expect(dialog).toHaveClass("border-l-warning");
    // Verify AlertTriangle warning icon was loaded
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("triggers onClose callback when close button is clicked", () => {
    const handleClose = vi.fn();
    render(
      <Dialog isOpen={true} onClose={handleClose} title="Close Test">
        Closable dialog content
      </Dialog>
    );
    const closeBtn = screen.getByRole("button", { name: "Close dialog" });
    expect(closeBtn).toBeInTheDocument();

    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
