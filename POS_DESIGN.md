# Design System: POS F&B Tablet App

## 1. Visual Theme & Atmosphere

This POS system should feel calm, fast, and trustworthy under pressure. The interface is not a showcase piece; it is a working surface for a solo operator who needs to move from product selection to payment confirmation with minimal cognitive friction. The visual direction combines three complementary references: the **clarity and precision of Linear**, the **structured data ergonomics of Airtable**, and the **warmer hospitality-oriented finish of modern restaurant POS case studies like Cosy POS**. The result should feel operational first, premium second.

The emotional tone is **modern minimalism with hospitality warmth**. Unlike enterprise dashboards that can feel cold or overly dense, this system should feel welcoming enough for F&B while still being highly utilitarian. The dark mode should feel composed and high-contrast rather than neon or overly decorative. Light mode should feel airy and clean without becoming sterile. The interface should reward repeated use: predictable patterns, stable layouts, and restrained visual variety.

Typography should privilege scannability over flourish. Headlines are concise and firm. Prices, totals, stock counts, and payment states receive the strongest emphasis. Secondary descriptive text is softened but never low-contrast enough to become hard to read on a tablet in active use. Long product names, transaction IDs, and bilingual labels must wrap safely and preserve layout integrity.

The visual composition should avoid marketing-style dramatics. No oversized gradients, no ornamental illustrations, no decorative texture. Surface contrast, spacing, typography, and status color are enough. Dashboard screens may carry a small amount of polish and visual softness, but cashier screens must remain decisively functional. The interface itself should recede so the operator’s focus stays on menu items, totals, stock state, and transaction completion.

**Key Characteristics:**
- Hybrid foundation: **Linear structure + Airtable data patterns + soft hospitality polish**
- Designed for **tablet-first**, **touch-first**, **solo operator** usage
- **Operational hierarchy**: products, totals, status, and primary actions always dominate
- **Low-friction dark mode** with high contrast and restrained accents
- **Dense enough for productivity**, but never cramped or technical-looking
- **Large touch targets** and strong spacing rhythm for rapid cashier interactions
- **Stable shells**: persistent navigation rail on tablet, clear content zones
- **Readable bilingual UI** with safe wrapping for dynamic strings

## 2. Color Palette & Roles

### Core Neutrals
- **Ink 950** (`#0F172A`): Primary dark background. Deep slate instead of pure black for softer sustained use.
- **Ink 900** (`#111827`): Elevated dark surfaces, navigation rail, sticky bars.
- **Slate 800** (`#1F2937`): Cards and container surfaces in dark mode.
- **Slate 700** (`#334155`): Borders, dividers, disabled icons in dark mode.
- **Paper 50** (`#F8FAFC`): Primary light background.
- **Paper 100** (`#F1F5F9`): Secondary light section background.
- **Paper 200** (`#E2E8F0`): Light borders and dividers.
- **Text Strong** (`#0F172A`): Primary text on light backgrounds.
- **Text Soft** (`#475569`): Secondary text on light backgrounds.
- **Text Inverse** (`#F8FAFC`): Primary text on dark backgrounds.
- **Text Inverse Soft** (`#CBD5E1`): Secondary text on dark backgrounds.

### Brand & Interactive
- **Primary Accent / POS Blue** (`#2563EB`): Primary CTA, active nav item, focus ring, selected states.
- **Primary Accent Hover** (`#1D4ED8`): Hover and pressed state for primary controls.
- **Accent Soft** (`#DBEAFE`): Selected chips, info backgrounds in light mode.
- **Accent Soft Dark** (`rgba(37, 99, 235, 0.18)`): Selected or highlighted states in dark mode.

### Status Colors
- **Success** (`#16A34A`): Transaction success, stock adjustment success, healthy status.
- **Success Soft** (`#DCFCE7`): Success background on light mode.
- **Warning** (`#D97706`): Low stock, cautionary state, incomplete but recoverable actions.
- **Warning Soft** (`#FEF3C7`): Warning background on light mode.
- **Danger** (`#DC2626`): Delete, stock error, failed checkout, destructive actions.
- **Danger Soft** (`#FEE2E2`): Danger background on light mode.
- **Info** (`#0EA5E9`): Informational banners, transfer/QRIS support content.
- **Info Soft** (`#E0F2FE`): Informational backgrounds.

