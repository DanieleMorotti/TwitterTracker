import { lastTweetsList, lastTweetsSearchObj } from "./comp_tweets.js";
import { getSearchQuery } from './search.js'

function addPostPreview(div, body)
{
    let xhr = new XMLHttpRequest();
    xhr.responseType = 'arraybuffer';
    xhr.onload = () => {
        div.empty();
        var blb = new Blob([xhr.response], {type: 'image/png'});
        var url = (window.URL || window.webkitURL).createObjectURL(blb);
        div.append(`<img width=500 src="${url}">`);
    }

    xhr.onerror = () => console.log("addPostPreview - Failed loading preview");

    xhr.open('POST', '/postPreview');
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(JSON.stringify(body));
}

export function addMapPostPreview(div, center, zoom) {
    let body = {
        tweets: lastTweetsList,
        kind: "map",
        center: center,
        zoom: zoom,
    };

    addPostPreview(div, body);
}

export function addWordcloudPostPreview(div) {
    let body = {
        tweets: lastTweetsList,
        kind: "wordcloud",
    };

    addPostPreview(body);
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

export function autopostMap(freq, post_count, center, zoom) {
    let s = lastTweetsSearchObj;
    let body = {
        tweets: lastTweetsList,
        filters: getSearchQuery(s.count, s.word, s.user, s.center, s.radius, s.images_only, s.coordinates_only),
        kind: "map",
        center: center,
        zoom: zoom,
        frequency: freq,
        post_count: post_count
    };
    
    autopost(body)
}

export function autopostWordcloud(freq, post_count) {
    let s = lastTweetsSearchObj;
    let body = {
        tweets: lastTweetsList,
        filters: getSearchQuery(s.count, s.word, s.user, s.center, s.radius, s.images_only, s.coordinates_only),
        kind: "wordcloud",
        frequency: freq,
        post_count: post_count
    };

    autopost(body)
}