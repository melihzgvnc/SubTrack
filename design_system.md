# Design System: The Index

## 0. Critique of Previous Version
> "The previous iteration was 'Cozy Brutalism'—a safe, trendy aesthetic that screams 'I have a Pinterest board for my UI'. Fraunces is the typeface equivalent of a waxed mustache. The 'Thrift Store' palette felt like a coffee shop menu. True high-end design doesn't try to be 'warm'; it tries to be **true**. We are pivoting to **Radical Objectivity**. No nostalgia. No warmth. Just data."

## 1. Philosophy: "Radical Objectivity"
We are not building an "experience"; we are building a **tool**.
The aesthetic is **"The Bloomberg Terminal printed on a Dot Matrix Printer."**
It is raw, unopinionated, and hyper-functional. It finds beauty in the default, the standard, and the nakedly structural. It rejects "styling" in favor of "structuring".

## 2. Color: "The Printer"
We reject "curated palettes". We use **standard values**.

- **Paper:** `#FFFFFF` (Pure White). No "cream", no "linen".
- **Ink:** `#000000` (Pure Black). No "charcoal", no "soft grey".
- **Focus:** `#0000FF` (Standard Hyperlink Blue). Used for active states and primary actions.
- **Alert:** `#FF0000` (Standard Red). Used for debts and deletions.
- **Highlight:** `#FFFF00` (Standard Yellow). Used for selection.

*Rule: Everything is high contrast. 100% Opacity. No gradients.*

## 3. Typography: "System Default"
We stop downloading fonts. We use what the machine gives us. This signals: "This app is native to your reality."

### The Serif (Authority)
**Font:** `Times New Roman` (Windows) / `Times` (Mac).
- **Usage:** Page Titles, Large Display Numbers (Total Spend).
- **Why:** It feels authoritative, academic, and timelessly bureaucratic. It commands respect.

### The Sans (Utility)
**Font:** `Arial` (Windows) / `Helvetica` (Mac).
- **Usage:** Navigation, Button Labels, Form Labels.
- **Why:** It is invisible. It is pure signal. It is the "water" of typography.

### The Mono (Data)
**Font:** `Courier New` (Windows) / `Courier` (Mac).
- **Usage:** Dates, Currency, List Items, IDs.
- **Why:** It aligns perfectly. It treats money as data, not art.

## 4. Layout: "The Spreadsheet"
- **Borders:** Everything has a border. `1px solid #000000`.
- **Spacing:** Tight. `8px` increments.
- **Grid:** Visible. The app should look like a spreadsheet designed by a Swiss architect.
- **No Whitespace:** Fill the screen. Empty space is wasted space. Use lines to divide, not space.

## 5. Component Styling

### The Cell (Card Replacement)
- **Concept:** Content lives in "Cells", not "Cards".
- **Border:** 1px Solid Black.
- **Background:** White.
- **Shadow:** None.
- **Hover:** Inverts (Black background, White text).

### The Button
- **Style:** Text inside a box.
- **Text:** Uppercase, Arial Bold, 12px.
- **Border:** 1px Solid Black.
- **Background:** White.
- **Active/Hover:** Background becomes **Blue (`#0000FF`)**, Text becomes **White**.

### The Input
- **Style:** A box.
- **Border:** 1px Solid Black.
- **Background:** White.
- **Focus:** Background becomes **Yellow (`#FFFF00`)**. Text remains Black.
- **Placeholder:** Uppercase, Courier New.

## 6. Iconography
- **Library:** `Lucide React Native`.
- **Style:** Absolute thinnest stroke possible (1px) or filled block.
- **Color:** Black or Blue.
- **Usage:** Minimal. Use text labels over icons whenever possible. (e.g., "[DELETE]" instead of a trash can).

## 7. Motion
- **Timing:** 0ms.
- **Effect:** None. Things appear and disappear instantly.
- **Exception:** A simple blink cursor or a marquee effect for overflowing text.
