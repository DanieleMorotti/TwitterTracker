import { map } from "./comp_search.js";
import { map as compMap } from "./comp_map.js";
import { lastTweetsList, lastTweetsSearchObj } from "./comp_tweets.js";
import { getSearchQuery } from './search.js'
import { imageRequest} from './utils.js'


/*Functions for post preview*/
function addPostPreview(div, body)
{
    imageRequest('/postPreview', JSON.stringify(body)).then(
        (url) => {
            div.empty();
            div.append(`<img style="width: 100%" src="${url}">`);
        });
}

export function addMapPostPreview(div, center, zoom, mapType) {
    let body = {
        tweets: lastTweetsList,
        kind: "map",
        center: center,
        zoom: zoom,
        map_type: mapType
    };

    div.empty();
    addPostPreview(div, body);
}

export function addWordcloudPostPreview(div) {
    let body = {
        tweets: lastTweetsList,
        kind: "wordcloud",
    };
    div.empty();
    div.append('<img id="cloud-post-loading" src="static/img/wc_loading.gif">');
    addPostPreview(div,body);
}

export function addHistogramsPostPreview(div,hType) {
    let body = {
        tweets: lastTweetsList,
        kind: hType
    };

    div.empty();
    addPostPreview(div,body);
}

/*Functions for creating automatic post*/

//call the right function when the modal button is clicked
export function post(type){
    let name = $("#postName").val(); 
	let freq = $("#postFreq").val();
	let count = $("#postNum").val();
	let mess = $("#postMess").val(); 
    if(type === 'map'){
        let center = map.getCenter().toString().slice(1,-1);
        let zoom = compMap.getZoom();
        let mapType = compMap.getMapTypeId();
        autopostMap(freq,count,center,zoom,mess,name,mapType);
    }
    else if(type === 'wc'){
        autopostWordcloud(freq,count,name,mess);
    }
    else{
        autopostHistogram(freq,count,type,name,mess);
    }

    $('#postModal').modal('hide');
    $("#postName").val(""); 
    $("#postMess").val("");
}

function autopost(body) {
    $.ajax({
        method: "POST",
        url: `/autopost`,
        contentType: 'application/json',
        data: JSON.stringify(body),

        success: (data) => {
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
        filters: getSearchQuery(s.count, s.keyword, s.user, s.center, s.radius, s.images_only, s.coordinates_only),
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

export function autopostWordcloud(freq, post_count, name, mess) {
    let s = lastTweetsSearchObj;
    let body = {
        tweets: lastTweetsList,
        filters: getSearchQuery(s.count, s.keyword, s.user, s.center, s.radius, s.images_only, s.coordinates_only),
        kind: "wordcloud",
        frequency: freq,
        post_count: post_count,
        post_name:name,
        message:mess
    };

    autopost(body)
}

export function autopostHistogram(freq, post_count,histo_type, name, mess) {
    let s = lastTweetsSearchObj;
    let body = {
        tweets: lastTweetsList,
        filters: getSearchQuery(s.count, s.keyword, s.user, s.center, s.radius, s.images_only, s.coordinates_only),
        kind: histo_type,
        frequency: freq,
        post_count: post_count,
        post_name:name,
        message:mess
    };

    autopost(body)
}