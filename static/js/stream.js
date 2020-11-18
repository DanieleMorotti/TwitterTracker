
// Interval for the update of the stream of tweets
export var streamingInterval = null;

// Start the stream of tweets
export function streamStart() {
    let keyword = $('#keyWord').val();
    if (keyword) {
        $.ajax({
            method: "GET",
            url: 'streamStart',
            data: {
                word: keyword,
            },
            success: (data) => {
                $('#tweets').empty();
                
                if(streamingInterval)
                    clearInterval(streamingInterval);
                
                // Start an interval timer that updates the tweets every 500ms
                streamingInterval = setInterval(() => { stream_update(keyword) }, 500);
            },
            
            error: (xhr, ajaxOptions, thrownError) => {
                console.log("streamStart: " + xhr.status + ' - ' + thrownError);
            }
        });
    }
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
            setTitleAndTweets(data.length + ' Streaming Tweets Results', data, word);
        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log("streamUpdate: " + xhr.status + ' - ' + thrownError);
        }
    });
}