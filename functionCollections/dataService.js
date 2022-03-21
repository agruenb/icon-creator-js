class DataService{

    static sendIcon(data){
        let url = glob_backend + "/post";
        let key = prompt("Enter your write-key");
        let name = prompt("name");
        let type = prompt("type");
        fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: DataService.encodeUrlData({"what":"icon","key":key,"name":name,"type":type,"filecontent":data})
          }).then(
              function(response) {
                return response.text();
              }
          ).then(
              function(text){
                alert("Response: " + text);
              }
          );
    }
    static async getIcons(page = 0, type="full"){
        let url = glob_backend + "/get?" + DataService.encodeUrlData({"what":"icon","key":"null","page":page, "type":type});
        return fetch(url, {
            method: "GET"
        }).then(
            function(response) {
              return response.json();
            }
        ).then(
            function(json){
                for(let key in json){
                    json[key] = JSON.parse(json[key]);
                }
                return json;
            }
        );
    }
    static encodeUrlData(jsonData){
        let formBody = [];
        for (let property in jsonData) {
            let encodedKey = encodeURIComponent(property);
            let encodedValue = encodeURIComponent(jsonData[property]);
            formBody.push(encodedKey + "=" + encodedValue);
        }
        return formBody.join("&");
    }
}