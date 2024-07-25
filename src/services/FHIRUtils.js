

async function readData(url, method='GET', body=null) {
    var nextUrl = url
    var data = []
    while(nextUrl){
        console.log('Reading URL: ', nextUrl);
        let result = await makeRequest(nextUrl, method, body);
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


function makeRequest(url, method='GET', body=null) {
    return new Promise(function (resolve, reject) {
        let xhr = new XMLHttpRequest();
        xhr.open(method, url);
        xhr.setRequestHeader("authentication", "mjRmoNGW6klxaClkKhEkqi7HVYwx6NTH");
        xhr.setRequestHeader("Content-Type", "application/json");
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
        xhr.send(body);
    });
}

export default readData;
