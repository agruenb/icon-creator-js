import Rect from "../patterns/Rect"
import Circle from "../patterns/Circle"
import Ellipse from "../patterns/Ellipse"
import Line from "../patterns/Line"
import Path from "../patterns/Path"
import Text from "../patterns/Text"

export default class PatternClassLoader{
    static patternClassFromString(s:string){
        switch (s) {
            case "Rect":
                return Rect;
            case "Circle":
                return Circle;
            case "Ellipse":
                return Ellipse;
            case "Line":
                return Line;
            case "Path":
                return Path;
            case "Text":
                return Text;
            default:
                console.warn("Invalid subpattern: "+s);
                break;
        }
    }
}