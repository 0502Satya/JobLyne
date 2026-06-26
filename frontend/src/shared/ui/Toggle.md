# 🗚️ Toggle (Switch) Component

The `Toggle` component is a control that allows users to switch between two mutually exclusive options (e.g. turning a setting on/off).

---

## 📖 Purpose
Toggle represents a binary state with an *immediate* effect (e.g. changing theme, enabling/disabling notifications). It should never be paired with a "Save" button.

---

## 🎨 Token Hierarchy & Namespace

The component is configured via CSS classes mapping back to theme colors:

| State | CSS Classes / Tokens | Description |
|---|---|---|
| Track checked | `bg-primary` / `bg-success` / `bg-error` | Active filled background color |
| Track unchecked | `bg-surface-3` / `bg-success/10` / `bg-error/10` | Inactive track background color |
| Thumb | `bg-white shadow-xs` | Rounded floating knob |

---

## 📐 Specifications & Sizes

- **Heights**: Fluid container with `min-h-[44px]` touch target sizing.
- **Track Sizes**:
  - `sm`: Track `20px x 36px` (`h-5 w-9`)
  - `md` (default): Track `24px x 44px` (`h-6 w-11`)
  - `lg`: Track `28px x 56px` (`h-7 w-14`)
- **Thumb Sizes**:
  - `sm`: Thumb `14px x 14px` (`h-3.5 w-3.5`), Checked offset `translate-x-[16px]`
  - `md` (default): Thumb `18px x 18px` (`h-4.5 w-4.5`), Checked offset `translate-x-[20px]`
  - `lg`: Thumb `22px x 22px` (`h-5.5 w-5.5`), Checked offset `translate-x-[28px]`
- **Typography**: Label text uses `text-sm` (14px) font-medium (weight 500).
- **Gaps**: Label is separated from track by `ml-3` (12px); vertical helper/error text layout gap is `gap-1.5` (6px).

---

## 📊 Component State Matrix

| State | Visual Indicator(s) | ARIA & Accessibility | Trigger Condition |
|---|---|---|---|
| **Default Unchecked**| Gray track, thumb positioned left | `role="switch" aria-checked="false"` | `checked={false}` |
| **Default Checked** | Accent color track, thumb positioned right | `role="switch" aria-checked="true"` | `checked={true}` |
| **Hover** | Border/Track shifts contrast | None | Pointer hovering over active toggle |
| **Focused** | Ring around the track (`focus-visible:ring-2`) | `:focus-visible` only | Keyboard tab focus active |
| **Disabled** | Opacity 40%, cursor `cursor-not-allowed` | `disabled` attribute | `disabled={true}` |
| **Error** | Red track/border, error message and warning icon visible below | `aria-describedby` links error message | `state="error"` or `error` prop populated |
| **Valid** | Green track/border | None | `state="valid"` |

---

## ♿ Accessibility (WCAG 2.2 AA)

- **Semantic Role**: Leverages `<button role="switch">` to properly identify toggle interactions to assistive technologies.
- **Wired Labels**: Clicking labels toggles checked state.
- **Helper/Error Linking**: Dynamic `aria-describedby` links active validation/information logs to screen readers.
- **Reduced Motion**: Transitions respect user settings via standard Tailwind rules (`motion-reduce:transition-none`).

### Keyboard Interactions

| Key | Action |
|---|---|
| `Tab` | Moves focus to the toggle track button. |
| `Space` / `Enter` | Toggles the switch between checked and unchecked. |

---

## 💻 Usage Examples

```tsx
import Toggle from "@/shared/ui/Toggle";

<Toggle 
  label="Receive Email Alerts" 
  helper="Get notified about application status updates"
  checked={emailsEnabled}
  onChange={setEmailsEnabled}
/>
```

---

## ✅ Do & ❌ Don't

* **Do** use toggle for actions with immediate application.
* **Do** use standard labels (e.g. "Enabled") rather than descriptions within labels.
* **Don't** use a toggle in multi-field submission forms that have a "Submit" or "Save" button; use a standard checkbox instead.
* **Don't** animate elements if the user has requested reduced motion.
