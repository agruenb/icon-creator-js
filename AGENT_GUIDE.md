# Agent Guide for icon-creator-js

This codebase is transitioning from a legacy JS architecture to a modern TypeScript-based system. Follow these guidelines to ensure efficient and safe changes.

## 1. Architecture Overview

### Core Components
- **`src/HTMLeditor.js`**: The central controller. ONE DAY this will be decomposed. For now, it holds the `EditorState`.
- **`src/model/EditorState.ts`**: The source of truth for editor state. ALWAYS use `this.state` in `HTMLeditor` to access it. **Do not add loose properties to `HTMLeditor` if they belong in state.**
- **`src/patterns/`**: Contains logic for different SVG patterns.

### Development Pattern
- **Gradual Typing**: New files MUST be `.ts`. Existing files can remain `.js` but try to add JSDoc or convert if easy.
- **Strictness**: `tsconfig.json` is currently loose (`noImplicitAny: false`). **Do not abuse this.** Aim for type safety where possible.

## 2. Testing Strategy

- **Framework**: Jest with `ts-jest`.
- **Location**: `tests/`.
- **Requirement**: ALL new logic MUST have a corresponding test.
- **Running Tests**: `npm run test:once` (runs all tests once) or `npm test` (watch mode).

## 3. Common Tasks

### Adding a new State Property
1.  Modify `src/model/EditorState.ts`.
2.  Add the property to the `EditorState` class and interface.
3.  Update `tests/EditorState.test.ts` if it has complex logic.

### Modifying `HTMLeditor.js`
- Avoid adding more logic to this file if possible.
- If you must, try to extract it to a helper class in `src/shared/` or `src/components/`.

## 4. Troubleshooting
- **Build Failures**: Run `npm run build` to check for TS errors that `webpack` catches.
- **Lint Errors**: Run `npm run lint`.
