import { EditorState } from '../src/model/EditorState';

describe('EditorState', () => {
    it('should initialize with default values', () => {
        const state = new EditorState();
        expect(state.currentAction).toBe('none');
        expect(state.view).toBe('arange');
        expect(state.gridsize).toBe(1);
    });

    it('should update currentAction', () => {
        const state = new EditorState();
        state.setAction('edit');
        expect(state.currentAction).toBe('edit');
    });

    it('should reset state', () => {
        const state = new EditorState();
        state.setAction('dragOut');
        state.reset();
        expect(state.currentAction).toBe('none');
        expect(state.mouseDownInfo).toBeUndefined();
    });
});