### Payment Method Colors
- **Cash** (`#15803D`): Cash method emphasis and paid confirmation.
- **Transfer** (`#2563EB`): Transfer bank method chip and metadata.
- **QRIS** (`#7C3AED`): QRIS chip, metadata, and mode indicator.

### Surfaces
- **Surface Light** (`#FFFFFF`): Default card and modal surface in light mode.
- **Surface Light Alt** (`#F8FAFC`): Secondary grouped blocks.
- **Surface Dark** (`#111827`): Primary dark cards and side panels.
- **Surface Dark Alt** (`#1E293B`): Secondary dark cards and grouped panels.
- **Overlay Scrim** (`rgba(15, 23, 42, 0.56)`): Modal and drawer overlay.
- **Focus Ring** (`#2563EB`): Visible focus outline for accessibility.

### Shadow Tokens
- **Shadow Sm** (`0 1px 2px rgba(15, 23, 42, 0.06)`): Inputs, subtle lifted controls.
- **Shadow Md** (`0 8px 24px rgba(15, 23, 42, 0.10)`): Cards, popovers, floating panels.
- **Shadow Lg** (`0 16px 40px rgba(15, 23, 42, 0.14)`): Modals, dialogs, layered surfaces.

## 3. Typography Rules

### Font Family
- **Primary UI Font**: `Inter`, with fallbacks: `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
- **Monospace / Numeric Support**: `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`
- Inter is chosen because it is highly legible, compact enough for productive UIs, widely available, and performs well across bilingual product interfaces.

### Hierarchy

| Role | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|--------|-------------|----------------|-------|
| Display Large | 36px | 700 | 1.10 | -0.02em | Dashboard hero KPI or empty-state headline |
| Display | 30px | 700 | 1.15 | -0.02em | Page-level heading |
| Section Heading | 24px | 700 | 1.20 | -0.01em | Module headers |
| Card Heading | 20px | 700 | 1.25 | -0.01em | Dashboard cards, modal titles |
| Title | 18px | 600 | 1.30 | -0.01em | Product list sections, forms, cart heading |
| Body Large | 16px | 500 | 1.50 | normal | Dense UI copy and labels |
| Body | 14px | 400 | 1.50 | normal | Default body text |
| Body Strong | 14px | 600 | 1.45 | normal | Inline emphasis, labels |
| Label | 13px | 600 | 1.40 | 0em | Form labels, chips, tab labels |
| Caption | 12px | 500 | 1.40 | 0.01em | Metadata, helper text, table labels |
| Micro | 11px | 500 | 1.35 | 0.01em | Very small annotations only |
| Numeric XL | 32px | 700 | 1.00 | -0.03em | Totals, payment amount, change |
| Numeric L | 24px | 700 | 1.05 | -0.02em | Revenue cards, subtotal, key prices |
| Numeric M | 18px | 700 | 1.10 | -0.01em | Product prices, stock quantities |

### Principles
- **Numbers first**: totals, prices, change, and revenue should visually outrank descriptive copy.
- **Readable density**: text can be compact, but must never feel cramped on tablet.
- **Limited stylistic range**: most text lives between 12px and 18px; hierarchy comes from weight and spacing more than dramatic size jumps.
- **Consistent line lengths**: avoid overly wide text blocks; long copy belongs in reporting and settings only.
- **Safe dynamic wrapping**: transaction IDs, product names, bilingual labels, and notes must wrap gracefully without overflow.
- **Use tabular numerals** where possible for transaction totals, timestamps, and financial summaries.

## 4. Component Stylings

### Buttons

**Primary Action**
- Background: `#2563EB`
- Text: `#FFFFFF`
- Padding: 0 20px
- Height: 56px
- Radius: 16px
- Font: 16px, weight 600
- Shadow: `Shadow Sm`
- Hover/Pressed: darken to `#1D4ED8`
- Focus: 2px solid `#2563EB` plus 2px outer ring in translucent blue
- Use: `Selesaikan Transaksi`, `Simpan`, `Tambah Produk`

