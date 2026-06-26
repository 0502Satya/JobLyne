# Table Component Documentation

The `Table` component is a high-performance, accessible, and theme-compliant data grid system built for React. It is fully integrated with the design system using CSS variables, allowing seamless dark mode transitions and customizable theme styling.

---

## Architectural Design & Features

- **Decoupled Architecture**: Composed of a state management hook/provider (`useTableState`), core feature drivers (sorting, pagination, virtualization, column visibility), and semantic UI sub-components (`TableHeader`, `TableBody`, `TableRow`, `TableCell`).
- **Semantic HTML & Accessibility**: Adheres strictly to the WAI-ARIA grid role pattern:
  - Real table element primitives (`<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>`).
  - Strict keyboard accessibility (`Tab`, arrow keys, selection keys).
  - Screen reader live-region alerts for dynamic updates (e.g. sorting updates).
- **Virtualization Driver**: Supports rendering large lists (10k+ rows) smoothly by viewport virtualization.
- **Dynamic Pinning**: Supports pinning key columns to the left or right edges with sticky positioning.

---

## Design Tokens (CSS Variables)

The component styles bind directly to CSS variables defined in [globals.css](file:///c:/Users/abcom/Desktop/Project/JobLyne/frontend/src/app/globals.css):

| Variable Name | Purpose / Description | Default (Light Mode) | Default (Dark Mode) |
|---|---|---|---|
| `--table-bg` | Background of the table container | `var(--color-surface-1)` | `var(--color-surface-1)` |
| `--table-border` | Border separating rows, columns, and headers | `var(--color-border)` | `var(--color-border)` |
| `--table-header-bg` | Header row background | `var(--color-surface-2)` | `var(--color-surface-2)` |
| `--table-header-color` | Text color of headers | `var(--color-muted)` | `var(--color-muted)` |
| `--table-row-hover` | Row background color on hover | `rgba(241, 245, 249, 0.5)` | `rgba(30, 30, 30, 0.5)` |
| `--table-row-selected` | Row background color when selected | `rgba(0, 111, 255, 0.04)` | `rgba(0, 111, 255, 0.08)` |

---

## API Reference

### Component Architecture
```
<Table instance={tableInstance}>
  <TableHeader />
  <TableBody />
</Table>
```

### Table Properties
- `instance`: The return value of the `useTable` custom hook.
- `className`: Optional custom classes applied to the container.

---

## Keyboard Navigation Reference

The table behaves like an interactive grid when active:
- **`Tab`**: Enter the table grid system or navigate outer controls.
- **`ArrowLeft` / `ArrowRight`**: Move focus horizontally between cells.
- **`ArrowUp` / `ArrowDown`**: Move focus vertically between cells.
- **`Space` / `Enter`**: Activate interactive components inside a focused cell (e.g., checkbox or button).
- **`Home` / `End`**: Jump to the first or last cell in the active row.
