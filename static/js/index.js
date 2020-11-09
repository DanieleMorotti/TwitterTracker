// Interval for the update of the stream of tweets
var streamingInterval = null;

// Start the stream of tweets
function streamStart() {
    let keyword = $('#stream').val();
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
                streamingInterval = setInterval(() => { streamUpdate(keyword) }, 500);
            },
            
            error: (xhr, ajaxOptions, thrownError) => {
                console.log("streamStart: " + xhr.status + ' - ' + thrownError);
            }
        });
    }
}

// Stop the stream of tweets
function streamStop() {
    
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

// Display an array of tweets highlighting the specified word
function displayTweets(data, word) {
    let reg = new RegExp(word, 'gi');

    for (let i = 0; i < data.length; i++) {
        var url = "https://twitter.com/" + data[i].username + "/status/" + data[i].id;
        let div = $(`<div class="tweet">
                        <h3>${data[i].user}</h3>
                        <p>${data[i].data}</p>
                        <p>${data[i].text.replace(reg, '<mark>$&</mark>')}</p>
                        <button onclick=show("${url}") id="btn" data-toggle="modal" data-target="#myModal" >Show</button>
                    </div>`);
    
        // Add the city and coordinates only if they are available in the tweet
        if(data[i].city || data[i].coordinates){
            let cityAndCoord = `<p>Città: ${data[i].city} Coordinate: ${data[i].coordinates} </p>`;
            $(cityAndCoord).insertBefore(div.find('button'));
        }
        $("#tweets-search").append(div);
    }
}

// Update the tweets from the stream
function streamUpdate(word) {
    let reg = new RegExp(word, 'gi');
    $.ajax({
        url: '/streamUpdate',
        method: 'GET',
        success: (data) => {
            $("#tweets-search").empty();
            $("#tweets-search").append('<h4>' + data.length + ' Streaming Tweets Results</h4>');
            displayTweets(data, word);
        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log("streamUpdate: " + xhr.status + ' - ' + thrownError);
        }
    });
}

var search_area = null;
// Search tweets containing a word and an optional location
function search(word,loc) {
    let query = {keyword: word}, center, ray ;
    if (loc) {
        query['location'] = loc;
        drawSearchAreaOnMap(loc, '#00FF00');
    }
    $.ajax({
        method: "GET",
        url: "/search",
        data: query,
        success: (data) => {
            $("#tweets-search").empty();
            if (data.length > 0) {
                //Display the tweets
                $("#tweets-search").append('<h4>' + data.length + ' Search Tweets Results</h4>');
                displayTweets(data, word);
            } else {
                //Display a message if no tweets are available
                $("#tweets-search").append('<h5>No results for the specified query</h5>');
            }

        },
        
        error: (xhr, ajaxOptions, thrownError) => {
            console.log("search: " + xhr.status + ' - ' + thrownError);
        }
    });
}

// Start a search and stop the stream if it's active
function dispatch_search() {
    let word = $('#search').val();
    let loc = $('#coordinates').val();

    if (!word) {
        alert("Non hai inserito la parola");
    } else {
        if (streamingInterval) { streamStop(); }
        search(word,loc);
    }
}

// Show the tweet with Twitter's visualization in the modal window
function show(url){
    $('#tweetContent').empty();
    $('#tweetContent').append(`<blockquote class="twitter-tweet"><a href="${url}">Tweet</a></blockquote>  <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"><\/script>`);
}
