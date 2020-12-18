import { stream_stop, streamingInterval } from './stream.js'
import { map } from './comp_search.js'
import tweetsComp from './comp_tweets.js'
import { splitCoordinatesIntoLatLng } from './utils.js';

// Save search filters
export var searchObj = null;

export function setSearchObj(newObj) {
    searchObj = newObj;
}

// Start a search and stop the stream if it's active, returns false if the search fields are not valid
export function dispatch_search() {
    let count = searchObj.count;
    let word = searchObj.keyword;
    let user = searchObj.user;
    let center = searchObj.center;
    let radius = searchObj.radius;
    let images_only = searchObj.images_only;
    let coordinates_only = searchObj.coordinates_only;

    //Given coordinates doesn't matches the expected syntax
    if (center && !(/^\s?\-?\d+\.?\d*\,\s?\-?\d+\.?\d*\s?$/.test(center))) {
        //There isn't yet the error message
        if (!$('#coordinates_err').length) {
            $('#coordinates').after('<span id="coordinates_err" class="error_msg">*Coordinates must to be write as xx.xxx, yy.yyy</span>')
        }
        return false;
        //Given coordinates are well written
    } else {
        //The error message has been displayed and get removed
        if ($('#coordinates_err').length) {
            $('#coordinates_err').remove();
        }
        //If coordinates are given the search map is centered on the location
        if (map && center) {
            map.setCenter(splitCoordinatesIntoLatLng(center));
        }
    }
    //The query doesn't contain any of the required filters
    if (!word && !center && !user) {
        //There isn't yet the error message
        if (!$('#filter_err').length) {
            $('#searchBtn').after('<span id="filter_err" class="error_msg">*You must enter at least a keyword, a user or a location</span>');
        }
        return false;
    //Given query has at least one of the required filter
    } else {
        //The error message has been displayed and get removed
        if ($('#filter_err').length) {
            $('#filter_err').remove();
        }
    }
    //A streaming was on and get shut off
    if (streamingInterval) { 
        stream_stop(); 
    }
    search(count, word, user, center, radius, images_only, coordinates_only);
    return true;
}

export function getSearchQuery(count, word, user, center, radius, images_only, coordinates_only)
{
    let query = {};
    if (word) {
        query['keyword']= word;
    }
    if (center && radius) {
        query['location'] = center+","+radius+"km";
    }
    if (images_only) {
        query['images_only'] = true;
    }
    if (coordinates_only) {
        query['coordinates_only'] = true;
    }
    if (user) {
        query['user'] = user;
    }
    query['count'] = count;

    return query;
}

// Search tweets containing a word and an optional location
function search(count, word, user, center, radius, images_only, coordinates_only) {
    if (!$('#loading').length) {
        $('body').append('<div id="loading"></div>');
    }

    let query = getSearchQuery(count, word, user, center, radius, images_only, coordinates_only);

    $.ajax({
        method: "GET",
        url: "/search",
        data: query,
        success: (data) => {
            $('#loading').remove();
            if (data.length > 0) {
                //Display the tweets
                tweetsComp.methods.setTitleAndTweets(data.length + ' Search results', data, word);
                tweetsComp.methods.setTweetsTemporary(true);
            } else {
                //Display a message if no tweets are available
                tweetsComp.methods.setTitle('No results for this search');
                tweetsComp.methods.setTweetsTemporary(false);
            }
        },
        error: (xhr, ajaxOptions, thrownError) => { 
            $('#loading').remove();
            console.log("search: " + xhr.status + ' - ' + thrownError);
        }
    });
}


