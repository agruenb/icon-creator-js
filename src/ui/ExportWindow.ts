import Exporter from "../external/Exporter";
import UniversalOps from "../shared/UniversalOps";
import DataService from "../shared/DataService";
import { gAnalyticsTrackEvent } from "../lib/googleAnalytics";

/**
 * A window for exporting the project in various formats (PNG, SVG, HTML).
 */
export default class ExportWindow {
    container: HTMLElement;
    project: any;
    defaultExportName: string;
    onClose: () => void;

    exportType: string = "png";
    pngResolution: string = "512";
    pngResolutions: string[] = ["1024", "512", "64", "16"];

    private innerWrapper!: HTMLElement;
    private selectSvgButton!: HTMLButtonElement;
    private selectPngButton!: HTMLButtonElement;
    private selectInlineButton!: HTMLButtonElement;
    private selectJSONButton?: HTMLButtonElement;
    private saveIconButton?: HTMLButtonElement;
    private fileExtensionEl!: HTMLElement;
    private filenameInput!: HTMLInputElement;
    private pngResButtons: { [key: number]: HTMLButtonElement } = {};
    private pngOptionsWrapper!: HTMLElement;

    constructor(container: HTMLElement, project: any, exportName: string = "easy_icon_online_art", onClose: () => void) {
        this.container = container;
        this.project = project;
        this.defaultExportName = exportName;
        this.onClose = onClose;
        this.build();
        this.updateButtons();
        this.setPngResolution(this.pngResolution);
    }

