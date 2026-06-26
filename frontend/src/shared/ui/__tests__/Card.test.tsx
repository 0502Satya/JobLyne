import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Card from "../Card";

describe("Card Component", () => {
  it("renders standard elevated card with children", () => {
    render(<Card>Hello Card</Card>);
    const card = screen.getByText("Hello Card");
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass("bg-[var(--card-bg-elevated)]");
    expect(card).toHaveClass("border-[var(--card-border)]");
    expect(card).toHaveClass("[box-shadow:var(--card-shadow)]");
  });

  it("handles variants correctly", () => {
    const { rerender } = render(<Card variant="flat">Flat Card</Card>);
    let card = screen.getByText("Flat Card");
    expect(card).toHaveClass("bg-[var(--card-bg-flat)]");
    expect(card).toHaveClass("border-transparent");

    rerender(<Card variant="outline">Outline Card</Card>);
    card = screen.getByText("Outline Card");
    expect(card).toHaveClass("bg-[var(--card-bg-outline)]");
    expect(card).toHaveClass("border-[var(--card-border)]");
  });

  it("handles padding settings correctly for simple layouts", () => {
    const { rerender } = render(<Card padding="sm">Small Padding</Card>);
    let card = screen.getByText("Small Padding");
    expect(card).toHaveClass("p-4");

    rerender(<Card padding="lg">Large Padding</Card>);
    card = screen.getByText("Large Padding");
    expect(card).toHaveClass("p-8");

    rerender(<Card padding="none">No Padding</Card>);
    card = screen.getByText("No Padding");
    expect(card).toHaveClass("p-0");
  });

  it("supports hoverable transitions", () => {
    render(<Card hoverable>Hover Card</Card>);
    const card = screen.getByText("Hover Card");
    expect(card).toHaveClass("transition-all");
    expect(card).toHaveClass("hover:-translate-y-0.5");
  });

  it("supports polymorphic container tag elements", () => {
    render(<Card as="section">Section Card</Card>);
    const card = screen.getByText("Section Card");
    expect(card.tagName.toLowerCase()).toBe("section");
  });

  it("handles clickable card interactions and keyboard activations", () => {
    const handleClick = vi.fn();
    render(
      <Card clickable onClick={handleClick}>
        Click Me
      </Card>
    );
    const card = screen.getByText("Click Me");
    expect(card).toHaveAttribute("role", "button");
    expect(card).toHaveAttribute("tabindex", "0");
    expect(card).toHaveClass("cursor-pointer");

    // Click trigger
    fireEvent.click(card);
    expect(handleClick).toHaveBeenCalledTimes(1);

    // Keyboard Enter trigger
    fireEvent.keyDown(card, { key: "Enter" });
    expect(handleClick).toHaveBeenCalledTimes(2);

    // Keyboard Space trigger
    fireEvent.keyDown(card, { key: " " });
    expect(handleClick).toHaveBeenCalledTimes(3);
  });

  it("renders compound card layout subcomponents with context paddings", () => {
    render(
      <Card padding="md">
        <Card.Header title="Card Title" subtitle="Card Subtitle" divider />
        <Card.Content>Main content text</Card.Content>
        <Card.Footer divider>Footer text</Card.Footer>
      </Card>
    );

    // Verify header content exists
    expect(screen.getByText("Card Title")).toBeInTheDocument();
    expect(screen.getByText("Card Subtitle")).toBeInTheDocument();
    
    // Verify context padding is applied on inner layout components instead of parent
    const parent = screen.getByText("Card Title").closest(".rounded-\\[var\\(--card-radius\\)\\]");
    expect(parent).toHaveClass("p-0"); // parent padding is none because subcomponents are detected

    const header = screen.getByText("Card Title").closest("header");
    expect(header).toHaveClass("px-6");
    expect(header).toHaveClass("pt-6");
    expect(header).toHaveClass("border-b"); // divider line rendered

    const content = screen.getByText("Main content text");
    expect(content).toHaveClass("px-6");
    expect(content).toHaveClass("py-6");

    const footer = screen.getByText("Footer text");
    expect(footer).toHaveClass("px-6");
    expect(footer).toHaveClass("pb-6");
    expect(footer).toHaveClass("border-t"); // divider line rendered
  });
});
