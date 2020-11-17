// Save search filters
var searchObj = null;
var lastTweetsList = null;
var lastTweetsSearchObj = null;
var autocompleteInitialized = false;

function initAutocomplete() {
    // Create the search box and link it to the UI element.
    var input = document.getElementById('pdi');
    var autocomplete = new google.maps.places.Autocomplete(input);
  /*  map.controls[google.maps.ControlPosition.TOP_CENTER].push(input);*/
  
    // Bias the SearchBox results towards current map's viewport.
    autocomplete.bindTo('bounds', map);
    // Set the data fields to return when the user selects a place.
    autocomplete.setFields(['name', 'geometry']);
  
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

        let loc = place.geometry.location;
        let default_radius = 2;
        $('#coordinates').val(loc.lat() + ', ' + loc.lng());
        $('#radius').val(default_radius);
        $('#radiusValue').text(default_radius);

        drawSearchAreaOnMap(loc.lat() + ', ' + loc.lng(), default_radius, '#00FF00'); 
    });
}

function setFilters() {
    for(let field in searchObj) {
        $(`#${field}Btn`).remove();
        let val = searchObj[field];

        if (val && field != 'radius' && field != 'pdi') {
            let text = val;
            if (field == 'center') {
                //Add parenthesis around the center field
                text = '(' + text + ')';

                //If we have a pdi we write that too
                if (searchObj.pdi) {
                    text += " " + searchObj.pdi;
                }
            }
            else if (field == 'images_only') {
                //Text for only images filter
                text = "Containing images";
            }
            else if (field == 'coordinates_only') {
                text = "Containing coordinates";
            }
            
            //Add a button to delete the filter in the tweets view

            $('#filters').prepend(`<button class="filter" id="${field}Btn" onclick="deleteFilter('${field}')">${text} &#10006;</button><br>`);
        }
    }
}

function save() {
    searchObj = {
        keyword: $('#keyWord').val(),  
        user: $('#user').val(),
        center: $('#coordinates').val().replace(/\s+/g, ''),
        radius: $('#radius').val(),
        pdi: $('#pdi').val(),
        images_only: $('#images-only').prop('checked'),
        coordinates_only: $('#coordinates-only').prop('checked')
    };

    $('#toTweets').click();
    dispatch_search();    
}

/* new search invoked from tweets component */
function newSearch() {
    if(searchObj && (searchObj.keyword || searchObj.center)) {
        $("#tweets-search").empty();
        $("#tweets-search").removeClass('bd-white');

        lastTweetsList = null;
        dispatch_search();
    }
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
    $("#tweets-search").empty();
    let reg = new RegExp(word.trim().replace(' ', '|'), 'gi');

    for (let i = 0; i < data.length; i++) {
        let url = "https://twitter.com/" + data[i].username + "/status/" + data[i].id;

        //If there is a keyword higlight it
        let text = data[i].text;
        if(word) {
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
            let cityAndCoord = `<p>City: ${data[i].city}<br>Coordinates: ${data[i].coordinates} </p>`;
            $(cityAndCoord).insertBefore(div.find('button'));
        }

        $("#tweets-search").append(div);
        $("#tweets-search").addClass('bd-white');
    }
}

// Set the title and the tweets of the tweets view
function setTitleAndTweets(title, data, word) {
    $("#results").empty();
    $("#results").html('<h4 id="search-title">' + title + '</h4>');
    
    lastTweetsList = data;
    //Make a copy of the search object at the time of search, so that we can use it when we save the collection
    lastTweetsSearchObj = JSON.parse(JSON.stringify(searchObj));
    displayTweets(data, word);
    setFilters();
}

// Update the tweets from the stream
function stream_update(word) {
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

// Search tweets containing a word and an optional location
function search(word, user, center, radius, images_only, coordinates_only) {
    //TODO: queste chiamate empty non funzionano se il pulsante e' premuto dal componente search
    // perche' il componente tweets non e' ancora stato caricato, bisogna trovare un modo farle 
    // eliminare appena il componente e' caricato ad esempio con router.push('search', onComplete)
    // tuttavia non ho trovato un modo per accede al router da questo file, forse tutti i file js
    // dovrebbero diventare moduli cosi' possiamo importare le robe?
    $("#tweets-search").empty();
    $("#results").empty();

    $('body').append('<div id="loading"></div>');

    let query = {};
    if (word) {
        query['keyword']= word;
    }
    if (center && radius) {
        query['location'] = center+","+radius+"km";
        drawSearchAreaOnMap(center, radius, '#00FF00');
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
                setTitleAndTweets(data.length + ' Search Tweets Results', data, word);
            } else {
                //Display a message if no tweets are available
                $("#results").append('<p>No results for the specified query</p>');
            }
        },
        error: (xhr, ajaxOptions, thrownError) => { 
            $('#loading').remove();
            console.log("search: " + xhr.status + ' - ' + thrownError);
        }
    });
}