**Secondary Action**
- Background: transparent or `#F8FAFC` / `#1E293B`
- Text: primary text color
- Border: 1px solid `#E2E8F0` / `#334155`
- Height: 48px to 56px
- Radius: 14px
- Font: 14px or 16px, weight 600
- Use: cancel, reset, filter, export options

**Destructive Action**
- Background: `#DC2626`
- Text: `#FFFFFF`
- Height: 48px to 56px
- Radius: 14px
- Font: 14px or 16px, weight 600
- Use: delete product, remove transaction draft, destructive confirmations

**Segmented Payment Button**
- Height: 52px
- Radius: 14px
- Border: 1px solid neutral border
- Selected state: accent-filled or accent-tinted background with strong label contrast
- Icon + label aligned horizontally
- Use: `Tunai`, `Transfer`, `QRIS`

**Icon Button**
- Size: 48x48px minimum
- Radius: 14px
- Background: neutral surface
- Border: subtle divider
- Focus visible at all times when keyboard-used
- Use: quantity stepper, quick actions, close, theme toggle

### Inputs
- Height: 52px
- Background: `#FFFFFF` / `#111827`
- Border: 1px solid `#CBD5E1` / `#334155`
- Radius: 14px
- Padding: 0 16px
- Font: 16px body for comfortable tablet input
- Placeholder: secondary text tone, never too faint
- Focus: 2px visible ring in `#2563EB`
- Error state: border and helper text in `#DC2626`

### Search Field
- Height: 52px
- Leading icon + text input
- Optional clear action on the right
- Radius: 16px
- Use: product search, transaction search, history search

### Cards & Panels
- Background: `#FFFFFF` / `#111827`
- Border: 1px solid `#E2E8F0` / `#334155`
- Radius: 20px
- Padding: 16px, 20px, or 24px depending on density
- Shadow: `Shadow Sm` or `Shadow Md`
- Use: KPI cards, cart summary, filters, product cards, stock summaries

### Product Grid Card
- Background: surface token
- Radius: 18px
- Padding: 16px
- Border: 1px solid subtle neutral
- Min Height: enough for name, category, price, and stock state without crowding
- States: default, low stock, out of stock, selected
- Selected: accent border + soft accent background
- Disabled/out-of-stock: reduced emphasis but still readable
- Use: cashier product picker

### Table / List Row
- Min height: 52px desktop/tablet dense mode, 60px for touch-comfort mode
- Border bottom: 1px solid divider
- Hover: optional subtle highlight for pointer devices
- Tap state: stronger background tint
- Content zones: primary label, metadata, status chip, trailing action
- Use: stock logs, transactions, products

### Status Chips
- Height: 28px to 32px
- Padding: 0 10px
- Radius: 999px
- Font: 12px or 13px, weight 600
- Variants: success, warning, danger, info, neutral, payment method
- Use: payment method, stock critical, active/inactive, paid state

### Modals & Sheets
- Background: surface token
- Radius: 24px
- Shadow: `Shadow Lg`
- Overlay: `rgba(15, 23, 42, 0.56)`
- Max width: comfortable tablet width; never edge-to-edge unless using mobile drawer
- Primary actions pinned to bottom when content scrolls

### Navigation Rail
- Width: 88px to 96px
- Background: `#0F172A` / `#111827`
- Active item: accent background or accent indicator bar
- Icon + label stack or compact row depending on width
- Safe area for thumb reach
- Use persistent rail on tablet and desktop; drawer only for smaller mobile breakpoints

### Distinctive Components

**Cashier Cart Panel**
- Sticky on the right in landscape tablet
- Contains items, subtotal, discount placeholder, payment method, amount paid, change, and final CTA
- Totals use `Numeric L` and `Numeric XL`
- The CTA remains visually dominant even when the cart grows

**Revenue KPI Card**
- Strong number + compact label + small trend or context line
- Minimal chart use; charts are secondary to the figure

