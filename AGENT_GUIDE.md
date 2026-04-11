# Agent Guide for icon-creator-js

This codebase is a TypeScript-based SVG icon editor. Follow these guidelines to ensure efficient and safe changes.

### Tool Selection Events
- Tool buttons use **`mousedown`** (not `click`) for selection. This is by design so drag-to-draw works immediately.
- The event flow when clicking a tool button: `mousedown` → `setDrawingType("dragOut", className, buttonElement)` → `mouseup` → `setDrawingType("clickedPaintPattern", className, buttonElement)`.
- The cursor/selection button (`#cursor`) uses a regular `click` event instead.
- `setDrawingType()` is the central method that updates `EditorState.currentAction`, changes the cursor, and shows the tool tutorial.

