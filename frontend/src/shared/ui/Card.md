# 📇 Card Component

The `Card` component acts as a structured surface to group related content, actions, and information. Under the Product Design Handbook, it provides clean, visually-quiet containers using 1px borders and subtle shadow elevations.

---

## 📖 Purpose
Cards chunk information to reduce cognitive load and organize dashboards, lists, or grids into readable panels.

---

## 🚦 When to Use vs When Not to Use

### When to Use
* To group related content blocks (e.g. user profile card, job listing teaser).
* To display dashboard widgets or metrics.
* To create grid layout cells (e.g., job lists, search results).

### When Not to Use
* For temporary overlays or notifications — use `Modal` or `Toast` instead.
* As a decorative layout wrapper with no logical groupings — keep layouts flat to minimize visual noise.

---

## 🎨 Token Hierarchy & Namespace

The component resolves styles using design tokens scoped to the `--card-*` namespace, referencing base system variables:

| Component Token | Maps To (Light Mode) | Maps To (Dark Mode) | Description |
|---|---|---|---|
| `--card-bg-elevated` | `var(--color-surface-1)` (`#ffffff`) | `#1e1e1e` | Background for elevated cards |
| `--card-bg-flat` | `var(--color-surface-2)` (`#f1f5f9`) | `#252525` | Background for flat cards |
| `--card-bg-outline` | `transparent` | `transparent` | Background for outline cards |
| `--card-border` | `var(--color-border)` (`#e2e8f0`) | `#2d2d2d` | Inner 1px card boundary line |
| `--card-border-hover` | `var(--color-muted)` (`#64748b`) | `#94a3b8` | Hover outline adjustment |
| `--card-shadow` | `0 1px 3px rgba(0, 0, 0, 0.05)` | `none` | Subtle light elevation shadow |
| `--card-shadow-hover` | `0 4px 12px rgba(0, 0, 0, 0.07)` | `none` | Elevated hover shadow |
| `--card-radius` | `12px` | `12px` | Standard card border radius |

---

## 📐 Specifications & Padding

Structured sub-components (`Card.Header`, `Card.Content`, `Card.Footer`) automatically read padding rules from `CardContext` to align content elements, allowing division lines (`divider={true}`) to extend edge-to-edge:

* **`none`**: No padding (`p-0`). Best for custom layouts or hero media images.
* **`sm`** (Compact): `16px` padding scale (`p-4` / `px-4 py-4`).
* **`md`** (Default): `24px` padding scale (`p-6` / `px-6 py-6`).
* **`lg`** (Large): `32px` padding scale (`p-8` / `px-8 py-8`).

---

## 📊 Component State Matrix

| State | Visual Indicator(s) | ARIA & Accessibility | Trigger Condition |
|---|---|---|---|
| **Default** | Border `--card-border`, shadow `--card-shadow`, base background | None | Normal static card state |
| **Hover** | Border color transitions to `--card-border-hover`, shadow shifts to `--card-shadow-hover`, vertical translate `-translate-y-0.5` | None | Pointer device hovering (when `hoverable={true}` or `clickable={true}`) |
| **Pressed** | Scaling compression (`active:scale-[0.99]`) | None | Mouse/Touch click in progress (when `clickable={true}`) |
| **Focused** | Focus ring: 2px primary offset 2px | `:focus-visible` only | Keyboard focus focus-in (when `clickable={true}`) |
| **Disabled** | Opacity 50%, interactions ignored, cursor `cursor-not-allowed` | `aria-disabled="true"` | Custom disabled status override |

---

## ♿ Accessibility (WCAG 2.2 AA)

- **Semantic Role**: If a card is `clickable={true}`, it receives `role="button"` and `tabIndex={0}`.
- **Keyboard activation**: Clickable cards capture `KeyDown` events. Tapping `Enter` or `Space` triggers the `onClick` callback.
- **Aria Hidden**: Decorative headers and dividers are managed correctly.

### Keyboard Interactions

| Key | Action |
|---|---|
| `Tab` | Moves focus to the card (when `clickable={true}`). |
| `Enter` / `Space` | Triggers the `onClick` action (when `clickable={true}`). |

---

## 💻 Usage Examples

### Simple Card
```tsx
import Card from "@/shared/ui/Card";

<Card variant="elevated" padding="md">
  <p>Standard text card content goes here.</p>
</Card>
```

### Compound Card with Edge-to-Edge Dividers
```tsx
import Card from "@/shared/ui/Card";

<Card variant="elevated" padding="md">
  <Card.Header 
    title="User Information" 
    subtitle="Manage your primary login details." 
    divider
  />
  <Card.Content>
    <p>Card content fits here with identical horizontal indentation.</p>
  </Card.Content>
  <Card.Footer divider>
    <div className="flex justify-end gap-2">
      <Button variant="secondary">Cancel</Button>
      <Button variant="primary">Save Changes</Button>
    </div>
  </Card.Footer>
</Card>
```

---

## ✅ Do & ❌ Don't

* **Do** use subcomponents (`Card.Header`, `Card.Content`, `Card.Footer`) if you need section dividers.
* **Do** enable `clickable` and supply `onClick` if the card represents a navigate or submit button.
* **Don't** set padding on the parent `Card` container if you are manually styling custom internal grids; set `padding="none"` instead.
* **Don't** add hover micro-animations to static non-interactive cards.