    private build(): void {
        let svgString = Exporter.createSVGFileContent(this.project);
        let resButtonString = "";
        for (let i in this.pngResolutions) {
            let res = this.pngResolutions[i];
            resButtonString += this.pngResButton(res);
        }

        const isProduction = !!process.env.IS_PRODUCTION_BUILD;

        let scaffold = `
            <div class="export-wrapper vert-scroll box-shadow wind-in">
                <div class="close-button"><img src="img/close_cross.svg"></div>
                <div class="headline"><img src="img/sys_download_icon.svg">Export Project</div>
                <div class="section-header">Preview</div>
                <div class="preview">
                    ${this.preview("256", svgString)}
                    ${this.preview("64", svgString)}
                    ${this.preview("32", svgString)}
                    ${this.preview("16", svgString)}
                </div>
                <div class="section-header">Export format</div>
                <div class="export-options">
                    <button class="exp-png">PNG</button>
                    <button class="exp-svg">SVG</button>
                    <button class="exp-inline">HTML</button>
                    ${!isProduction ? 'Development: <button class="exp-json">JSON</button><button class="save-icon">Create Icon</button>' : ""}
                </div>
                <div id="pngOptions" style="${(this.exportType == "png") ? "" : "opacity:0.5;pointer-events:none;"}">
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

        this.container.innerHTML = scaffold;
        this.container.style.cssText = "display:block;";
        this.container.classList.add("overlay-fade-in");
        this.container.addEventListener("click", () => {
            this.close();
        });

        this.innerWrapper = this.container.querySelector(".export-wrapper") as HTMLElement;
        this.innerWrapper.addEventListener("click", event => {
            event.stopPropagation();
        });

        let downloadButton = this.container.querySelector(".download-button") as HTMLButtonElement;
        downloadButton.addEventListener("click", () => {
            this.download(svgString);
        });

        let closeButton = this.container.querySelector(".close-button") as HTMLElement;
        closeButton.addEventListener("click", () => {
            this.close();
        });

        this.selectSvgButton = this.container.querySelector(".exp-svg") as HTMLButtonElement;
        this.selectSvgButton.addEventListener("click", () => {
            this.exportType = "svg";
            this.updateButtons();
        });

        this.selectPngButton = this.container.querySelector(".exp-png") as HTMLButtonElement;
        this.selectPngButton.addEventListener("click", () => {
            this.exportType = "png";
            this.updateButtons();
        });

        this.selectInlineButton = this.container.querySelector(".exp-inline") as HTMLButtonElement;
        this.selectInlineButton.addEventListener("click", () => {
            this.exportType = "inline";
            this.updateButtons();
        });

        if (!isProduction) {
            this.selectJSONButton = this.container.querySelector(".exp-json") as HTMLButtonElement;
            this.selectJSONButton.addEventListener("click", () => {
                this.exportType = "json";
                this.updateButtons();
            });

            this.saveIconButton = this.container.querySelector(".save-icon") as HTMLButtonElement;
            this.saveIconButton.addEventListener("click", () => {
                let data = JSON.stringify(Exporter.extractSavefileJSON(this.project, this.filenameInput.value || this.defaultExportName));
                DataService.sendIcon(data);
            });
        }

        this.fileExtensionEl = this.container.querySelector(".file-ext") as HTMLElement;
        this.filenameInput = this.container.querySelector(".file-name-input") as HTMLInputElement;

        this.pngResButtons = {};
        for (let i in this.pngResolutions) {
            let res = this.pngResolutions[i];
            const button = this.container.querySelector(".res-level" + res) as HTMLButtonElement;
            this.pngResButtons[parseInt(res)] = button;
            button.addEventListener("click", () => {
                this.setPngResolution(res);
            });
        }

        this.pngOptionsWrapper = this.container.querySelector("#pngOptions") as HTMLElement;
    }

    private preview(resolution: string, svgString: string): string {
        return `
        <div class="item-wrapper">
            <div class="preview-label">${resolution}x${resolution}</div>
            <div class="preview-item preview${resolution}">${svgString}</div>
        </div>
        `;
    }

    private pngResButton(res: string): string {
        return `
        <button class="png-res res-level${res}">
            ${res}x${res}
        </button>
        `;
    }

    updateButtons(): void {
        let buttons = [this.selectSvgButton, this.selectPngButton, this.selectInlineButton];
        if (this.selectJSONButton) {
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
                if (this.selectJSONButton) {
                    UniversalOps.selectRadio(this.selectJSONButton, buttons);
                    this.fileExtensionEl.innerHTML = ".json";
                }
                break;
        }
    }

    setPngResolution(res: string): void {
        this.pngResolution = res;
        UniversalOps.selectRadio(this.pngResButtons[parseInt(res)], this.pngResButtons);
    }

    download(svgString: string): void {
        let filename = this.filenameInput.value;
        if (filename == "" || filename == undefined) {
            filename = this.defaultExportName;
        }
        filename = filename.replace(/[^a-z0-9_]/gi, '_'); // make file conform
        switch (this.exportType) {
            case "svg":
                Exporter.downloadSVG(filename, svgString);
                gAnalyticsTrackEvent("export_icon", {
                    file_type: "svg"
                });
                break;
            case "png":
                // firefox needs fixed size
                let svgStringFix = Exporter.createSVGFileContent(this.project, parseInt(this.pngResolution), parseInt(this.pngResolution));
                Exporter.downloadPNG(filename, svgStringFix, parseInt(this.pngResolution));
                gAnalyticsTrackEvent("export_icon", {
                    file_type: "png"
                });
                break;
            case "inline":
                Exporter.downloadHTML(filename, svgString);
                gAnalyticsTrackEvent("export_icon", {
                    file_type: "html"
                });
                break;
            case "json":
                console.log(JSON.stringify(Exporter.extractSavefileJSON(this.project, filename)));
                alert("JSON is available in console");
                break;
        }
    }

    close(): void {
        this.innerWrapper.classList.remove("wind-in");
        this.innerWrapper.classList.add("wind-out");
        this.container.classList.remove("overlay-fade-in");
        this.onClose();
        setTimeout(() => {
            this.container.style.cssText = "display:none;";
            this.container.innerHTML = "";
        }, 500);
    }
}
