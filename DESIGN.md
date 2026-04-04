# Design System Specification: Editorial Precision for F&B

## 1. Overview & Creative North Star: "The Tactile Sommelier"
The design system moves away from the sterile, "calculator-style" layouts common in F&B POS systems. Instead, it adopts the **Creative North Star of "The Tactile Sommelier."** This philosophy treats the digital interface like a high-end physical menu or a curated tasting card. 

We achieve "Modern Minimalism" not through empty space, but through **intentional editorial hierarchy**. By utilizing dramatic scale shifts in typography and a "layered paper" approach to depth, the system feels expensive, high-trust, and incredibly efficient. We break the grid with intentional asymmetry—placing key actions on floating "glass" layers while the main inventory breathes on deep, textured backgrounds.

---

## 2. Colors: Tonal Depth & The Emerald Pulse
The palette is anchored in **Deep Charcoal (`#1C1B1B`)** and **Crisp White (`#FCF9F8`)**, using **Emerald Green (`#006D43`)** as a surgical strike of color for primary intent.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to section content. Boundaries must be defined solely through background color shifts. Use `surface-container-low` for secondary sections and `surface` for the main canvas.

### Surface Hierarchy & Nesting
Treat the UI as a series of nested physical layers. 
*   **Base Layer:** `surface` (#FCF9F8)
*   **Secondary Context (e.g., Sidebar):** `surface-container-low` (#F6F3F2)
*   **Active Cards/Modals:** `surface-container-lowest` (#FFFFFF)
*   **Hover/Active States:** `surface-container-high` (#EBE7E7)

### The "Glass & Gradient" Rule
To elevate the experience, use **Glassmorphism** for floating elements like "Order Summaries" or "Checkout Drawers." 
*   **Value:** Use `surface_variant` at 70% opacity with a `24px` backdrop blur.
*   **Signature Textures:** Main CTAs should not be flat. Apply a subtle linear gradient from `primary` (#006D43) to `primary_container` (#00A86B) at a 135-degree angle to provide "soul" and a sense of pressable volume.

---

## 3. Typography: Editorial Authority
We utilize a dual-font strategy to balance high-end brand feel with rapid-fire legibility.

*   **Display & Headlines (Manrope):** Used for large totals, table numbers, and category headers. The geometric nature of Manrope provides a modern, "custom" architectural feel. 
    *   *Example:* `display-lg` (3.5rem) for the final transaction total.
*   **Body & Labels (Inter):** Used for item names, modifiers, and technical data. Inter is chosen for its exceptional x-height and readability on tablet screens under harsh restaurant lighting.
    *   *Hierarchy Tip:* Use `label-md` in all-caps with `0.05em` letter spacing for technical metadata (e.g., "SKU: 4922") to distinguish it from the "human" text of the menu.

---

## 4. Elevation & Depth: Tonal Layering
Traditional shadows are often "dirty." In this system, we use light and tone to communicate importance.

*   **The Layering Principle:** Instead of a shadow, place a `surface-container-lowest` card on a `surface-container-low` background. This "paper-on-table" effect is cleaner and reduces visual noise.
*   **Ambient Shadows:** For high-priority floating elements (like a "Pay" button), use an extra-diffused shadow: `Y: 12px, Blur: 32px, Color: on-surface (8% opacity)`.
*   **The Ghost Border Fallback:** If a border is required for accessibility, use the `outline-variant` (#BCCABE) at **15% opacity**. Never use a 100% opaque border.

---

## 5. Components: Tactile & High-Response

### Buttons (The Interaction Core)
*   **Primary:** Gradient-filled (Emerald), `1.5rem` (xl) rounded corners. Height: `64px` for tablet dominance.
*   **Secondary:** `surface-container-highest` background with `on-surface` text. No border.
*   **Tertiary:** Ghost style. Transparent background with `primary` text. Use only for low-priority "Cancel" or "Back" actions.

### Cards & Lists (No-Divider Policy)
*   **Forbid dividers.** Use `3.5rem` (spacing 10) of vertical white space to separate major groups. For individual line items, use a subtle background shift: alternating between `surface` and `surface-container-low`.
*   **Touch Targets:** Every list item must have a minimum height of `56px`.

### Input Fields
*   **Style:** Minimalist underline or soft-filled. Use `surface-container-highest` with a `2px` bottom-weighted indicator in `primary` when focused.
*   **Feedback:** Error states must use `error` (#BA1A1A) text and a `surface-container-highest` background—never a red border alone.

### Custom Component: The "Quick-Action Glass"
A floating bar at the bottom of the screen using the Glassmorphism rule. It contains the "Total" and "Send to Kitchen" actions, ensuring the most important F&B data is always anchored regardless of scroll position.

---

## 6. Do's and Don'ts

### Do:
*   **Use Asymmetry:** Place the "Total" in a massive `display-lg` font size while keeping the "Tax" in `body-sm` to create an editorial focus.
*   **Embrace Large Radii:** Use `xl` (1.5rem) for major containers and `md` (0.75rem) for internal chips.
*   **Prioritize the Right Hand:** Place high-frequency action buttons (Add Item, Pay) on the right side of the tablet layout for ergonomic speed.

### Don't:
*   **Don't use #000000:** Always use the `on-surface` Charcoal for text to maintain a premium, softer contrast.
*   **Don't use 1px Dividers:** They create "visual stutter." Use the spacing scale to create separation.
*   **Don't Default to "Medium" Sizing:** In F&B, either an element is a "Hero" (Big, Bold, Emerald) or it is "Support" (Small, Grey, Clean). Avoid the middle ground.