# 🍞 Toast Component

The `Toast` component provides temporary, non-blocking alert feedback inside a dedicated viewport portal. It animates into view, displays status context, and automatically dismisses after a set period.

---

## 📖 Purpose
Used to confirm operation results (e.g. "Profile updated", "Connection failed") without forcing the user to stop their current workflow or interact with a dialog.

---

## 🚦 When to Use vs When Not to Use

### When to Use
- Concluding actions (e.g. saving forms, sending messages, deleting records).
- Real-time event notifications that do not break task context.

### When Not to Use
- When the user must explicitly confirm or acknowledge the action — use `Dialog` instead.
- For showing loading states of long-running page tasks — use inline skeleton loaders or page progress bars instead.

---

## 🎨 Token Hierarchy & Namespace

The component resolves styles using design tokens scoped to the `--toast-*` namespace:

| Component Token | Maps To (Light Mode) | Maps To (Dark Mode) | Description |
|---|---|---|---|
| `--toast-bg` | `var(--color-surface-overlay)` (`#ffffff`) | `#2d2d2d` | Toast window background fill |
| `--toast-border` | `var(--color-border)` (`#e2e8f0`) | `#2d2d2d` | Toast outer boundary line |
| `--toast-radius` | `8px` | `8px` | Toast border corner radius |
| `--toast-shadow` | `0 10px 15px -3px rgba(...)` | `none` | High depth outer box shadow |

Status colors mapped directly to the core semantic variables:
* Success: `var(--color-success)` / `var(--color-success-bg)`
* Error: `var(--color-error)` / `var(--color-error-bg)`
* Info: `var(--color-info)` / `var(--color-info-bg)`
* Warning: `var(--color-warning)` / `var(--color-warning-bg)`

---

## 📐 Specifications & Layouts

- **Position**: Typically rendered at the top-center or top-right of the viewport.
- **Animations**: Standard entry animation (`animate-in slide-in-from-top-2`) matching the design system transition speeds.
- **Padding**: Fixed layout spacing (`px-4 py-3`) with a horizontal gap (`gap-3`) between indicator icons and action status text messages.
- **Width**: Responsive cap configured at `max-w-sm` (`384px`).

---

## 🚦 State Machine (Lifecycle States)

1. **Trigger Phase**:
   - `toast.success(message)` or `toast.error(message)` is called.
2. **Mount Phase**:
   - The toast element is injected into the hot-toast portal wrapper.
   - Begins slide-in slide/fade animation.
3. **Display Phase**:
   - Persists for a default duration of `3000ms` (adjustable via option attributes).
4. **Dismiss Phase**:
   - Slide-out fade-away transition finishes.
   - Component unmounts from React tree automatically.

---

## ♿ Accessibility (WCAG 2.2 AA)

- **Aria Roles**: Toast container automatically uses `role="status"` and `aria-live="polite"` (or `role="alert"` / `aria-live="assertive"` for critical error toasts) ensuring assistive technologies read text changes immediately.
- **Content Contrast**: Visual contrast is strictly calculated: text elements default to `--color-text` while the status icon and surrounding borders inherit high-contrast status colors.

---

## 💻 Usage Examples

### Success Toast
```tsx
import toast from "@/shared/ui/Toast";

function handleSave() {
  try {
    saveData();
    toast.success("Profile saved successfully!");
  } catch (err) {
    toast.error("Failed to save changes. Please try again.");
  }
}
```

### Warning and Dismissing Toasts
```tsx
import toast from "@/shared/ui/Toast";

// Show warning toast
const toastId = toast.warning("Connection speed is low.");

// Dismiss manually
toast.dismiss(toastId);
```