**Stock Alert Panel**
- Warning-accented grouped card
- Clear list of low-stock items with direct action to adjust stock

**Transaction Detail Sheet**
- Slide-over or modal detail for history records
- Shows line items, payment method, notes, created time, and stock implications where relevant

## 5. Layout Principles

### Spacing System
- Base unit: 4px
- Recommended scale: 4, 8, 12, 16, 20, 24, 32, 40, 48
- Dense UI should prefer 12/16/20 spacing
- Primary action regions and section separations should prefer 24/32/40 spacing

### Grid & Container
- Tablet-first shell with persistent navigation rail
- Main content uses a 12-column fluid grid on desktop/tablet layouts
- Cashier screen: primary split layout
  - Left: product browsing and search
  - Right: sticky cart and payment column
- Dashboard: 2 to 3 column KPI layout with one wider chart/list region
- Data pages: filter bar on top, list/table below, detail panel or modal secondary
- Avoid unstable layout jumps; shells must remain consistent between pages

### Whitespace Philosophy
- **Compression where work happens, breathing room where decisions happen**
- Cashier interfaces can be denser, but must preserve large touch targets
- Dashboard and settings can breathe more
- Cards should not float excessively; layout clarity matters more than decorative emptiness
- Use spacing to signal groups: search, filters, list, summary, actions

### Border Radius Scale
- Micro: 10px — chips, tiny pills
- Standard: 14px — buttons, inputs, segmented controls
- Comfortable: 18px — product cards, grouped controls
- Large: 20px — primary content cards
- XL: 24px — modals, featured panels
- Full pill: 999px — chips, tiny filter pills, some segmented indicators

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat (Level 0) | No shadow, border only | Tables, dense list areas, secondary grouped blocks |
| Lifted (Level 1) | `Shadow Sm` | Inputs, small cards, action groups |
| Card (Level 2) | `Shadow Md` | KPI cards, cart panel, filter panels |
| Modal (Level 3) | `Shadow Lg` + scrim | Dialogs, drawers, transaction detail overlays |
| Focus | 2px ring in `#2563EB` | All interactive states requiring accessibility visibility |

**Depth Philosophy**: Use elevation sparingly and systematically. This is not a neumorphic or glassmorphic UI. Most structure should come from layout, borders, and subtle surface shifts. Depth is reserved for things that need immediate attention: the cart panel, active dialogs, filter groups, and focused controls.

### Decorative Depth
- Soft shadows are acceptable, but never stacked into dramatic floating effects
- Dark mode depth should come more from tonal separation than heavy shadow
- Charts and cards may have slight polish, but the cashier flow should stay grounded and direct

## 7. Do's and Don'ts

### Do
- Prioritize **speed of checkout** over visual novelty
- Keep **primary actions large and unmistakable**
- Use **high contrast** for prices, totals, and status-critical text
- Design every major interaction for **touch-first use**
- Keep the **navigation shell stable** across screens
- Use **chips, filters, and tables** for management pages
- Let dashboard screens feel slightly more polished, but still operational
- Support **dark mode and bilingual copy** from the start
- Ensure long product names and transaction IDs wrap safely
- Use clear status coding for low stock, out of stock, success, and failure

### Don't
- Don’t copy a Dribbble concept literally into a production cashier flow
- Don’t overuse gradients, glows, glass effects, or decorative backgrounds
- Don’t hide essential actions behind secondary menus
- Don’t let charts dominate the dashboard at the expense of key numbers
- Don’t use low-contrast gray text for transactional data
- Don’t make form controls or payment selectors too small for tablet use
- Don’t rely only on color to communicate critical status
- Don’t create inconsistent page shells between Dashboard, Kasir, History, and Stock
- Don’t make dark mode “moody” at the expense of readability

## 8. Responsive Behavior

