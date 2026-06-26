# 🪟 Dialog (Modal) Component

The `Dialog` component uses the native HTML `<dialog>` element to present critical, blocking overlays to users. It enforces keyboard focus traps, dismisses on `Esc` keys, and correctly restores focus to the initiating page element when closed.

---

## 📖 Purpose
Used for workflows requiring high friction or distinct separation of task contexts (e.g. signup, confirmation workflows, editing profile panels).

---

## 🚦 When to Use vs When Not to Use

### When to Use
* For destructive confirmation steps (e.g. deleting an account).
* For detailed data input flows (e.g. updating work experiences or skills).
* For non-disruptive, contextual alerts (e.g. session timeouts).

### When Not to Use
* For non-blocking notifications — use `Toast` instead.
* For simple text formatting or definitions — use `Tooltip` or `Popover` instead.

---

## 🎨 Token Hierarchy & Namespace

The component resolves styles using design tokens scoped to the `--dialog-*` namespace:

| Component Token | Maps To (Light Mode) | Maps To (Dark Mode) | Description |
|---|---|---|---|
| `--dialog-bg` | `var(--color-surface-overlay)` (`#ffffff`) | `#2d2d2d` | Overlay background fill |
| `--dialog-border` | `var(--color-border)` (`#e2e8f0`) | `#2d2d2d` | Dialog box boundary line |
| `--dialog-radius` | `16px` | `16px` | Dialog corner roundness |
| `--dialog-shadow` | `0 20px 25px -5px rgba(...)` | `none` | High shadow overlay depth |
| `--dialog-backdrop-bg` | `rgba(0, 0, 0, 0.4)` | `rgba(0, 0, 0, 0.4)` | Overlay backdrop color |
| `--dialog-backdrop-blur` | `4px` | `4px` | Overlay background blur factor |

---

## 📐 Specifications & Layouts

* **Sizes**:
  - `sm`: Max width `384px` (e.g. short confirm/cancel prompts).
  - `md` (Default): Max width `512px` (e.g. basic forms).
  - `lg`: Max width `728px` (e.g. multi-step configuration panels).
  - `full`: Viewport fluid width (mobile/fullscreen workflows).
* **Backdrop**: Sets a standard layout barrier using `var(--dialog-backdrop-bg)` with standard `backdrop-filter: blur(var(--dialog-backdrop-blur))`.
* **Transitions**: Smooth entry scaling transitions (`animate-in scale-in duration-200`) configured to match the user's `prefers-reduced-motion` settings.

---

## 📊 Component State Matrix

| State | Visual Indicator(s) | ARIA & Accessibility | Trigger Condition |
|---|---|---|---|
| **Closed** | Modal hidden, backdrop hidden | `aria-modal="true"` ignored, hidden | `isOpen={false}` |
| **Opening** | Backdrop fades in, modal scales up from center | Triggers `.showModal()`, focus saved | `isOpen` changes from `false` to `true` |
| **Open (Focus Captured)** | Modal fully visible with backdrop blur, backdrop dim active | Focus trapped; `aria-modal="true"`, cycles Tab focus | Active visible modal state |
| **Closing** | Backdrop fades out, modal scales down | Focus restored to trigger element, triggers `.close()` | `isOpen` changes from `true` to `false` or Esc/Close trigger |

---

## ♿ Accessibility (WCAG 2.2 AA)

- **Semantic Role**: Dialog exposes `aria-modal="true"`, native `onCancel` (triggers on `Esc`), and maps `aria-labelledby` directly to the dialog title.
- **Focus Management**:
  - Active trigger restoration prevents navigation loss.
  - Cycle trap ignores elements with `disabled` or `tabIndex="-1"`.
  - Close button features an explicit hover state and explicit focus-ring override matching standard design criteria.

### Keyboard Interactions

| Key | Action |
|---|---|
| `Tab` | Cycles focus to the next focusable element inside the dialog. Wraps to first element if active on the last. |
| `Shift + Tab` | Cycles focus to the previous focusable element inside the dialog. Wraps to last element if active on the first. |
| `Escape` | Dismisses/closes the dialog. |

---

## 💻 Usage Examples

### Simple Confirmation Dialog
```tsx
import { useState } from "react";
import Dialog from "@/shared/ui/Dialog";
import Button from "@/shared/ui/Button";

export default function ConfirmDelete() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="danger" onClick={() => setOpen(true)}>
        Delete Account
      </Button>

      <Dialog
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Confirm Deletion"
        size="sm"
        status="destructive"
        footer={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger">
              Confirm Delete
            </Button>
          </div>
        }
      >
        <p>This action is irreversible. Are you sure you want to delete your profile?</p>
      </Dialog>
    </>
  );
}
```
