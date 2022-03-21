class ImageProcessor{
    static requestImage(callback){
        let input = document.createElement("input");
        input.setAttribute("type","file");
        input.setAttribute("accept","image/png, image/jpeg, , image/jpg");
        input.addEventListener("change", ()=>{
            let file = input.files[0];
            callback(file);
        });
        input.click();
    }
    static imageDimensions(image, callback){
        let url = URL.createObjectURL(image);
        let img = new Image();
        img.addEventListener("load",()=>{
            let width = img.width;
            let height = img.height;
            callback(width, height);
        });
        img.src = url;
    }
}