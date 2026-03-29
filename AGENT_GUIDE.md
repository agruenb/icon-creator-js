# Agent Guide for icon-creator-js

This codebase is a TypeScript-based SVG icon editor. Follow these guidelines to ensure efficient and safe changes.

## 1. Architecture Overview

### Core Components
- **`src/HTMLeditor.ts`**: Central controller / coordinator. Delegates to specialized managers. **Do not add domain logic here** — use the appropriate manager instead.
- **`src/model/EditorState.ts`**: Source of truth for editor state. Use `this.state` in `HTMLeditor` to access it. **Do not add loose properties to `HTMLeditor` if they belong in state.**
- **`src/control/InteractionManager.ts`**: Handles all mouse/touch interactions (mousedown, mousemove, mouseup, doubleclick).
- **`src/control/HistoryManager.ts`**: Manages undo/redo history (save, reverse, re-init).
- **`src/control/PatternManager.ts`**: Pattern-level operations (create, duplicate, remove, mirror).
- **`src/view/UIManager.ts`**: Manages viewport UI elements (markers, outlines, context menus, tool banners). **All DOM/UI calls for viewport elements belong here.**
- **`src/patterns/`**: Contains logic for different SVG patterns (Circle, Rect, Ellipse, Line, Path, etc.). Each pattern extends `Pattern.ts`.
- **`src/Project.ts`**: Manages the project and its keyframes.
- **`src/Frame.ts`**: A single frame/layer containing patterns.

### Structural Rules
| Concern                          | Belongs In                         |
|----------------------------------|------------------------------------|
| Mouse/touch event handling       | `InteractionManager.ts`            |
| Undo/redo, history buttons       | `HistoryManager.ts`                |
| Pattern CRUD, mirror, duplicate  | `PatternManager.ts`                |
| Viewport helpers (markers, outlines) | `UIManager.ts`                 |
| Editor state (action, gridsize)  | `EditorState.ts`                   |
| Pattern-specific behavior        | `src/patterns/<PatternName>.ts`    |
| New UI components                | `src/uiElements/` or `src/components/` |
| Shared utilities                 | `src/shared/`                      |

### Development Rules
- **All files must be `.ts`**. No new `.js` files.
- **`tsconfig.json`** has `noImplicitAny: true` and `strictNullChecks: true`. All code must pass `npx tsc --noEmit`.
- Use explicit type annotations on all function parameters and return types.
- Add JSDoc comments to public methods with `@param` and `@returns` tags.

## 2. Testing Strategy

- **Framework**: Jest with `ts-jest`.
- **Location**: `tests/`.
- **Requirement**: ALL new logic MUST have a corresponding test.
- **Running Tests**: `npm run test:once` (runs all tests once) or `npm test` (watch mode).

## 3. Common Tasks

### Adding a new State Property
1. Modify `src/model/EditorState.ts`.
2. Add the property to the `EditorState` class and interface.
3. Update `tests/EditorState.test.ts` if it has complex logic.

### Modifying the Editor
- **Do not add more logic to `HTMLeditor.ts`** if it can live in a manager.
- Identify which manager owns the concern using the table above.
- If it doesn't fit any existing manager, create a new one in `src/control/` or `src/view/`.

### Adding a new Pattern
1. Create `src/patterns/<Name>.ts` extending `Pattern`.
2. Register it in `src/shared/PatternClassLoader.ts`.
3. Add it to the `config.patterns` array in `src/index.js`.

## 4. Troubleshooting
- **Type Errors**: Run `npx tsc --noEmit` to check.
- **Build Failures**: Run `npm run build` to check for TS errors that `webpack` catches.
- **Lint Errors**: Run `npm run lint`.

## 5. Editor Interaction & Screen Layout

### Screen Layout
- The **toolbar** is a vertical panel fixed on the left side (`position: fixed; top: 100px; left: 10px`). It contains `.anno-button` elements stacked in a column with `flex-direction: column`.
- The **topbar** is at the top (`position: fixed; top: 0`) with save/icons buttons on the left, export/clear/history on the right.
- The **canvas/viewport** fills the screen center (`100vw × 100vh`, centered with flexbox).
- The **sidebar** (`#sidebar`) is fixed on the right for pattern info boxes.
- The **bottom-bar** is centered at the bottom for grid-size and view toggles.
- The **overlay** (`#overlayLayer`) covers everything at `z-index: 10003` for modals.

### Tool Selection Events
- Tool buttons use **`mousedown`** (not `click`) for selection. This is by design so drag-to-draw works immediately.
- The event flow when clicking a tool button: `mousedown` → `setDrawingType("dragOut", className, buttonElement)` → `mouseup` → `setDrawingType("clickedPaintPattern", className, buttonElement)`.
- The cursor/selection button (`#cursor`) uses a regular `click` event instead.
- `setDrawingType()` is the central method that updates `EditorState.currentAction`, changes the cursor, and shows the tool tutorial.

