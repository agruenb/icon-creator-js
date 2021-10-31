class Marker extends HelperPattern{
    constructor(viewportElement, x,y,memorize,icon="empty",rotation = 0){
        super(viewportElement);
        this.x = x;
        this.y = y;
        this.rotation = rotation;
        this.memorize = memorize;
        let elementString = "";
        switch (icon) {
            case "empty":
                elementString = '<svg style="position:absolute;top:0;left:0;" height="12" width="12" viewBox="0 0 512 512">'+ new Circle(256,256,240,"#307ffd",32,"#307ffd").cleanHTML()+'</svg>';
                break;
            case "check":
                elementString = '<svg viewBox="0 0 512 512"><circle  cx="256" cy="256" r="240" fill="#ffffff" stroke="#000001" stroke-width="20" /><line x1="112" y1="256" x2="192" y2="352" stroke="#000000" fill="#000000" stroke-width="86"  stroke-linecap="round" /><line x1="192" y1="352" x2="384" y2="176" stroke="#000000" fill="#000000" stroke-width="86"  stroke-linecap="round" /></svg>';
                break;
            case "curve":
                elementString = '<svg viewBox="0 0 512 512"><path  d="M 96 16 L 416 16 Q 496 16 496 96 L 496 416 Q 496 496 416 496 L 96 496 Q 16 496 16 416 L 16 96 Q 16 16 96 16 Z" stroke="#000000" fill="#ffffff" stroke-width="20"/><path  d="M 96 368 Q 128 400 160 368 Q 128 192 256 192 Q 384 192 352 368 Q 384 400 416 368 Q 448 128 256 128 Q 64 128 96 368 Z" stroke="#000000" fill="#000000" stroke-width="0"/></svg>';
                break;
            case "arrow":
                elementString = '<svg viewBox="0 0 512 512"><path  d="M 96 16 L 416 16 Q 496 16 496 96 L 496 416 Q 496 496 416 496 L 96 496 Q 16 496 16 416 L 16 96 Q 16 16 96 16 Z" stroke="#000000" fill="#ffffff" stroke-width="20"/><path  d="M 64 240 L 64 272 Q 64 304 96 304 L 288 304 L 288 336 Q 288 368 320 368 Q 352 368 432 272 Q 444 256 432 240 Q 352 144 320 144 Q 288 144 288 176 L 288 208 L 96 208 Q 64 208 64 240 Z" stroke="#000000" fill="#000000" stroke-width="0"/></svg>';
                break;
            case "arrow-double":
                elementString = '<svg viewBox="0 0 512 512"><path  d="M 96 16 L 416 16 Q 496 16 496 96 L 496 416 Q 496 496 416 496 L 96 496 Q 16 496 16 416 L 16 96 Q 16 16 96 16 Z" stroke="#000000" fill="#ffffff" stroke-width="20"/><path  d="M 160 240 L 160 272 Q 160 288 160 304 L 304 304 L 304 336 Q 304 368 336 368 Q 368 368 448 272 Q 460 256 448 240 Q 368 144 336 144 Q 304 144 304 176 L 304 208 L 160 208 Q 160 224 160 240 Z" stroke="#000000" fill="#000000" stroke-width="0"/><path  d="M 368 240 L 368 272 Q 368 304 368 304 L 208 304 L 208 336 Q 208 368 176 368 Q 144 368 64 272 Q 52 256 64 240 Q 144 144 176 144 Q 208 144 208 176 L 208 208 L 368 208 Q 368 240 368 240 Z" stroke="#000000" fill="#000000" stroke-width="0"/></svg>';
                break;
            case "arrow-rotate":
                elementString = '<svg viewBox="0 0 512 512"><path  d="M 96 16 L 416 16 Q 496 16 496 96 L 496 416 Q 496 496 416 496 L 96 496 Q 16 496 16 416 L 16 96 Q 16 16 96 16 Z" stroke="#000000" fill="#ffffff" stroke-width="20"/><path  d="M 238 37 Q 88.31713959491714 64.608256162478 85.29774721853107 193.1131490597755 Q 89.83640425118764 348.3067206755527 245.18367712264904 373.04989774317835 L 296.0719182074858 375.8729581879727 L 296.0719182074858 407.8729581879727 Q 296.0719182074858 439.87295818797304 328.0719182074861 439.87295818797304 Q 360.0719182074862 439.87295818797304 440.07191820748596 343.872958187972 Q 452.0719182074862 327.872958187972 440.07191820748596 311.87295818797236 Q 360.0719182074862 215.8729581879733 328.0719182074861 215.8729581879733 Q 296.0719182074858 215.8729581879733 296.0719182074858 247.87295818797392 L 296.0719182074858 279.8729581879727 L 253.31487293555762 278.99733980533074 Q 176.48171003677032 266.809703885628 182.1729177156365 201.0630761762177 Q 190.62384566050127 138.1162697096763 251.48229858585916 132.84130748479205 Q 315.78174593052023 131.75230867899737 345.4802307403552 167.10764773832477 Q 374.47160876900364 201.7558800164656 411.2411613907041 167.8147545195113 Q 445.88939366884495 144.48023074035524 416.8980156401965 105.58935777509512 Q 349.7228714274745 29.928932188134524 238 37 Z" stroke="#000000" fill="#000000" stroke-width="0" transform="rotate(135,262.6848327130085,238.43647909398652)" /></svg>';
                break;
            case "point":
                elementString = '<svg viewBox="0 0 512 512"><path  d="M 96 16 L 416 16 Q 496 16 496 96 L 496 416 Q 496 496 416 496 L 96 496 Q 16 496 16 416 L 16 96 Q 16 16 96 16 Z" stroke="#000000" fill="#ffffff" stroke-width="20"/><circle  cx="256" cy="256" r="125" fill="#000000" /></svg>';
                break;
            default:
                elementString = '<svg style="position:absolute;top:0;left:0;" height="12" width="12" viewBox="0 0 512 512">'+ new Circle(256,256,240,"#307ffd",32,"#307ffd").cleanHTML()+'</svg>';
                break;
        }
        this.container.innerHTML = elementString;
        let rect = this.drawingViewport.getBoundingClientRect();
        this.container.style.cssText = `position:absolute;top:${this.y+rect.y-8}px;left:${this.x+rect.x-8}px;height:16px;width:16px;transform:rotate(${this.rotation}deg)`;
    }
    repaint(){
        this.element.style.cssText = `position:absolute;top:${this.y-8}px;left:${this.x-8}px;height:16px;width:16px;transform:rotate(${this.rotation}deg)`;
    }
}