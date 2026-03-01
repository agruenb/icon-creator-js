/**
 * Service for network data operations, sending and receiving icon data from the backend.
 */
export default class DataService {

    /**
     * Sends icon data to the library backend.
     * @param data - The icon data to send
     */
    static sendIcon(data: string): void {
        let url = process.env.ICON_LIBRARY_BACKEND_URL + "/post";
        let key = prompt("Enter your write-key");
        let name = prompt("name");
        let type = prompt("type");
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: DataService.encodeUrlData({ "what": "icon", "key": key, "name": name, "type": type, "filecontent": data })
        }).then(
            function (response) {
                return response.text();
            }
        ).then(
            function (text) {
                alert("Response: " + text);
            }
        );
    }

    /**
     * Retrieves icon data from the library backend.
     * @param page - The page number of results to fetch
     * @param type - The type of icons to fetch ('full' or 'line')
     * @returns A promise resolving to an object/array of icon items
     */
    static async getIcons(page = 0, type = "full"): Promise<any> {
        let url = process.env.ICON_LIBRARY_BACKEND_URL + "/get?" + DataService.encodeUrlData({ "what": "icon", "key": "null", "page": page, "type": type });
        return fetch(url, {
            method: "GET"
        }).then(
            function (response) {
                return response.json();
            }
        ).then(
            function (json) {
                for (let key in json) {
                    json[key] = JSON.parse(json[key]);
                }
                return json;
            }
        );
    }

    /**
     * Encodes a JSON object into a URL-friendly form-urlencoded string.
     * @param jsonData - The data to encode
     * @returns Encoded string
     */
    static encodeUrlData(jsonData: { [key: string]: any }): string {
        let formBody: string[] = [];
        for (let property in jsonData) {
            let encodedKey = encodeURIComponent(property);
            let encodedValue = encodeURIComponent(jsonData[property]);
            formBody.push(encodedKey + "=" + encodedValue);
        }
        return formBody.join("&");
    }
}
