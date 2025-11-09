import Exporter from "../external/Exporter";
import UniversalOps from "../shared/UniversalOps";
import DataService from "../shared/DataService";
import { gAnalyticsTrackEvent } from "../lib/googleAnalytics";

export default class ExportWindow{

    exportType = "png";
    pngResolution = "512";
    pngResolutions = ["1024","512","64","16"];

    constructor(container, project, exportName = "easy_icon_online_art", onClose){
        this.container = container;
        this.project = project;
        this.defaultExportName = exportName;
        this.onClose = onClose;
        this.build();
        this.updateButtons();
        this.setPngResolution(this.pngResolution);
    }
    build(){
        let svgString = Exporter.createSVGFileContent(this.project);
        let resButtonString = "";
        for(let i in this.pngResolutions){
            let res = this.pngResolutions[i];
            resButtonString += this.pngResButton(""+res);
        }
        let scaffold = `
            <div class="export-wrapper vert-scroll box-shadow wind-in">
                <div class="close-button"><img src="img/close_cross.svg"></div>
                <div class="headline"><img src="img/sys_download_icon.svg">Export Project</div>
                <div class="section-header">Preview</div>
                <div class="preview">
                    ${this.preview("256",svgString)}
                    ${this.preview("64",svgString)}
                    ${this.preview("32",svgString)}
                    ${this.preview("16",svgString)}
                </div>
                <div class="section-header">Export format</div>
                <div class="export-options">
                    <button class="exp-png">PNG</button>
                    <button class="exp-svg">SVG</button>
                    <button class="exp-inline">HTML</button>
                    ${(!process.env.IS_PRODUCTION_BUILD)?'Development: <button class="exp-json">JSON</button><button class="save-icon">Create Icon</button>':""}
                </div>
                <div id="pngOptions" style="${(this.exportType == "png")?"":"opacity:0.5;pointer-events:none;"}">
                    <div class="section-header">PNG resolution</div>
                    <div class="export-options">
                        ${resButtonString}
                    </div>
                </div>
                <div class="section-header">Download</div>
                <div class="export-row">
                    <input id="exportName" class="file-name-input" value="${this.defaultExportName}"><label class="file-ext" for="exportName"></label><button class="download-button">Download</button>
                </div>
            </div>
        `;
        //configure container
        this.container.innerHTML = scaffold;
        this.container.style.cssText = "display:block;";
        this.container.classList.add("overlay-fade-in");
        this.container.addEventListener("click",()=>{
            this.close();
        });
        //inner wrapper
        this.innerWrapper = this.container.querySelector(".export-wrapper");
        this.innerWrapper.addEventListener("click", event =>{
            event.stopPropagation();
        });
        //download button
        let downloadButton = this.container.querySelector(".download-button");
        downloadButton.addEventListener("click",()=>{
            this.download(svgString);
        });
        //close button
        let closeButton = this.container.querySelector(".close-button");
        closeButton.addEventListener("click",()=>{
            this.close();
        });
        //export svg
        this.selectSvgButton = this.container.querySelector(".exp-svg");
        this.selectSvgButton.addEventListener("click",()=>{
            this.exportType = "svg";
            this.updateButtons();
        });
        //export png
        this.selectPngButton = this.container.querySelector(".exp-png");
        this.selectPngButton.addEventListener("click",()=>{
            this.exportType = "png";
            this.updateButtons();
        });
        //export inline html
        this.selectInlineButton = this.container.querySelector(".exp-inline");
        this.selectInlineButton.addEventListener("click",()=>{
            this.exportType = "inline";
            this.updateButtons();
        });
        //development only
        if(!process.env.IS_PRODUCTION_BUILD){
            //export json
            this.selectJSONButton = this.container.querySelector(".exp-json");
            this.selectJSONButton.addEventListener("click",()=>{
                this.exportType = "json";
                this.updateButtons();
            });
            //save icon
            this.saveIconButton = this.container.querySelector(".save-icon");
            this.saveIconButton.addEventListener("click",()=>{
                let data = JSON.stringify(Exporter.extractSavefileJSON(this.project));
                DataService.sendIcon(data);
            });
        }
        //file extension element
        this.fileExtensionEl = this.container.querySelector(".file-ext");
        //filename input
        this.filenameInput = this.container.querySelector(".file-name-input");
        //png resolutions
        this.pngResButtons = {};
        for(let i in this.pngResolutions){
            let res = this.pngResolutions[i];
            this.pngResButtons[parseInt(res)] = this.container.querySelector(".res-level"+res);
            this.pngResButtons[parseInt(res)].addEventListener("click",()=>{
                this.setPngResolution(res);
            });
        }
        //png options wrapper
        this.pngOptionsWrapper = this.container.querySelector("#pngOptions");
    }
    preview(resolution, svgString){
        return `
        <div class="item-wrapper">
            <div class="preview-label">${resolution}x${resolution}</div>
            <div class="preview-item preview${resolution}">${svgString}</div>
        </div>
        `;
    }
    pngResButton(res){
        return `
        <button class="png-res res-level${res}">
            ${res}x${res}
        </button>
        `;
    }
    updateButtons(){
        let buttons = [this.selectSvgButton, this.selectPngButton, this.selectInlineButton];
        if(!process.env.IS_PRODUCTION_BUILD){
            buttons.push(this.selectJSONButton);
        }
        this.pngOptionsWrapper.style.cssText = "opacity:0.5;pointer-events:none;";
        switch (this.exportType) {
            case "svg":
                UniversalOps.selectRadio(this.selectSvgButton, buttons);
                this.fileExtensionEl.innerHTML = ".svg";
                break;
            case "png":
                UniversalOps.selectRadio(this.selectPngButton, buttons);
                this.fileExtensionEl.innerHTML = ".png";
                this.pngOptionsWrapper.style.cssText = "opacity:1;";
                break;
            case "inline":
                UniversalOps.selectRadio(this.selectInlineButton, buttons);
                this.fileExtensionEl.innerHTML = ".html";
                break;
            case "json":
                UniversalOps.selectRadio(this.selectJSONButton, buttons);
                this.fileExtensionEl.innerHTML = ".json";
                break;
        }
    }
    setPngResolution(res){
        this.pngResolution = res;
        UniversalOps.selectRadio( this.pngResButtons[parseInt(res)], this.pngResButtons);
    }
    download(svgString){
        let filename = this.filenameInput.value;
        if(filename == "" || filename == undefined){
            filename = this.defaultExportName; 
        }
        filename = filename.replace(/[^a-z0-9_]/gi, '_');//make file conform
        switch (this.exportType) {
            case "svg":
                Exporter.downloadSVG(filename, svgString);
                gAnalyticsTrackEvent("export_icon",{
                    file_type:"svg"
                });
                break;
            case "png":
                //firefox needs fixed size
                let svgStringFix = Exporter.createSVGFileContent(this.project, this.pngResolution, this.pngResolution);
                Exporter.downloadPNG(filename, svgStringFix, parseInt(this.pngResolution));
                gAnalyticsTrackEvent("export_icon",{
                    file_type:"png"
                });
                break;
            case "inline":
                Exporter.downloadHTML(filename, svgString);
                gAnalyticsTrackEvent("export_icon",{
                    file_type:"html"
                });
                break;
            case "json":
                console.log(JSON.stringify(Exporter.extractSavefileJSON(this.project)));
                alert("JSON is available in console");
                break;
        }
    }
    close(){
        this.innerWrapper.classList.remove("wind-in");
        this.innerWrapper.classList.add("wind-out");
        this.container.classList.remove("overlay-fade-in");
        this.onClose();
        setTimeout(()=>{
            this.container.style.cssText = "display:none;";
            this.container.innerHTML = "";
        },500);
    }
}