// Start a search and stop the stream if it's active
function dispatch_search() {
    let word = searchObj.keyword;
    let user = searchObj.user;
    let center = searchObj.center;
    let radius = searchObj.radius;
    let images_only = searchObj.images_only;
    let coordinates_only = searchObj.coordinates_only;

    if (center && !(/^\s?\-?\d+\.?\d*\,\s?\-?\d+\.?\d*\s?$/.test(center))) {
        alert('Le coordinate devono essere della forma xx.xxx, yy.yyy');
    }  else if (!word && !center && !user) {
        alert("Inserisci una parola chiave, un utente o una posizione");
    } else {
        if (streamingInterval) { 
            stream_stop(); 
        }
        search(word, user, center, radius, images_only, coordinates_only);
    }
}

// Show the tweet with Twitter's visualization in the modal window
function show(url){
    $('#tweetContent').empty();
    $('#tweetContent').append(`<blockquote class="twitter-tweet"><a href="${url}">Tweet</a></blockquote>  <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"><\/script>`);
}

// Open a tweet collection
function openCollection(id) {
    $('#toTweets').click();
    $.ajax({
        method: "GET",
        url: "/collections/" + id,
        success: (info) => {
            searchObj = info.filters;
            setFilters();
            setTitleAndTweets(info.count + " Tweets from collection: " + info.name, info.data, searchObj.keyword || "");
        },

        error: (xhr, ajaxOptions, thrownError) => {
            console.log("deleteCollections: " + xhr.status + ' - ' + thrownError);
        }
    })
}

// Delete a tweet collection
function deleteCollection(id) {
    $.ajax({
        method: "DELETE",
        url: "/collections/" + id,
        success: () => {
            loadCollections();
        },

        error: (xhr, ajaxOptions, thrownError) => {
            console.log("deleteCollections: " + xhr.status + ' - ' + thrownError);
        }
    })
}

// Update a collection name
function updateCollectionName(id, name) {
    $.ajax({
        method: "POST",
        url: `/collections/${id}/name`,
        contentType: 'application/json',
        data: JSON.stringify({
            name: name,
        }),

        success: (data) => {
        },

        error: (xhr, ajaxOptions, thrownError) => {
            console.log("updateCollectionName: " + xhr.status + ' - ' + thrownError);
        }
    });
}

// Load tweet collections
function loadCollections() {
    $("#collections").empty();
        
    $.ajax({
        method: "GET",
        url: "/collections",

        success: (data) => {
            for(let i = 0; i < data.length; i++)
            {
                let c = data[i];
                let div = $(`
                <div class="collection">
                    <input type="text" class="collection-name" value="${c.name}" onchange="updateCollectionName(${c.id}, $(this).val())">
                    <p class="collection-count">Count: ${c.count}</p>
                    <button class="collection-open" onclick="openCollection(${c.id})">Open</button>
                    <button class="collection-open" onclick="deleteCollection(${c.id})">Delete</button>
                </div>
                `);

                $("#collections").append(div);
            }
        },

        error: (xhr, ajaxOptions, thrownError) => {
            console.log("collections: " + xhr.status + ' - ' + thrownError);
        }
    });
}

// Save the currently loaded tweets as a new collection
function saveCollection()
{
    if(lastTweetsList && lastTweetsSearchObj)
    {
        $.ajax({
            method: "POST",
            url: "/collections",
            contentType: 'application/json',
            data: JSON.stringify({
                name: "New collection",
                filters: lastTweetsSearchObj,
                data: lastTweetsList
            }),

            success: (data) => {
                $("#toCollections").click();
            },

            error: (xhr, ajaxOptions, thrownError) => {
                console.log("collections: " + xhr.status + ' - ' + thrownError);
            }
        });
    }
}