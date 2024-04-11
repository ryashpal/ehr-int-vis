

async function readData(url) {
    var nextUrl = url
    var data = []
    while(nextUrl){
        console.log('Reading URL: ', nextUrl);
        let result = await makeRequest("GET", nextUrl);
        result = JSON.parse(result)
        data.push(result)
        nextUrl = null
        for (let link of result.link) {
            if (link.relation == 'next') {
                nextUrl = link.url;
            }
        }
    }
    return data;
}


function makeRequest(method, url) {
    return new Promise(function (resolve, reject) {
        let xhr = new XMLHttpRequest();
        xhr.open(method, url);
        xhr.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                resolve(xhr.response);
            } else {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            }
        };
        xhr.onerror = function () {
            reject({
                status: this.status,
                statusText: xhr.statusText
            });
        };
        xhr.send();
    });
}

export default readData;
