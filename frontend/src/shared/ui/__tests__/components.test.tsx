import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  Text,
  Skeleton,
  SkeletonAvatar,
  SkeletonText,
  SkeletonCard,
  EmptyState,
  ErrorState,
  FormField,
} from "../index";

describe("Typography Component (Text)", () => {
  it("renders as span by default (when explicitly chosen or for inline variants)", () => {
    const { container } = render(<Text as="span">Default Text</Text>);
    expect(container.querySelector("span")).toBeInTheDocument();
    expect(container.querySelector("span")).toHaveTextContent("Default Text");
  });

  it("polymorphically renders as another tag (e.g. h1 or p)", () => {
    const { container } = render(<Text as="h1">Hero Title</Text>);
    expect(container.querySelector("h1")).toBeInTheDocument();
    expect(container.querySelector("h1")).toHaveClass("type-body"); // variant defaults to body
  });

  it("applies variant classes and weights properly", () => {
    const { container } = render(
      <Text variant="h1" weight="bold" align="center">
        Header Content
      </Text>
    );
    const element = container.querySelector("h1");
    expect(element).toHaveClass("type-h1");
    expect(element).toHaveClass("weight-display");
    expect(element).toHaveClass("text-center");
  });

  it("supports text clamping classes", () => {
    const { container } = render(<Text variant="body" clamp={3}>Clamped Text</Text>);
    expect(container.querySelector("p")).toHaveClass("line-clamp-3");
  });
});

describe("Skeleton Loading Placeholders", () => {
  it("renders with base default pulse styles", () => {
    const { container } = render(<Skeleton variant="rectangular" height={50} width={100} />);
    const div = container.querySelector("div") as HTMLElement;
    expect(div).toHaveClass("animate-pulse");
    expect(div.style.height).toBe("50px");
    expect(div.style.width).toBe("100px");
  });

  it("supports wave animation variant", () => {
    const { container } = render(<SkeletonAvatar animation="wave" />);
    const avatar = container.querySelector("div") as HTMLElement;
    expect(avatar).toHaveClass("animate-skeleton-wave");
  });

  it("composes SkeletonText and lists", () => {
    const { container } = render(<SkeletonText lines={4} />);
    const lines = container.querySelectorAll(".h-4");
    expect(lines).toHaveLength(4);
  });
});

describe("EmptyState Panel presets", () => {
  it("renders generic state if no preset is defined", () => {
    render(<EmptyState />);
    expect(screen.getByText("No item selected")).toBeInTheDocument();
  });

  it("resolves presets (e.g. search) and supports title/description overrides", () => {
    render(
      <EmptyState
        preset="search"
        title="Custom title search"
        description="Custom Desc Search"
      />
    );
    expect(screen.getByText("Custom title search")).toBeInTheDocument();
    expect(screen.getByText("Custom Desc Search")).toBeInTheDocument();
  });
});

describe("ErrorState Panel presets", () => {
  it("renders standard error types and executes onRetry callbacks", () => {
    const handleRetry = vi.fn();
    render(<ErrorState type="network" onRetry={handleRetry} />);
    expect(screen.getByText("Connection handshake failure")).toBeInTheDocument();
    
    const retryBtn = screen.getByRole("button", { name: /try again/i });
    fireEvent.click(retryBtn);
    expect(handleRetry).toHaveBeenCalledOnce();
  });
});

describe("FormField Validation & Accessibility", () => {
  it("links label HTMLFor with child input element dynamically", () => {
    render(
      <FormField label="Dynamic label name">
        <input name="test-field" />
      </FormField>
    );
    const label = screen.getByText("Dynamic label name");
    const input = screen.getByRole("textbox");
    expect(label).toHaveAttribute("for", input.id);
  });

  it("applies border rings and renders status error overlays", () => {
    render(
      <FormField label="Email input" error="Incorrect email format">
        <input name="email" />
      </FormField>
    );
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveClass("border-error!");
    expect(screen.getByRole("alert")).toHaveTextContent("Incorrect email format");
  });
});
