class ExportWindow{
    constructor(container, project){
        this.container = container;
        this.project = project;
        this.build();
    }
    build(){
        let svgString = Exporter.createSVGFileContent(this.project);
        let scaffold = `
            <div class="export-wrapper vertical-scroll">
                <div class="close-button"><img src="img/close_cross.svg"></div>
                <h2>Export Project</h2>
                <div class="preview">
                    ${this.preview("256",svgString)}
                    ${this.preview("64",svgString)}
                    ${this.preview("32",svgString)}
                    ${this.preview("16",svgString)}
                </div>
                <div class="export-options">
                    <button>SVG</button>
                    <button>PNG</button>
                    <button>Inline HTML</button>
                </div>
                <div class="export-row">
                    <button class="download-button">Download</button>
                </div>
            </div>
        `;
        //configure container
        this.container.innerHTML = scaffold;
        this.container.style.cssText = "display:block;";
        this.container.addEventListener("click",()=>{
            this.close();
        });
        //inner wrapper
        let innerWrapper = this.container.querySelector(".export-wrapper");
        innerWrapper.addEventListener("click", event =>{
            event.stopPropagation();
        });
        //download button
        let downloadButton = this.container.querySelector(".download-button");
        downloadButton.addEventListener("click",()=>{
            Exporter.download("easy_svg_online_creation", svgString);
        })

    }
    preview(resolution, svgString){
        return `
        <div class="item-wrapper">
            <div class="preview-label">${resolution}x${resolution}</div>
            <div class="preview-item preview${resolution}">${svgString}</div>
        </div>
        `;
    }
    close(){
        this.container.style.cssText = "display:none;";
        this.container.innerHTML = "";
    }
}