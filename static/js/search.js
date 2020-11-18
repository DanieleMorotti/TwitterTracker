import {stream_stop, streamingInterval} from './stream.js'
import tweetsComp from './comp_tweets.js'

// Save search filters
export var searchObj = null;

export function setSearchObj(newObj) {
    searchObj = newObj;
}

// Start a search and stop the stream if it's active, returns false if the search fields are not valid
export function dispatch_search() {
    let word = searchObj.keyword;
    let user = searchObj.user;
    let center = searchObj.center;
    let radius = searchObj.radius;
    let images_only = searchObj.images_only;
    let coordinates_only = searchObj.coordinates_only;

    if (center && !(/^\s?\-?\d+\.?\d*\,\s?\-?\d+\.?\d*\s?$/.test(center))) {
        alert('Le coordinate devono essere della forma xx.xxx, yy.yyy');
        return false;
    }  else if (!word && !center && !user) {
        alert("Inserisci una parola chiave, un utente o una posizione");
        return false;
    } else {
        if (streamingInterval) { 
            stream_stop(); 
        }
        search(word, user, center, radius, images_only, coordinates_only);
        return true;
    }
}

// Search tweets containing a word and an optional location
function search(word, user, center, radius, images_only, coordinates_only) {
    $('body').append('<div id="loading"></div>');

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

    $.ajax({
        method: "GET",
        url: "/search",
        data: query,
        success: (data) => {
            $('#loading').remove();
            if (data.length > 0) {
                //Display the tweets
                tweetsComp.methods.setTitleAndTweets(data.length + ' Search Tweets Results', data, word);
            } else {
                //Display a message if no tweets are available
                tweetsComp.methods.setTitle('No results for the specified query');
            }
        },
        error: (xhr, ajaxOptions, thrownError) => { 
            $('#loading').remove();
            console.log("search: " + xhr.status + ' - ' + thrownError);
        }
    });
}


