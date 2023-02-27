export default class Exporter {
    static downloadSVG(filename, SVGfilecontent){
        let downloadElement = document.createElement("a");
        downloadElement.setAttribute('href','data:image/svg+xml;charset=utf-8,' + encodeURIComponent(SVGfilecontent));
        downloadElement.setAttribute('download', filename);
        downloadElement.style.display = "none";
        document.body.appendChild(downloadElement);
        downloadElement.click();
        setTimeout(()=>{
            downloadElement.remove();
        },10000);
    }
    /**
     * 
     * @param {*} filename 
     * @param {*} SVGfilecontent The svg string
     */
    static downloadPNG(filename, SVGfilecontent, size = 512){
        console.log(SVGfilecontent);
        let svg = new Blob([SVGfilecontent], {type:"image/svg+xml;charset=utf-8"});
        let domURL = self.URL || self.webkitURL || self;
        let url = domURL.createObjectURL(svg);
        let canvas = document.createElement("canvas");
        canvas.height = size;
        canvas.width = size;
        let ctx = canvas.getContext("2d");
        let img = new Image();
        img.addEventListener("load",() => {
            console.log("loaded");   
            ctx.drawImage(img, 0, 0, size, size);
            domURL.revokeObjectURL(url);
            //actual download
            let downloadElement = document.createElement("a");
            downloadElement.setAttribute('href',canvas.toDataURL());
            downloadElement.setAttribute('download', filename);
            downloadElement.style.display = "none";
            document.body.appendChild(downloadElement);
            downloadElement.click();
            setTimeout(()=>{
                downloadElement.remove();
            },10000);
        });
        img.addEventListener("error",(e)=>{
            console.log(e);
        });
        img.src = url;
    }
    static downloadHTML(filename, SVGfilecontent){
        let downloadElement = document.createElement("a");
        downloadElement.setAttribute('href','data:text/html;charset=utf-8,' + encodeURIComponent(SVGfilecontent));
        downloadElement.setAttribute('download', filename);
        downloadElement.style.display = "none";
        document.body.appendChild(downloadElement);
        downloadElement.click();
        setTimeout(()=>{
            downloadElement.remove();
        },10000);
    }
    static createSVGFileContent(project, firefoxWidth, firefoxHeight){
        let firefoxFixString = (firefoxWidth && firefoxHeight)?` height="${firefoxWidth}" width="${firefoxHeight}" `:""; 
        let fileContent = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
        fileContent += '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+project.dimensions.width+' '+project.dimensions.height+'"'+firefoxFixString+'>';//height and width need for firefox
        for (let i = 0; i < project.keyframes.length; i++) {
            let orderCopy = JSON.parse(JSON.stringify(project.keyframes[i].renderOrder));
            while(orderCopy.length > 0){
                //if not displayed omit pattern for creation
                if(project.keyframes[i].patterns[orderCopy[0]].display){
                    fileContent += project.keyframes[i].patterns[orderCopy[0]].fullHTML(false, true);
                }
                orderCopy.splice(0,1);
            }
        }
        return fileContent.replace(/\s\s+/g, ' ')+'</svg>';
    }
    static extractSavefileJSON(project, name){
        let editorInfo = project.keyframes[0].get();
        let previewIcon = Exporter.createSVGFileContent(project);
        return ({
            version: (new IconCreatorGlobal()).version,
            exportTime: (new Date).getTime(),
            name:name,
            type:"containsFrame",
            preview:previewIcon,
            editorData:editorInfo
        });
    }
}