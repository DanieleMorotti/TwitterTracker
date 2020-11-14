// Save search filters
var searchObj = null;
var lastTweetsList = null;

function initAutocomplete() {
  
    // Create the search box and link it to the UI element.
    var input = document.getElementById('pdi');
    var autocomplete = new google.maps.places.Autocomplete(input);
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(input);
  
    // Bias the SearchBox results towards current map's viewport.
    autocomplete.bindTo('bounds', map);
    // Set the data fields to return when the user selects a place.
    autocomplete.setFields(
      ['name', 'geometry']);
  
    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    autocomplete.addListener('place_changed', function() {
      var place = autocomplete.getPlace();
      if (!place.geometry) {
        console.log("Returned place contains no geometry");
        return;
      }
      var bounds = new google.maps.LatLngBounds();
  
      if (place.geometry.viewport) {
        // Only geocodes have viewport.
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
      map.fitBounds(bounds);
    });
  }
  document.addEventListener("DOMContentLoaded", function(event) {
    initAutocomplete();
  });

function save() {
    searchObj = {
        keyword: $('#keyWord').val(),  
        user: $('#user').val(),
        center: $('#coordinates').val().replace(/\s+/g, ''),
        ray: $('#ray').val(),
        pdi: $('#pdi').val(),
        images_only: $('#images-only').prop('checked')
    };

    for(let field in searchObj) {
        let val = searchObj[field];
        if (val && field !== 'ray' && field !== 'pdi') {
            $(`#${field}Btn`).remove();

            let text = val;
            if(field == 'center') {
                //Add parenthesis around the center field
                text = '(' + text + ')';
            } 
            else if(field == 'images_only') {
                //Text for only images filter
                text = "Containing images";
            }
            
            //Add a button to delete the filter in the tweets view
            $('#componentView').prepend(`<button class="filter" id="${field}Btn" onclick="deleteFilter('${field}')">${text} &#10006;</button>`);
        }
    }

    if(searchObj.pdi != "") {
        var request = {
            query: searchObj.pdi,
            fields: ["name", "geometry"],
        };

        service = new google.maps.places.PlacesService(map);
        service.findPlaceFromQuery(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                console.log(results[0]);
                let lat = results[0].geometry.location.lat();
                let lon = results[0].geometry.location.lng();
                let center = lat + ',' + lon;

                $(`#pdiBtn`).remove();
                $('#componentView').prepend(`<button class="filter" id="pdiBtn" onclick="deleteFilter('pdi')">${results[0].name} &#10006;</button>`)
                document.getElementById("pdi").value = results[0].name;
                
                $('#toTweets').click();
                search(searchObj.keyword, center, 2); //Con un raggio così piccolo restituisce solo i tweet con al loro interno una città precisa di pubblicazione...
            }
        });
    }
    else {
        $('#toTweets').click();
        dispatch_search();
    }
        
}

/* new search invoked from tweets component */
function newSearch() {
    $("#tweets-search").empty();
    lastTweetsList = null;
    if(searchObj && (searchObj.keyword || searchObj.val))
        dispatch_search();
}


function deleteFilter(field) {
    $(`#${field}Btn`).remove();
    searchObj[field] = "";
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
    let reg = new RegExp(word.trim().replace(' ', '|'), 'gi');

    for (let i = 0; i < data.length; i++) {
        let url = "https://twitter.com/" + data[i].username + "/status/" + data[i].id;

        //If there is a keyword higlight it
        let text = data[i].text;
        if(word != "") {
            text = text.replace(reg, '<mark>$&</mark>');
        }

        let div = $(`<div class="tweet">
                        <p class="date">${data[i].data}</p>
                        <h5>${data[i].user}</h5>
                        <p>${text}</p>
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
function search(word, center, ray, images_only) {
    let query = {};
    if (word) {
        query['keyword']= word;
    }
    if (center && ray) {
        query['location'] = center+","+ray+"km";
        drawSearchAreaOnMap(center, ray, '#00FF00');
    }
    if (images_only) {
        query['images_only'] = true;
    }
    
    $.ajax({
        method: "GET",
        url: "/search",
        data: query,
        success: (data) => {
            lastTweetsList = data;
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
    let word = searchObj.keyword;
    let center = searchObj.center;
    let ray = searchObj.ray;
    let images_only = searchObj.images_only

    if (!word) {
        alert("Inserisci una parola chiave o un PdI");
    } else if (center && !(/^\s?\-?\d+\.?\d*\,\s?\-?\d+\.?\d*\s?$/.test(center))) {
        alert('Le coordinate devono essere della forma xx.xxx, yy.yyy');
    } else {
        if (streamingInterval) { stream_stop(); }
        search(word, center, ray, images_only);
    }
}

// Show the tweet with Twitter's visualization in the modal window
function show(url){
    $('#tweetContent').empty();
    $('#tweetContent').append(`<blockquote class="twitter-tweet"><a href="${url}">Tweet</a></blockquote>  <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"><\/script>`);
}
