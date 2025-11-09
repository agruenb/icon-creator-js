import "./css/animations.css";
import "./css/banner.css";
import "./css/ConfirmWindow.css";
import "./css/contextMenu.css";
import "./css/customComponents.css";
import "./css/editor.css";
import "./css/exportWindow.css";
import "./css/fonts.css";
import "./css/infoBox.css";
import "./css/itemImporter.css";
import "./css/rotateDisplay.css";
import "./css/vars.css";

import EditorManager from "./EditorManager";
import { initAnalytics, trackPageView } from "./lib/googleAnalytics";
import Circle from "./patterns/Circle";
import Ellipse from "./patterns/Ellipse";
import Line from "./patterns/Line";
import Path from "./patterns/Path";
import Rect from "./patterns/Rect";
import Text from "./patterns/Text";

let editorEnvironment = {
    document: document,
    window: window,
    layout:{
        container:document.getElementById("mainContainer"),
        viewport:document.getElementById("viewport"),
        resultViewport:document.getElementById("drawingViewport"),
        elementOverview:document.getElementById("elementOverview"),
        overlay:document.getElementById("overlayLayer")
    },
    control:{
        editSVG:{
            cursor:document.getElementById("cursor"),
            clearAll: document.getElementById("clearAll")
        },
        history:{
            back:document.getElementById("historyBack"),
            forwards:document.getElementById("historyForwards")
        },
        meta:{
            gridsize:{
                none:document.getElementById("gridsize_3"),
                size_4:document.getElementById("gridsize_4"),
                size_5:document.getElementById("gridsize_5"),
                size_6:document.getElementById("gridsize_6")
            },
            bgColor:{
                light:document.getElementById("bgColor_light"),
                dark:document.getElementById("bgColor_dark")
            },
            paintColor:document.getElementById("paintColor"),
            exclusiveView:document.getElementById("exclusiveView"),
            moreOptions:document.getElementById("moreOptions")
        },
        export:{
            file:document.getElementById("exportFile"),
            inline:undefined
        }
    },
    config:{
        patterns:[{
            class: Rect,
            startPaintButton: document.getElementById("newRect")
        },{
            class: Circle,
            startPaintButton: document.getElementById("newCircle")
        },{
            class: Ellipse,
            startPaintButton: document.getElementById("newEllipse")
        },{
            class: Line,
            startPaintButton: document.getElementById("newLine")
        },{
            class: Path,
            startPaintButton: document.getElementById("newPath")
        },{
            class: Text,
            startPaintButton: document.getElementById("newText")
        }]
    }
}
let itemLoaderEnvironment = {
    document: document,
    window: window,
    layout:{
        container:document.getElementById("itemImport"),
        overlay:document.getElementById("overlayLayer")
    },
    openSavesButton:document.getElementById("openSaveMenu"),
    openIconsButton:document.getElementById("openIconMenu")
}
window.icon_creator_global_index_counter = 0;

initAnalytics();
trackPageView("editor.")

const manager = new EditorManager();
manager.init(editorEnvironment, itemLoaderEnvironment);