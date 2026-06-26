# 🗂️ Tabs Component

The `Tabs` component organizes content into separate, selectable panes, allowing users to switch views of the same object or context.

---

## 📖 Purpose
Tabs segment different views or functional pages within a single panel (e.g. Account settings tab, Notifications configuration tab) to reduce cognitive load and preserve screen space.

---

## 🎨 Token Hierarchy & Namespace

The component leverages general system variables and component tokens to render:

| Element | CSS Classes / Variable | Description |
|---|---|---|
| Active Tab Indicator | `--color-primary` | Accent highlight color |
| Background (Pill list) | `--color-surface-2` / `bg-surface-2/40` | Background container fill for pill variant |
| Tab hover state | `hover:text-text hover:bg-surface-2/60` | Interactive hover indicator |

---

## 📐 Specifications & Layouts

- **Heights**: 
  - Underline variant: Fluid / dictated by vertical padding (typically `~44px` height).
  - Pill list: `~40px` height container.
- **Padding**:
  - Underline variant buttons: `py-3 px-4` (12px vertical, 16px horizontal).
  - Pill variant buttons: `py-2 px-4` (8px vertical, 16px horizontal).
- **Border radius**:
  - Underline: None.
  - Pill buttons: `rounded-lg` (8px).
  - Pill container: `rounded-xl` (12px).
- **Typography**: `text-sm` (14px) font-medium (weight 500).
- **Icon gap**: `gap-2` (8px) between icon and text.

---

## 📊 Component State Matrix

| State | Visual Indicator(s) | ARIA & Accessibility | Trigger Condition |
|---|---|---|---|
| **Default (Unselected)**| Gray text (`text-muted`), no border/background | `aria-selected="false"`, `tabIndex={-1}` | Inactive tab button |
| **Hover** | Underline: border-border/60, text-text; Pill: background surface-2 | None | Mouse/Touch hovering on inactive tab |
| **Focused** | Focus outline `focus-visible:ring-2` (offset 2px) | `:focus-visible` only | Keyboard arrow focus roving focus |
| **Active / Selected** | Underline: border-primary, text-primary; Pill: solid primary fill | `aria-selected="true"`, `tabIndex={0}` | Active selected tab button |
| **Disabled** | Opacity 40%, cursor `cursor-not-allowed` | `aria-disabled="true"` | `disabled={true}` trigger |

---

## ♿ Accessibility (WCAG 2.2 AA)

- **Semantic Role**: Uses `role="tablist"` on the button wrapper, `role="tab"` on each button, and `role="tabpanel"` on each content panel.
- **Roving Tabindex**: Focus is managed dynamically. Only the active selected tab can receive initial focus (`tabIndex={0}`); all other tabs are removed from standard tab index flow (`tabIndex={-1}`) to prevent keyboard clutter.
- **Manual Activation**: Keyboard arrow navigation moves the focus index but does *not* auto-activate panels (WAI-ARIA recommended for heavy contents). Users must press `Enter` or `Space` to confirm activation.

### Keyboard Interactions

| Key | Action |
|---|---|
| `Tab` | Focuses the active tab (or leaves the tablist if active). |
| `ArrowRight` | Focuses the next enabled tab. Wraps to the first. |
| `ArrowLeft` | Focuses the previous enabled tab. Wraps to the last. |
| `Home` | Focuses the first enabled tab. |
| `End` | Focuses the last enabled tab. |
| `Space` / `Enter` | Activates the focused tab, loading its content panel. |

---

## 💻 Usage Examples

```tsx
import Tabs from "@/shared/ui/Tabs";

const items = [
  { id: "account", label: "Account Settings", content: <div>Account Panel</div> },
  { id: "security", label: "Security Settings", content: <div>Security Panel</div> },
];

<Tabs items={items} variant="underline" defaultTabId="account" />
```

---

## ✅ Do & ❌ Don't

* **Do** use tabs to toggle views on the same page; do not use them to represent sequential steps (use a progress stepper instead).
* **Do** provide clear labels that state the category content.
* **Don't** use too many tabs (limit to ~7 maximum).
* **Don't** hide disabled tabs entirely if they are contextually relevant to the user — apply `disabled` state to explain availability.
