class DataService{

    static sendIcon(data){
        let url = glob_backend + "/post";
        let key = prompt("Enter your write-key");
        let name = prompt("name");
        let type = prompt("type");
        fetch(url, {
            method: 'POST',
            cache: 'no-cache',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: DataService.encodeUrlData({"what":"icon","key":key,"name":name,"type":type,"filecontent":data}) // body data type must match "Content-Type" header
          }).then(
              function(response) {
                return response.text();
              }
          ).then(
              function(text){
                console.log("Response", text);
              }
          )
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