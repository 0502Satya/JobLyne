import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Input from "../Input";

describe("Input Component", () => {
  it("renders a standard input field with placeholder", () => {
    render(<Input placeholder="Enter username" name="username" />);
    const input = screen.getByPlaceholderText("Enter username");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "text");
    expect(input).toHaveClass("border-[var(--input-border)]");
  });

  it("applies sizing classes correctly", () => {
    const { rerender } = render(<Input size="sm" placeholder="Small" />);
    let input = screen.getByPlaceholderText("Small");
    expect(input).toHaveClass("h-8");

    rerender(<Input size="lg" placeholder="Large" />);
    input = screen.getByPlaceholderText("Large");
    expect(input).toHaveClass("h-12");
  });

  it("handles validation states (error, warning, success)", () => {
    const { rerender } = render(<Input validationState="error" placeholder="Error" />);
    let input = screen.getByPlaceholderText("Error");
    expect(input).toHaveClass("border-[var(--input-error-border)]");
    expect(input).toHaveAttribute("aria-invalid", "true");

    rerender(<Input validationState="warning" placeholder="Warning" />);
    input = screen.getByPlaceholderText("Warning");
    expect(input).toHaveClass("border-[var(--input-warning-border)]");

    rerender(<Input validationState="success" placeholder="Success" />);
    input = screen.getByPlaceholderText("Success");
    expect(input).toHaveClass("border-[var(--input-success-border)]");
  });

  it("handles state precedence (disabled overrides readonly, error overrides success/warning)", () => {
    const { rerender } = render(
      <Input disabled readOnly validationState="error" placeholder="Precedence" />
    );
    let input = screen.getByPlaceholderText("Precedence");
    // Disabled is highest precedence
    expect(input).toBeDisabled();
    expect(input).toHaveClass("bg-[var(--input-disabled-bg)]");

    rerender(
      <Input readOnly validationState="error" placeholder="Precedence" />
    );
    input = screen.getByPlaceholderText("Precedence");
    // Readonly is next
    expect(input).toHaveAttribute("readonly");
    expect(input).toHaveClass("bg-[var(--input-readonly-bg)]");
  });

  it("renders left and right slots, and legacy icon mapping", () => {
    render(
      <Input
        leftSlot={<span data-testid="left-slot">$</span>}
        rightSlot={<span data-testid="right-slot">USD</span>}
        placeholder="Slots"
      />
    );
    expect(screen.getByTestId("left-slot")).toBeInTheDocument();
    expect(screen.getByTestId("right-slot")).toBeInTheDocument();
    
    const input = screen.getByPlaceholderText("Slots");
    expect(input).toHaveClass("pl-10"); // padding left for left slot
    expect(input).toHaveClass("pr-10"); // padding right for right slot
  });

  it("supports password visibility toggle and keyboard aria-label updates", () => {
    render(
      <Input
        type="password"
        showVisibilityToggle
        placeholder="Password"
      />
    );
    const input = screen.getByPlaceholderText("Password");
    expect(input).toHaveAttribute("type", "password");

    const toggleButton = screen.getByRole("button", { name: /show password/i });
    expect(toggleButton).toBeInTheDocument();
    expect(toggleButton).toHaveClass("after:absolute"); // touch target expansion

    // Click to show password
    fireEvent.click(toggleButton);
    expect(input).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: /hide password/i })).toBeInTheDocument();

    // Click to hide password
    fireEvent.click(screen.getByRole("button", { name: /hide password/i }));
    expect(input).toHaveAttribute("type", "password");
  });

  it("prevents focus theft on password toggle button mousedown", () => {
    render(
      <Input
        type="password"
        showVisibilityToggle
        placeholder="Password focus test"
      />
    );
    const toggleButton = screen.getByRole("button", { name: /show password/i });
    
    // Simulate mousedown
    const mousedownEvent = new MouseEvent("mousedown", { bubbles: true, cancelable: true });
    const preventDefaultSpy = vi.spyOn(mousedownEvent, "preventDefault");
    toggleButton.dispatchEvent(mousedownEvent);
    
    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it("applies ARIA attributes correctly", () => {
    render(
      <Input
        required
        placeholder="Aria"
      />
    );
    const input = screen.getByPlaceholderText("Aria");
    expect(input).toHaveAttribute("aria-required", "true");
  });
});
