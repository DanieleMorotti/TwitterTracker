// Split a string like "41.235,11.234" into latitude and longitude, return null if the string is invalid
export function splitCoordinatesIntoLatLng(coordinates) {
    let lat = parseFloat(coordinates.split(',')[0]);
    let lng = parseFloat(coordinates.split(',')[1]);

    if(!isNaN(lat) && !isNaN(lng)) {
        return {lat : lat, lng : lng};
    } else {
        return null;
    }
}

// Get url for embedded tweet
export function getEmbeddedTweetUrl(username, id) {
    if(username && id) {
        return "https://twitter.com/" + username + "/status/" + id;
    } else {
        return null;
    }
}

export function getDateString() {
    let d = new Date();
    return d.getDate()  + "/" + (d.getMonth() + 1) + "/" + d.getFullYear();
}

export function imageRequest(url, body) {
    return new Promise( (resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.responseType = 'arraybuffer';
        xhr.onload = () => {
            if (this.status >= 200 && this.status < 300) {    
                var blb = new Blob([xhr.response], { type: 'image/png' });
                var url = (window.URL || window.webkitURL).createObjectURL(blb);
                resolve(url);
            } else {
                reject(this.status);
            }
        }

        xhr.onerror = () => reject(this.status);

        xhr.open('POST', url);
        xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
        xhr.send(body);
    });
}
