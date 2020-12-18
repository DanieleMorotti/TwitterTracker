import tweetsComp, {lastTweetsList} from './comp_tweets.js';
import mapComp from './comp_map.js'
import {router} from './routes.js';
import {searchObj} from './search.js';
import { splitCoordinatesIntoLatLng } from './utils.js';

// Interval for the update of the stream of tweets
export var streamingInterval = null;
// Current index into the stream
var streamingIndex = 0;

// Start the stream of tweets
export function streamStart() {
    let query = {}

    if(searchObj.keyword)
        query.keyword = searchObj.keyword;
    if(searchObj.user)
        query.user = searchObj.user;
    if(searchObj.coordinates_only)
        query.coordinates_only = true;
    if(searchObj.images_only)
        query.images_only = true;
    
    if(searchObj.center && searchObj.radius) {
        let radius = searchObj.radius * 1000.0; //km to meters
        let c = splitCoordinatesIntoLatLng(searchObj.center);
        let center = new google.maps.LatLng(c.lat, c.lng);

        //Square the circle
        let NE = google.maps.geometry.spherical.computeOffset(center, radius * Math.sqrt(2), 45);
        let SW = google.maps.geometry.spherical.computeOffset(center, radius * Math.sqrt(2), 225);

        query.location = SW.lng() + "," + SW.lat() + "," + NE.lng() + "," + NE.lat();
    }

    //If no parameters
    if(!(query.keyword || query.location || query.user))
        return false;

    $.ajax({
        method: "GET",
        url: 'streamStart',
        data: query,
        success: (data) => {
            tweetsComp.methods.setTitleAndTweets('0 Tweets received in streaming', [], data.keyword || "");
            tweetsComp.methods.setTweetsTemporary(true);
            
            if (streamingInterval)
                clearInterval(streamingInterval);

            // Start an interval timer that updates the tweets every second
            streamingIndex = 0;
            streamingInterval = setInterval(() => { stream_update(data.keyword) }, 1000);
        },

        error: (xhr, ajaxOptions, thrownError) => {
            console.log("streamStart: " + xhr.status + ' - ' + thrownError);
        }
    });

    return true;
}

// Stop the stream of tweets
export function stream_stop() {
    streamingIndex = 0;

    //Stop the interval update of the stream
    if(streamingInterval) {
        clearInterval(streamingInterval);
    }
    
    $.ajax({
            method: "GET",
            url: 'streamStop',
            
            success: (data) => {
            },
            
            error: (xhr, ajaxOptions, thrownError) => {
                console.log("streamStop: " + xhr.status + ' - ' + thrownError);
            }
    });
}

// Update the tweets from the stream
export function stream_update(word) {
    $.ajax({
        url: '/streamUpdate/' + streamingIndex,
        method: 'GET',
        success: (data) => {
            if(data) {
                streamingIndex += data.length;
                tweetsComp.methods.concatTweets(data);
                tweetsComp.methods.appendTweets(data, 0, data.length, word, $("#viewImages").prop("checked"));
                tweetsComp.methods.setTitle(lastTweetsList.length + ' Tweet ricevuti in streaming');
                if(router.history.current.path) {
                    mapComp.methods.drawDataOnMapView(data);
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            //Stop the interval update of the stream
            if(streamingInterval) {
                clearInterval(streamingInterval);
            }
            console.log("streamUpdate: " + xhr.status + ' - ' + thrownError);
        }
    });
}

window.onbeforeunload = function(){
    stream_stop();
}