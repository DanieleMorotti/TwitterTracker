// Save search filters  dove avviene la ricerca per luogo?
var searchObj = {};
function save() {
    searchObj = [
        {field: 'keyword', val: $('#keyWord').val()},
        {field: 'user', val: $('#user').val()},
        {field: 'center', val: $('#coordinates').val()},
        {field: 'ray', val: $('#ray').val()},
        {field: 'pdi', val: $('#pdi').val()},
    ]
    searchObj.forEach(element => {
        let index = searchObj.indexOf(element);
        if(element.val && element.field !== 'ray' && element.field !== 'center' ) {
            $(`#${element.field}Btn`).remove();
            $('#componentView').prepend(`<button class="filter" id="${element.field}Btn" onclick="deleteFilter(${index})">${element.val} &#10006;</button>`)
        }
        else if(element.val && element.field == 'center' ) {
            $(`#${element.field}Btn`).remove();
            $('#componentView').prepend(`<button class="filter" id="${element.field}Btn" onclick="deleteFilter(${index})">(${element.val}) &#10006;</button>`)
        }
    })

    $('#toTweets').click();

    dispatch_search();
        
}

/* new search invoked from tweets component */
function newSearch() {
    $("#tweets-search").empty();

    if((searchObj[0] && searchObj.val) || (searchObj[1] && searchObj[1].val)) 
        dispatch_search();
}


function deleteFilter(index) {
    $(`#${searchObj[index].field}Btn`).remove();
    searchObj[index].val = "";
}

// Interval for the update of the stream of tweets
var streamingInterval = null;

// Start the stream of tweets
function streamStart() {
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
function stream_stop() {
    
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
                        <p class="date">${data[i].data}</p>
                        <h5>${data[i].user}</h5>
                        <p>${data[i].text.replace(reg, '<mark>$&</mark>')}</p>
                        <button onclick=show("${url}") id="btn" data-toggle="modal" data-target="#tweetModal" >Show</button>
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
function stream_update(word) {
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

// Search tweets containing a word and an optional location
function search(word,center,ray) {
    let query = {keyword: word};
    if (center && ray) {
        query['location'] = center+","+ray+"km";
        drawSearchAreaOnMap(center, ray, '#00FF00');
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
    let word = searchObj[0].val;
    let center = searchObj[2].val;
    let ray = searchObj[3].val;
    let pdi = searchObj[4].val;

    if (!word && !pdi) {
        alert("Non hai inserito la parola");
    } else {
        if (streamingInterval) { stream_stop(); }
        search(word, center, ray);
    }
}

// Show the tweet with Twitter's visualization in the modal window
function show(url){
    $('#tweetContent').empty();
    $('#tweetContent').append(`<blockquote class="twitter-tweet"><a href="${url}">Tweet</a></blockquote>  <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"><\/script>`);
}
