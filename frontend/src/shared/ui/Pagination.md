# 📑 Pagination Component

The `Pagination` component provides navigation links to move between multiple pages of structured data.

---

## 📖 Purpose
Used to split a large collection of items (such as search results, audit logs, or notifications) into manageable subsets of pages, reducing initial load times and cognitive overload.

---

## 🎨 Token Hierarchy & Namespace

Pagination is a compound component composed of standard buttons and page indicators. It inherits styles from the standard `Button` tokens:

| Element | Component Token / CSS Variable | Description |
|---|---|---|
| Divider lines | `border-border/40` | Border separating pagination control from main layout |
| Active Page Button | `--button-primary-bg` / `var(--color-primary)` | Filled primary state for the current active page |
| Other Page Buttons | `--button-secondary-bg` / `var(--color-surface-2)` | Outline outline styling |

---

## 📐 Specifications & Sizes

- **Heights**: Nav container has vertical padding `py-4`; Button items are `32px` height (`sm` size variant).
- **Padding**:
  - Previous/Next Buttons: Standard `sm` horizontal padding.
  - Page Number Buttons: `px-3 py-1` (12px horizontal, 4px vertical).
  - Page Icon Buttons (Chevrons): `px-2.5 py-1` (10px horizontal, 4px vertical).
- **Border radius**: Page buttons are `rounded-md` (6px).
- **Typography**: Page indicators use `text-sm` (14px). Current active page is `font-semibold text-text`; normal numbers are `font-normal text-muted`.
- **Gaps**:
  - Container items (Previous vs Numbers list vs Next): `gap-4` (16px).
  - Desktop list page number items: `gap-1` (4px).

---

## 📊 Component State Matrix

Since pagination items are built with standard shared `Button` elements, states align with the Button matrices:

| State | Visual Indicator(s) | ARIA & Accessibility | Trigger Condition |
|---|---|---|---|
| **Default** | Outline border, gray text | `aria-label="Go to page X"`, `aria-current="false"` | Non-active, enabled page number |
| **Hover** | Background highlight, darker text | None | Mouse/Touch hovering on page link |
| **Focused** | Focus outline `focus-visible:ring-2` (offset 2px) | `:focus-visible` only | Keyboard tab navigation focus active |
| **Selected (Current)**| Primary background fill, white text | `aria-current="page"` | Current active page (`currentPage === pageNumber`) |
| **Disabled** | Opacity 50%, cursor `cursor-not-allowed` | `disabled` and `aria-disabled="true"` | Non-clickable edge buttons (e.g. Prev page on page 1) |

---

## ♿ Accessibility (WCAG 2.2 AA)

- **Semantic Navigation**: Wraps pagination elements inside `<nav aria-label="Pagination navigation">` to clarify the component's purpose to screen readers.
- **Wired Current Indicator**: Current active page button sets `aria-current="page"`.
- **Wired Labels**: Explicit `aria-label` labels are defined for all navigation elements (e.g., `aria-label="Go to page 4"`, `aria-label="Go to next page"`).
- **Ellipses**: Non-clickable spacing indicators (`...`) are hidden from screen readers via `aria-hidden="true"`.

### Keyboard Interactions

| Key | Action |
|---|---|
| `Tab` | Moves focus through the available page links. |
| `Enter` / `Space` | Navigates to/activates the focused page number. |

---

## 💻 Usage Examples

```tsx
import Pagination from "@/shared/ui/Pagination";

<Pagination 
  currentPage={3}
  totalPages={10}
  onPageChange={handlePageChange}
  siblingsCount={1}
  showEdgePages={true}
/>
```

---

## ✅ Do & ❌ Don't

* **Do** use pagination when page performance is critical and items can be referenced by index.
* **Do** hide pagination entirely if total pages is less than or equal to 1.
* **Don't** use pagination for infinite feeds (e.g. social media feeds — use infinite scrolling or load-more CTA instead).
* **Don't** allow active or disabled buttons to remain focusable in the screen-reader tree without appropriate state indicators.
