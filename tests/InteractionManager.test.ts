import { InteractionManager } from '../src/control/InteractionManager';
import { EditorState } from '../src/model/EditorState';

describe('InteractionManager', () => {
    let editorMock: any;
    let state: EditorState;
    let manager: InteractionManager;
    let frameMock: any;
    let projectMock: any;

    beforeEach(() => {
        state = new EditorState();
        frameMock = {
            boundId: 'differentId', // Default to not being the bound ID
            setOpacity: jest.fn(),
            updateInfoBox: jest.fn(),
            repaint: jest.fn(),
            processAndAppend: jest.fn(),
            newBox: jest.fn(),
        };
        projectMock = {
            frame: jest.fn(() => frameMock),
            getColor: jest.fn(() => 'black'),
            repaint: jest.fn(),
            alterPattern: jest.fn(),
        };

        editorMock = {
            state: state,
            closeContextMenu: jest.fn(),
            clearViewportUI: jest.fn(),
            clickedElement: jest.fn(),
            currProj: jest.fn(() => projectMock),
            patternById: jest.fn(),
            startEdit: jest.fn(),
            stopEdit: jest.fn(),
            focusedPattern: jest.fn(),
            focus: jest.fn(),
            relX: jest.fn((val) => val),
            relY: jest.fn((val) => val),
            detectMouseOnMarkerDistance: 10,
            closestMarkerToMouse: jest.fn(),
            markerScaleOnMouseHover: 1.5,
            addEditUI: jest.fn(),
            saveToHistory: jest.fn(),
            repaint: jest.fn(),
            addHelperOutline: jest.fn(),
            editOpacity: 0.5,
        };
        manager = new InteractionManager(editorMock);
    });

    test('handleMouseDown should clear viewport UI if not editing', () => {
        const event = { which: 1, clientX: 100, clientY: 100 } as MouseEvent;
        state.setAction('none');
        // Mock clickedElement to return null so we don't proceed into switch
        editorMock.clickedElement.mockReturnValue(null);

        manager.handleMouseDown(event);

        expect(editorMock.closeContextMenu).toHaveBeenCalled();
        expect(editorMock.clearViewportUI).toHaveBeenCalled();
        expect(state.mouseDownInfo).toEqual({ x: 100, y: 100 });
    });

    test('handleMouseDown should start edit on pattern click', () => {
        const event = { which: 1, clientX: 100, clientY: 100 } as MouseEvent;
        state.setAction('none');

        const mockElement = { parentElement: { getAttribute: () => 'main', id: 'pattern1' } };
        editorMock.clickedElement.mockReturnValue(mockElement);
        editorMock.patternById.mockReturnValue({ id: 'pattern1', xOrigin: 0, yOrigin: 0 });
        editorMock.focusedPattern.mockReturnValue({ id: 'pattern1', xOrigin: 0, yOrigin: 0 });

        manager.handleMouseDown(event);

        expect(editorMock.startEdit).toHaveBeenCalled();
        expect(state.currentAction).toBe('dragPattern');
        expect(state.draggingInfo).toBeDefined();
    });

    test('handleMouseMove should adjust pattern when dragging', () => {
        const event = { clientX: 150, clientY: 150 } as MouseEvent;
        state.setAction('dragPattern');
        // Setup dragging info
        state.draggingInfo = { x: 100, y: 100, relToPatternOriginX: 10, relToPatternOriginY: 10 };

        const mockPattern = { xOrigin: 100, yOrigin: 100, translateTo: jest.fn() };
        editorMock.focusedPattern.mockReturnValue(mockPattern);

        manager.handleMouseMove(event);

        expect(frameMock.setOpacity).toHaveBeenCalled();
        // Since we are moving, verify adjustments
        expect(projectMock.repaint).toHaveBeenCalledWith(mockPattern);
    });

    test('handleMouseUp should stop edit if not on main pattern', () => {
        const event = { which: 1, clientX: 100, clientY: 100 } as MouseEvent;
        state.setAction('edit');

        const mockElement = { parentElement: { getAttribute: () => 'other' } };
        editorMock.clickedElement.mockReturnValue(mockElement);

        manager.handleMouseUp(event);

        expect(editorMock.stopEdit).toHaveBeenCalled();
    });
});
