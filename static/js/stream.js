import tweetsComp from './comp_tweets.js';

// Interval for the update of the stream of tweets
export var streamingInterval = null;

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
                $('#tweets').empty();

                if (streamingInterval)
                    clearInterval(streamingInterval);

                // Start an interval timer that updates the tweets every 500ms
                streamingInterval = setInterval(() => { stream_update(keyword) }, 500);
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
        url: '/streamUpdate',
        method: 'GET',
        success: (data) => {
            tweetsComp.methods.setTitleAndTweets(data.length + ' Streaming Tweets Results', data, word);
        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log("streamUpdate: " + xhr.status + ' - ' + thrownError);
        }
    });
}