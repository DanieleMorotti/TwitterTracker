import tweetsComp, {lastTweetsList} from './comp_tweets.js';
import mapComp from './comp_map.js'
import {router} from './routes.js';

// Interval for the update of the stream of tweets
export var streamingInterval = null;
// Current index into the stream
var streamingIndex = 0;

// Save search filters
export var streamObj = null;


export function setStreamObj(newObj) {
    streamObj = newObj;
}

// Start the stream of tweets
export function streamStart() {
    let keyword = streamObj.keyword;
    if (keyword) {
        $.ajax({
            method: "GET",
            url: 'streamStart',
            data: {
                word: keyword,
            },
            success: (data) => {
                tweetsComp.methods.setTitleAndTweets('0 Streaming Tweets Results', [], "");
                tweetsComp.methods.setTweetsTemporary(true);

                if (streamingInterval)
                    clearInterval(streamingInterval);

                // Start an interval timer that updates the tweets every second
                streamingIndex = 0;
                streamingInterval = setInterval(() => { stream_update(keyword) }, 1000);
            },

            error: (xhr, ajaxOptions, thrownError) => {
                console.log("streamStart: " + xhr.status + ' - ' + thrownError);
            }
        });
        return true;
    } else return false;
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
                tweetsComp.methods.appendTweets(data, word);
                tweetsComp.methods.setTitle(lastTweetsList.length + ' Streaming Tweets Results');
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