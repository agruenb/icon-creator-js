/**
 * Utility class for common image operations, requesting images and getting their dimensions.
 */
export default class ImageProcessor {
    /**
     * Opens a file input dialog to request an image from the user.
     * @param callback - Function called with the selected file
     */
    static requestImage(callback: (file: File) => void): void {
        let input = document.createElement("input");
        input.setAttribute("type", "file");
        input.setAttribute("accept", "image/png, image/jpeg, , image/jpg");
        input.addEventListener("change", () => {
            if (input.files && input.files[0]) {
                let file = input.files[0];
                callback(file);
            }
        });
        input.click();
    }

    /**
     * Loads an image and returns its width and height via callback.
     * @param image - The image file or blob
     * @param callback - Function called with (width, height)
     */
    static imageDimensions(image: Blob | File, callback: (width: number, height: number) => void): void {
        let url = URL.createObjectURL(image);
        let img = new Image();
        img.addEventListener("load", () => {
            let width = img.width;
            let height = img.height;
            callback(width, height);
            URL.revokeObjectURL(url);
        });
        img.src = url;
    }
}
