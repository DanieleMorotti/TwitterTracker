import { map } from "./comp_search.js";
import { lastTweetsList, lastTweetsSearchObj } from "./comp_tweets.js";
import { getSearchQuery } from './search.js'

//call the right function when the modal button is clicked
export function post(type){
    let name = $("#postName").val(); 
	let freq = $("#postFreq").val();
	let count = $("#postNum").val();
	let mess = $("#postMess").val(); 
    if(type === 'map'){
        let center = map.getCenter().toString().slice(1,-1);
        let zoom = map.getZoom();
        let mapType = map.getMapTypeId();
        autopostMap(freq,count,center,zoom,mess,name,mapType);
    }
    else if(type === 'wc'){
        autopostWordcloud(freq,count,name);
    }
    else{
        autopostHistogram(freq,count,type,name);
        $('#imgPreview2,#chooseHistogram').remove();
    }
    console.log(type);
    $('#postModal').modal('hide');
}

/*Functions for post preview*/
function addPostPreview(div, body)
{
    let xhr = new XMLHttpRequest();
    xhr.responseType = 'arraybuffer';
    xhr.onload = () => {
        div.empty();
        var blb = new Blob([xhr.response], {type: 'image/png'});
        var url = (window.URL || window.webkitURL).createObjectURL(blb);
        div.append(`<img style="width: 100%" src="${url}">`);
    }

    xhr.onerror = () => console.log("addPostPreview - Failed loading preview");

    xhr.open('POST', '/postPreview');
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(JSON.stringify(body));
}

export function addMapPostPreview(div, center, zoom, mapType) {
    let body = {
        tweets: lastTweetsList,
        kind: "map",
        center: center,
        zoom: zoom,
        map_type: mapType
    };

    addPostPreview(div, body);
}

export function addWordcloudPostPreview(div) {
    let body = {
        tweets: lastTweetsList,
        kind: "wordcloud",
    };

    addPostPreview(div,body);
}

export function addHistogramsPostPreview(div,hType) {
    let body = {
        tweets: lastTweetsList,
        kind: hType
    };

    addPostPreview(div,body);
}

/*Functions for creating automatic post*/
function autopost(body) {
    $.ajax({
        method: "POST",
        url: `/autopost`,
        contentType: 'application/json',
        data: JSON.stringify(body),

        success: (data) => {
            console.log("Post automatico avviato correttamente");
        },

        error: (xhr, ajaxOptions, thrownError) => {
            console.log("autopost: " + xhr.status + ' - ' + thrownError);
        }
    });
}

export function autopostMap(freq, post_count, center, zoom, message, name, mapType) {
    let s = lastTweetsSearchObj;
    let body = {
        tweets: lastTweetsList,
        filters: getSearchQuery(s.count, s.word, s.user, s.center, s.radius, s.images_only, s.coordinates_only),
        kind: "map",
        center: center,
        zoom: zoom,
        frequency: freq,
        post_count: post_count,
        message: message,
        post_name:name,
        map_type: mapType
    };
    
    autopost(body)
}

export function autopostWordcloud(freq, post_count, name) {
    let s = lastTweetsSearchObj;
    let body = {
        tweets: lastTweetsList,
        filters: getSearchQuery(s.count, s.word, s.user, s.center, s.radius, s.images_only, s.coordinates_only),
        kind: "wordcloud",
        frequency: freq,
        post_count: post_count,
        post_name:name
    };

    autopost(body)
}

export function autopostHistogram(freq, post_count,histo_type, name) {
    let s = lastTweetsSearchObj;
    let body = {
        tweets: lastTweetsList,
        filters: getSearchQuery(s.count, s.word, s.user, s.center, s.radius, s.images_only, s.coordinates_only),
        kind: histo_type,
        frequency: freq,
        post_count: post_count,
        post_name:name
    };

    autopost(body)
}