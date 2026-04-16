# Design System Documentation: The Executive Editorial

This design system is engineered to transform a standard business diagnostic tool into a high-end consultative experience. By moving away from "template-grade" UI and embracing editorial layouts, we establish a visual language of authority, precision, and institutional trust.

## 1. Overview & Creative North Star
**Creative North Star: The Sovereign Consultant.**
The objective of this design system is to mimic the feel of a premium, bespoke white paper or a private wealth management dashboard. We achieve this through "The Sovereign Consultant" ethos—a design language that prioritizes focus, breathes through generous whitespace, and replaces rigid structural lines with sophisticated tonal transitions. 

By utilizing **intentional asymmetry** (e.g., offsetting a headline to the left while keeping the quiz content centered) and **high-contrast typography scales**, we break the monotony of standard web forms. The layout is not a grid to be filled, but a canvas to be curated.

---

## 2. Colors & Surface Logic
The palette is rooted in institutional blues and emerald greens, but its premium feel is derived from how these colors are layered rather than their hex codes alone.

### The Color Tokens
*   **Primary:** `primary` (#00236f) for high-level branding and `primary_container` (#1e3a8a) for core interaction states.
*   **Positive Action:** `tertiary` (#00311f) and `tertiary_fixed_dim` (#4edea3) for success states and growth indicators.
*   **Neutral/Text:** `on_surface` (#0d1c2f) for primary text; `on_secondary_container` (#54647a) for supportive metadata.

### Surface Hierarchy & The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to define sections. In this design system, boundaries are created through color-shift and depth.
*   **The Layering Principle:** Use the `surface` tokens to define hierarchy. A page begins on `surface` (#f8f9ff). A focused diagnostic area should sit on a `surface_container_low` (#eff4ff) section. Individual interactive cards should then be elevated using `surface_container_lowest` (#ffffff). This "nested" approach creates a natural, soft depth.
*   **Signature Textures:** For primary call-to-actions or hero diagnostic headers, use a subtle linear gradient transitioning from `primary` to `primary_container`. This adds a "soul" to the color that flat fills lack.
*   **Glassmorphism:** For floating navigation or "In-Progress" modals, use `surface` at 80% opacity with a `backdrop-blur` of 12px. This ensures the tool feels modern and integrated.

---

## 3. Typography
We utilize a pairing of **Manrope** for architectural impact and **Inter** for functional clarity.

*   **Display & Headlines (Manrope):** Use `display-lg` and `headline-lg` to create editorial moments. These should feel authoritative. Use tighter letter-spacing (-2%) for headlines to give them a "set" look.
*   **Body & Utility (Inter):** Use `body-lg` for quiz questions to ensure maximum readability. Use `label-md` for technical metadata.
*   **The Hierarchy Goal:** The jump between a `headline-lg` and a `body-md` should feel intentional and dramatic, guiding the user’s eye to the most important "Sovereign" insight first.

---

## 4. Elevation & Depth
In this design system, elevation is a feeling, not a drop-shadow.

*   **Tonal Layering:** Avoid shadows for static elements. Instead, place a `surface_container_lowest` card on top of a `surface_container` background.
*   **Ambient Shadows:** For "floating" elements like a primary diagnostic button or an active tool-tip, use an extra-diffused shadow. 
    *   *Specs:* `0px 20px 40px rgba(13, 28, 47, 0.06)`. The shadow color must be a low-opacity version of `on_surface`, never pure black.
*   **The Ghost Border:** If a boundary is required for accessibility, use the `outline_variant` token at 15% opacity. This creates a "Ghost Border" that defines space without cluttering the visual field.

---

## 5. Components

### Buttons
*   **Primary:** Rounded at `xl` (1.5rem). Use the `primary` to `primary_container` gradient. Text is `on_primary`.
*   **Secondary:** No background. Use a `surface_tint` Ghost Border and `on_surface` text.
*   **Tertiary (Success):** Use `tertiary_container` with `on_tertiary_fixed`. Reserved strictly for "Complete" or "Submit."

### Input Fields & Interactive Forms
*   **The Container:** Use `surface_container_low` for the input background. 
*   **States:** On focus, transition the background to `surface_container_lowest` and add a 2px `surface_tint` Ghost Border. 
*   **Forbid Dividers:** Never use lines to separate form fields. Use `1.5rem` of vertical whitespace (the `xl` scale) to separate questions.

### Progress Indicators
*   **Visual Style:** A thin, high-contrast bar using `tertiary_fixed_dim` against a `surface_variant` track. 
*   **Placement:** Fixed to the top of the centered quiz container to maintain the "Focused" layout directive.

### Diagnostic Cards
*   **Layout:** No borders. Use `surface_container_highest` for the active card and `surface_container_low` for inactive or "upcoming" cards.
*   **Rounding:** Always `lg` (1rem) for content cards to maintain the professional, soft-touch corporate feel.

---

## 6. Do’s and Don'ts

### Do:
*   **Do** use asymmetrical margins for "Note" or "Context" text (e.g., a small `label-sm` text block floating in the left gutter while the quiz is centered).
*   **Do** use `tertiary` colors sparingly to highlight "Growth Opportunities" in the diagnostic results.
*   **Do** ensure all interactive elements have a minimum `md` (0.75rem) corner radius.

### Don't:
*   **Don't** use 1px solid borders to separate list items or cards. Use whitespace or background shifts.
*   **Don't** use pure black (#000000) for text. Always use `on_surface`.
*   **Don't** use "Standard" drop shadows. If it looks like a default plugin setting, it is too heavy. 
*   **Don't** crowd the centered quiz layout. If a question is long, give it its own page to maintain the "Focus" layout principle.