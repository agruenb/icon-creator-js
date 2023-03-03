
export default class TouchInputAdapter{

    /**
     * Creates a custom MouseEvent from a touch event, adding
     * clientX and clientY attributes from first touch.
     * !WARNING! This does not incapsulate the full touch event
     * @param event The touch event to convert
     */
    static convertTouchInputIntoSimpleMouseEvent(event:TouchEvent){
        let mouseEvent = {
            clientX:event.changedTouches[0].clientX,
            clientY:event.changedTouches[0].clientY,
            target: event.target,
            shiftKey: event.shiftKey,
            defaultPrevented: event.defaultPrevented,
            ctrlKey: event.ctrlKey,
            altKey: event.altKey,
            which: 1
        };
        return mouseEvent;
    }
}