### Breakpoints
| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile Small | <360px | Minimum supported; drawer nav, stacked layouts |
| Mobile | 360-639px | Single column, bottom-stacked cashier/cart |
| Tablet Small | 640-767px | Drawer nav, compact two-zone cashier if possible |
| Tablet | 768-1023px | Primary target; persistent rail, split cashier layout |
| Desktop | 1024-1439px | Expanded rail, wider product grid, denser data screens |
| Large Desktop | >=1440px | More whitespace, stronger max-width control |

### Touch Targets
- Minimum interactive size: **48x48px**
- Primary CTA height: **56px**
- Inputs: **52px**
- Payment segmented controls: **52px**
- Table row actions: minimum **44x44px**, preferably **48x48px**
- Quantity steppers: minimum **48x48px**

### Collapsing Strategy
- Navigation rail collapses to drawer only below tablet widths
- Cashier layout:
  - Desktop/tablet landscape: split pane with sticky cart
  - Tablet portrait: product area above, cart/payment below or slide-over summary
  - Mobile: stacked flow with persistent summary footer
- Product grid:
  - 4 columns on wide landscape tablet/desktop
  - 3 columns on standard tablet landscape
  - 2 columns on portrait tablet
  - 1-2 columns on mobile depending on width
- Dense data tables may convert into card lists on narrow layouts
- Modal widths reduce progressively; full-height sheet on mobile where needed

### Content Behavior
- Long text wraps; avoid horizontal scrolling whenever possible
- Numeric totals should remain on a single line if feasible
- Filter bars may wrap into multiple rows instead of truncating essential controls
- Export/report controls stay grouped and visible, not buried

## 9. Agent Prompt Guide

### Quick Color Reference
- Primary accent: `#2563EB`
- Dark background: `#0F172A`
- Dark elevated surface: `#111827`
- Light background: `#F8FAFC`
- Light card surface: `#FFFFFF`
- Primary text light mode: `#0F172A`
- Primary text dark mode: `#F8FAFC`
- Secondary text light mode: `#475569`
- Secondary text dark mode: `#CBD5E1`
- Border light mode: `#E2E8F0`
- Border dark mode: `#334155`
- Success: `#16A34A`
- Warning: `#D97706`
- Danger: `#DC2626`
- QRIS accent: `#7C3AED`

### Example Component Prompts
- "Create a tablet-first POS cashier screen with a persistent left navigation rail, a product grid on the left, and a sticky cart summary panel on the right. Use a dark surface background (`#0F172A` and `#111827`), 18px product card titles, 16px body labels, and a 56px primary CTA in blue (`#2563EB`) labeled 'Selesaikan Transaksi'."
- "Design a product grid card for a cashier POS app. Use a 18px radius card, subtle border, strong price hierarchy, category label, and stock status chip. Support states for default, selected, low stock, and out of stock. Keep the design touch-first and readable on tablet."
- "Build a stock management screen with an Airtable-inspired structure: filter/search bar on top, data list below, and a detail sheet for stock adjustment. Use high-contrast typography, 52px search input, and warning chips for low stock."
- "Create a dashboard for a solo-operator F&B POS app. Use 3 KPI cards for revenue, best-selling product, and critical stock. Make numbers dominant, charts secondary, and keep the layout modern but operational."
- "Design a transaction history detail modal with 24px radius, dark elevated surface, grouped line items, payment method chip, notes area, and a footer section showing total amount, amount paid, and change in bold tabular numerals."

### Iteration Guide
1. Every cashier-critical screen must answer three questions immediately: **what is being sold, how much is owed, and how to finish the transaction**
2. Use Linear-like precision for layout, Airtable-like structure for data pages, and only a restrained amount of hospitality polish
3. Keep dashboard visuals softer and slightly more expressive than cashier screens
4. Use blue as the primary interaction color; reserve status colors for feedback and state
5. Touch targets are non-negotiable: 48px minimum, 56px for primary buttons
6. Typography must prioritize totals, prices, and key status values
7. Dark mode should feel clear and premium, not decorative or neon
8. Bilingual labels and long dynamic strings must be tested for wrapping and overflow
9. On tablet, preserve the persistent navigation rail and stable page shell whenever possible
10. If forced to choose between visual flair and cashier speed, choose cashier speed every time
