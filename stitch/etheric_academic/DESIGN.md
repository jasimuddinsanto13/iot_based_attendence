# Design System Specification: High-End Editorial for IoT Attendance

## 1. Overview & Creative North Star
**Creative North Star: "The Academic Ether"**
This design system moves away from the "industrial utility" typical of IoT applications and instead embraces an editorial, high-end academic aesthetic. It treats data not as a spreadsheet, but as a curated gallery. By leveraging intentional asymmetry, expansive negative space, and a sophisticated tonal palette, we create an environment that feels light, breathable, and authoritative. The UI should feel like a premium digital publication—calm, precise, and effortlessly organized.

## 2. Colors & Surface Philosophy
The palette is rooted in a spectrum of sophisticated grays and whites, punctuated by "Atmospheric Teal" and "Slate Blue" to draw the eye to critical IoT interactions.

### The "No-Line" Rule
To achieve a premium, custom feel, **1px solid borders are strictly prohibited for sectioning.** Structural boundaries must be defined solely through background color shifts. For example, the left-side navigation resides on `surface_container_low`, while the main content area sits on the `background`. This creates a natural, seamless transition that feels more architectural than "boxed in."

### Surface Hierarchy & Nesting
We define depth through a "stacking" methodology. Think of the UI as layers of fine vellum:
*   **Base Layer:** `surface` (#f8fafb) - The foundation of the workspace.
*   **Navigation/Sidebars:** `surface_container_low` (#f0f4f6) - Subtly recessed to provide a structural anchor.
*   **Primary Content Containers:** `surface_container_lowest` (#ffffff) - Elevated cards that "pop" against the slightly darker background.
*   **Active Elements:** Use `surface_container_high` (#e1eaed) for hover states or temporarily active regions.

### The "Glass & Gradient" Rule
To break the flat "out-of-the-box" look, floating elements (like modals or dropdowns) should utilize a **Glassmorphism** effect. Use a semi-transparent `surface_container_lowest` with a 20px-40px backdrop-blur. 
For primary Action Buttons, apply a subtle linear gradient from `primary` (#4e6073) to `primary_dim` (#425467) at a 135-degree angle. This adds "soul" and a tactile quality that flat colors cannot replicate.

## 3. Typography
The typography strategy pairs **Manrope** for high-impact display moments with **Inter** for utilitarian precision.

*   **Display & Headlines (Manrope):** These are the "Editorial" voice. Use `display-lg` and `headline-md` with slightly tighter letter-spacing (-0.02em) to create an authoritative, modern feel.
*   **Body & Labels (Inter):** Chosen for its exceptional legibility at small sizes. IoT data points and timestamps should use `label-md` in `on_surface_variant` (#566164) to maintain a clean, non-competing hierarchy.
*   **The Contrast Play:** Pair a large `headline-lg` title with a small, uppercase `label-sm` for category tags to create a "High-End Magazine" layout feel.

## 4. Elevation & Depth
We eschew traditional "drop shadows" in favor of **Tonal Layering** and **Ambient Light.**

*   **The Layering Principle:** Depth is achieved by placing a `surface_container_lowest` (Pure White) card on a `surface` (Off-white) background. The 2% shift in value is enough for the human eye to perceive elevation without visual clutter.
*   **Ambient Shadows:** Where a floating effect is required (e.g., a "Check-in" success modal), use a highly diffused shadow: `box-shadow: 0 20px 40px rgba(42, 52, 55, 0.06);`. The shadow color is derived from `on_surface` to ensure it looks like a natural occlusion of light.
*   **The Ghost Border Fallback:** If a container requires further definition (e.g., in high-density data views), use a "Ghost Border": `outline-variant` (#a9b4b7) at **15% opacity**. It should be felt, not seen.

## 5. Components

### Navigation (Left-Side)
*   **Layout:** Fixed width, anchored left. No border on the right; use the color shift to `surface_container_low`.
*   **Active State:** Use a vertical "pill" indicator in `secondary` (#006a71) or a subtle background shift to `surface_container_highest`.

### Cards & Data Lists
*   **Constraint:** **Never use horizontal dividers.** 
*   **Execution:** Separate list items using the spacing scale (e.g., `1.5rem` vertical gaps). In data tables, use alternating background tints of `surface_container_low` and `surface` to guide the eye.
*   **Corners:** Use the `lg` (1rem) roundedness for main cards and `md` (0.75rem) for nested elements.

### IoT Status Chips
*   **"Connected" (Secondary):** Use `secondary_container` with `on_secondary_container` text. Apply a subtle pulse animation to the container to signify live IoT polling.
*   **"Error/Missing" (Error):** Use `error_container` with `on_error_container` text.

### Input Fields
*   **Style:** Minimalist. No bottom line or heavy border. Use `surface_container_highest` as a solid background fill with `sm` rounded corners.
*   **Focus State:** A 2px "Ghost Border" of `primary` at 30% opacity.

### Buttons
*   **Primary:** Gradient fill (Primary to Primary-Dim), `full` (pill) roundedness, `body-md` bold text.
*   **Tertiary (Ghost):** No background or border. Use `on_surface` text with a subtle background shift to `surface_variant` on hover.

## 6. Do's and Don'ts

### Do:
*   **Embrace White Space:** If a section feels crowded, double the padding. This system relies on "breathing room" to feel premium.
*   **Use Asymmetry:** Place page titles in the top-left and primary actions in the bottom-right of a header area to create a dynamic, custom flow.
*   **Tint Your Neutrals:** Always use `on_surface_variant` for secondary text; never use pure #000000.

### Don't:
*   **Don't use 1px Dividers:** Reach for background color shifts or increased padding first.
*   **Don't use Standard Shadows:** Avoid the default "fuzzy black" shadow. It kills the "Ether" aesthetic.
*   **Don't Over-Color:** Keep the UI 90% neutral. Save the `secondary` (teal) and `primary` (blue) for intentional "Look Here" moments (CTA, IoT Status, Active Nav).