**Role:** Senior Frontend Architect & UX Designer.
**Project Goal:** Build a pixel-perfect functional clone of the "Canva" presentation editor shown in the attached screenshots.
**Current Tech Stack:** React, Vite, TailwindCSS (shadcn/ui), React Konva, Zustand.

**Context:**
The user is not satisfied with the current prototype. It lacks the polish, depth, and specific features visible in the attached Canva screenshots. We need to bridge the gap between a "basic canvas editor" and a "professional design tool".

**Task 1: Gap Analysis (Visual Decomposition)**
Look closely at the provided screenshots. Acknowledge and plan for the following UI regions:

1.  **The "Filmstrip" (Bottom Bar):**
    * **Visual:** A horizontal scrollable list of slide thumbnails at the very bottom.
    * **Features:** Add page button, duplicate page, drag-and-drop to reorder slides, grid view toggle, zoom slider, full-screen presentation mode.
    * **Interaction:** Clicking a thumbnail makes it the active stage.

2.  **The "Contextual Toolbar" (Top - Below Header):**
    * **Crucial Logic:** This bar is *dynamic*. It changes completely based on what is selected.
    * **Text Selected (See Screenshot):** Font Family, Font Size (Input + Stepper), Text Color, Bold/Italic/Underline, Alignment, List (Bullet/Number), Spacing (Letter/Line), Effects (Shadow/Lift), Animation, Position, Transparency.
    * **Image Selected:** Edit Image, Flip, Border, Animation.
    * **No Selection:** Background Color, Animate Slide, Duration.

3.  **The "Object Panel" (Left Sidebar):**
    * **Visual:** A slim dark navigation rail (Design, Elements, Text, Brand, Uploads, Draw) + A wider drawer showing content.
    * **Features:** Drag and drop items from this sidebar *directly* onto the canvas.

4.  **The Canvas (Stage):**
    * **Interactions:** Snap-to-grid guidelines (magnetic snapping), multi-selection (shift+click or drag area), grouping (Ctrl+G), locking elements.
    * **Floating Menu:** When an object is selected, a small floating menu appears above it (Duplicate, Delete, More options).

**Task 2: Implementation Master Plan**
Based on the analysis, generate a step-by-step coding plan to implement these features. Do not write all code at once. Break it down into these phases:

* **Phase A: The Layout Restructuring (Skeleton).**
    * Implement the exact CSS Grid/Flex layout: Left Sidebar (fixed), Top Header (fixed), Contextual Toolbar (sticky), Bottom Filmstrip (fixed), and the Canvas (scrollable/zoomable center).
* **Phase B: The Advanced Text Engine.**
    * Implement "Rich Text" features in Konva (using `Html` overlay or complex `Text` config) to support: Letter Spacing, Line Height, Lists, and Text Effects (Outline/Shadow).
* **Phase C: The "Filmstrip" State Management.**
    * Refactor the Store to handle `slides[]`. Implement the thumbnail generation (using `stage.toDataURL`) and the reordering logic.
* **Phase D: Drag-and-Drop Ecosystem.**
    * Implement the logic to drag an image/shape from the HTML Sidebar and drop it onto the Konva Canvas (requires coordinate translation).

**Action:**
Start by executing **Phase A (Layout Restructuring)**.
1.  Wipe the current main layout.
2.  Create the `EditorLayout` component that matches the screenshots exactly (Sidebar Left, Filmstrip Bottom, Toolbar Top).
3.  Use `shadcn/ui` for the buttons and sliders to match the aesthetic.
4.  Ensure the "Center Canvas" zooms and pans correctly within the remaining space.

Let's begin.