class Exporter {
    static download(filename, content){
        let downloadElement = document.createElement("a");
        downloadElement.setAttribute('href','data:image/svg+xml;charset=utf-8,' + encodeURIComponent(content));
        console.log('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(content));
        downloadElement.setAttribute('download', filename);
        downloadElement.style.display = "none";
        document.body.appendChild(downloadElement);
        downloadElement.click();
    }
    static createSVGFileContent(project){
        let fileContent = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
        fileContent += '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+project.dimensions.width+' '+project.dimensions.height+'">';
        for (let i = 0; i < project.keyframes.length; i++) {
            let orderCopy = JSON.parse(JSON.stringify(project.keyframes[i].renderOrder));
            while(orderCopy.length > 0){
                //if not displayed omit pattern for creation
                if(project.keyframes[i].patterns[orderCopy[0]].display){
                    fileContent += project.keyframes[i].patterns[orderCopy[0]].fullHTML();
                }
                orderCopy.splice(0,1);
            }
        }
        return fileContent+'</svg>';
    }
}