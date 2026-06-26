import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Button from "../Button";

describe("Button Component", () => {
  it("renders with children text by default", () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("bg-[var(--button-primary-bg)]");
  });

  it("polymorphically renders as another tag (e.g. anchor / link)", () => {
    render(<Button as="a" href="https://example.com">Go Link</Button>);
    const link = screen.getByRole("link", { name: /go link/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "https://example.com");
  });

  it("handles variants and sizes correctly", () => {
    const { rerender } = render(<Button variant="danger" size="lg">Delete</Button>);
    let button = screen.getByRole("button", { name: /delete/i });
    expect(button).toHaveClass("bg-[var(--button-danger-bg)]");
    expect(button).toHaveClass("h-12");

    rerender(<Button variant="outline" size="sm">Cancel</Button>);
    button = screen.getByRole("button", { name: /cancel/i });
    expect(button).toHaveClass("bg-[var(--button-outline-bg)]");
    expect(button).toHaveClass("h-8");
  });

  it("handles loading state (renders spinner, retains label, disables interaction)", () => {
    const handleClick = vi.fn();
    render(
      <Button isLoading onClick={handleClick}>
        Saving
      </Button>
    );

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toHaveAttribute("aria-live", "polite");
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent("Saving");

    // Click should not fire since it is disabled/loading
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("handles disabled state correctly", () => {
    const handleClick = vi.fn();
    render(
      <Button disabled onClick={handleClick}>
        Disabled Button
      </Button>
    );

    const button = screen.getByRole("button", { name: /disabled button/i });
    expect(button).toBeDisabled();
    expect(button).toHaveClass("bg-[var(--button-disabled-bg)]!");

    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("renders status state correctly (e.g., success overrides normal variant)", () => {
    render(
      <Button variant="primary" status="success">
        Success Action
      </Button>
    );

    const button = screen.getByRole("button", { name: /success action/i });
    expect(button).toHaveClass("bg-[var(--button-success-bg)]");
  });

  it("supports leftIcon and rightIcon rendering", () => {
    render(
      <Button leftIcon={<span data-testid="left-icon">←</span>} rightIcon={<span data-testid="right-icon">→</span>}>
        Nav
      </Button>
    );

    expect(screen.getByTestId("left-icon")).toBeInTheDocument();
    expect(screen.getByTestId("right-icon")).toBeInTheDocument();
  });

  it("supports icon-only buttons with required aria-label and Fitts's target expansion", () => {
    render(
      <Button icon={<span data-testid="search-icon">🔍</span>} aria-label="Search" size="sm" />
    );

    const button = screen.getByRole("button", { name: /search/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("after:absolute"); // Fitts's target expansion class
    expect(screen.getByTestId("search-icon")).toBeInTheDocument();
  });
});
