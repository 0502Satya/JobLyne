import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { toast } from "../Toast";

// Mock react-hot-toast to inspect toast element components directly
vi.mock("react-hot-toast", () => {
  return {
    toast: {
      custom: vi.fn((renderFn) => {
        return renderFn({ id: "mock-toast-id", visible: true });
      }),
      dismiss: vi.fn(),
    },
    default: {
      custom: vi.fn(),
      dismiss: vi.fn(),
    },
  };
});

describe("Toast Component", () => {
  it("renders success toast with correct styles and icon", () => {
    const successToast = toast.success("Successful action message");
    render(successToast);

    const messageSpan = screen.getByText("Successful action message");
    expect(messageSpan).toBeInTheDocument();

    const parentDiv = messageSpan.closest("div");
    expect(parentDiv).toHaveClass("rounded-[var(--toast-radius)]");
    expect(parentDiv).toHaveClass("border-[var(--color-success)]/20");
    expect(parentDiv).toHaveClass("bg-[var(--color-success-bg)]");
    expect(parentDiv).toHaveClass("text-[var(--color-success)]");
  });

  it("renders error toast with correct status classes", () => {
    const errorToast = toast.error("Error occurred");
    render(errorToast);

    const messageSpan = screen.getByText("Error occurred");
    const parentDiv = messageSpan.closest("div");
    expect(parentDiv).toHaveClass("border-[var(--color-error)]/20");
    expect(parentDiv).toHaveClass("bg-[var(--color-error-bg)]");
    expect(parentDiv).toHaveClass("text-[var(--color-error)]");
  });

  it("renders warning toast with correct warning classes", () => {
    const warningToast = toast.warning("Warning message");
    render(warningToast);

    const messageSpan = screen.getByText("Warning message");
    const parentDiv = messageSpan.closest("div");
    expect(parentDiv).toHaveClass("border-[var(--color-warning)]/20");
    expect(parentDiv).toHaveClass("bg-[var(--color-warning-bg)]");
    expect(parentDiv).toHaveClass("text-[var(--color-warning)]");
  });

  it("renders info toast with correct info classes", () => {
    const infoToast = toast.info("Info message");
    render(infoToast);

    const messageSpan = screen.getByText("Info message");
    const parentDiv = messageSpan.closest("div");
    expect(parentDiv).toHaveClass("border-[var(--color-info)]/20");
    expect(parentDiv).toHaveClass("bg-[var(--color-info-bg)]");
    expect(parentDiv).toHaveClass("text-[var(--color-info)]");
  });
});
