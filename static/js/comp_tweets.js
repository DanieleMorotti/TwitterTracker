import { saveCollection } from './collections.js';
import { searchObj, dispatch_search } from './search.js'
import { streamStart, stream_stop } from "./stream.js";
import { loadCollections, openCollection, deleteCollection, updateCollectionName, addToCollection} from './collections.js'
import { getEmbeddedTweetUrl, splitCoordinatesIntoLatLng } from './utils.js';

export var lastTweetsList = null;
export var lastTweetsSearchObj = null;
var tweetsAreTemporary = false;
var openCollectionId = null;

export default {
    name: 'search',
    template: `
    <div class="flex-tweet-container">
        <div id="searchDiv" class="flex-tweet-left">
            <div id="tweetsDiv">
                    <header>
                    <div id="tweetsBtn">
                    <button id="saveBtn" @click="onClickSearch()" title="New research">Search</button>
                    <button id="startBtn" @click="stream_start()" title="Start stream">Start</button>
                    <button id="stopBtn" @click="streamStop()" title="Stop stream">Stop</button>
                    <button id="save-collection" @click="onClickSave()" title="Save collection">Save</button>
                    </div>
                    </header>
                <div id="viewImagesDiv">
                    <span class="toggle">
                    <input type="checkbox" id="viewImages" class="switch-input" name="styles_switch" value="false" style="display:none" @change="changeViewImages">
                    <label for="viewImages" id="viewImagesLabel" class="switch-label" style="font-size: 14.5px;"> Display images</label>
                    </span>
                </div>
                <br>
                <div id="results"></div>
                <div id="filters"></div>
                <div id="tweets-search" style=""></div>
            </div>
        </div>
        <div id="collectionDiv" class="flex-tweet-right" >
            <button class="closeBtn" @click="closeNav">x</button>
            <h4>Your collections</h4>
            <div id="collections"></div>
        </div>
        <button id="collectionBtn" @click="openNav" style="transform: scale(1.3)"  aria-labelledby="openCollections">
        <i class="fas fa-folder-open"></i>
        <span id="openCollections" style="display: none;">Open collections sidebar</span>
        </button>

        <!-- modal for deleting collections -->
        <div class="modal fade" id="deleteModal" tabindex="-1" role="dialog" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered" role="document">
                <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                </div>
                <div class="modal-body">Are you sure to delete this collection? </div>
                <div class="modal-footer"> 
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
                    <button id="deleteBtn" type="button" class="btn btn-primary" data-dismiss="modal">Delete</button>
                </div>
                </div>
            </div>
        </div>

        <!-- modal for opening collections -->
        <div class="modal fade" id="openModal" tabindex="-1" role="dialog" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered" role="document">
                <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                </div>
                <div class="modal-body">If you open this collection, the current,not saved tweets will be lost</div>
                <div class="modal-footer"> 
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
                    <button id="openBtn" type="button" class="btn btn-primary" data-dismiss="modal">Open</button>
                </div>
                </div>
            </div>
        </div>

        <!-- modal for adding to collection -->
        <div class="modal fade" id="addModal" tabindex="-1" role="dialog" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered" role="document">
                <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                </div>
                <div class="modal-body">Do you want to add results to this collection?</div>
                <div class="modal-footer"> 
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
                    <button id="addBtn" type="button" class="btn btn-primary" data-dismiss="modal">Add</button>
                </div>
                </div>
            </div>
        </div>
    </div>
    `,

    methods: {
        changeViewImages() {
            if(lastTweetsList) {
                this.displayTweets(lastTweetsList, lastTweetsSearchObj.keyword, $("#viewImages").prop("checked"));
            }
        },

        setTweetsTemporary(temporary) {
            tweetsAreTemporary = temporary;
            if(temporary) {
                openCollectionId = null;
            }
        },

        setOpenCollectionId(id) {
            openCollectionId = id;
        },

        stream_start() {
            streamStart();
            $("#stopBtn").prop("disabled",false);
            $("#startBtn").prop("disabled",true);
        }, 
        streamStop() {
            stream_stop();
            $("#stopBtn").prop("disabled",true);
            $("#startBtn").prop("disabled",false);
        }, 
        onClickSave() {
            if(lastTweetsList)
            {
                this.openNav();
                saveCollection(lastTweetsList, lastTweetsSearchObj, (id) => {
                    openCollectionId = id;
                    loadCollections();
                });
                this.setTitle(lastTweetsList.length + " Tweets from collection: New collection");
                this.setTweetsTemporary(false);
            }
        },

        onClickSearch() {
            if(searchObj && (searchObj.keyword || searchObj.center)) {
                this.clearTitleAndTweets(false);
                dispatch_search();
            }
        },

        // Show the tweet with Twitter's visualization in the modal window
        showTweetInModal(id){
            $('#tweetContent').empty();
            twttr.widgets.createTweet(id, document.getElementById("tweetContent"))
            .then( 
                () => {
                    if($("#tweetContent").children().length == 0)
                        $("#tweetContent").append(`<p>The selected tweet has been deleted</p>`)
                }
            )
        },

        setFilters() {
            $("#filters").empty();
            
            for(let field in searchObj) {
                $(`#${field}Btn`).remove();
                let val = searchObj[field];
        
                if (val && field != 'radius' && field != 'pdi' && field != 'count') {
                    let text = val;
                    if (field == 'center') {
                        //Add parenthesis around the center field
                        let c = splitCoordinatesIntoLatLng(text);
                        text = '(' + c.lat.toFixed(2) + ', ' + c.lng.toFixed(2) + ')';
        
                        //If we have a pdi we write that too
                        if(searchObj.pdi) {
                            text = searchObj.pdi.split(',')[0];
                        }
                    }
                    else if (field == 'images_only') {
                        //Text for only images filter
                        text = "Images only";
                    }
                    else if (field == 'coordinates_only') {
                        text = "Coordinates only";
                    }
                    
                    //Add a button to delete the filter in the tweets view
                    let filter = $(`<button class="filter" id="${field}Btn">${text} &#10006;</button>`);
                    filter.on("click", () => this.deleteFilter(field));

                    $('#filters').append(filter);

                }
            }
            
            $("#viewImages").prop("checked", searchObj.images_only || false);
        },

        deleteFilter(field) {
            $(`#${field}Btn`).remove();
            if (field == 'count') {
                searchObj[field] = 250
            } else {
                searchObj[field] = "";
            }
        },

        clearTitleAndTweets(stream) {
            if(!stream) {
                $("#stopBtn").prop("disabled",true);
            }
            else {
                $("#stopBtn").prop("disabled",false);
                $("#startBtn").prop("disabled",true);
            } 
            $("#results").empty();
            $("#tweets-search").empty();
            $("#tweets-search").removeClass('bd-white');
        },

        //Concat tweets to the lastTweetsList array
        concatTweets(data) {
            lastTweetsList = lastTweetsList.concat(data);
        },

        //Append an array of tweets to the tweets view highlighting the specified word
        appendTweets(data, begin, end, word, img_only) {
            word = word || "";
            let reg = new RegExp(word.trim().replace(/(\s|,)+/g, '|').trim(), 'gi');
            
            let begin_count = $("#tweets-search").children().length;
            for (let i = begin; i < Math.min(data.length, end); i++) {
                let div = null;
                if (!img_only) {
                    //If there is a keyword higlight it
                    let text = data[i].text;
                    if (word) {
                        text = text.replace(reg, '<mark>$&</mark>');
                    }
                    div = $(`<div class="tweet">
                                <p class="date">${data[i].data}</p>
                                <img src="${data[i].profile || '/static/img/default_user.png'}" class="profile_pic" alt="profilepic_tweet${i}" onerror="this.src='/static/img/default_user.png'"></img>
                                <div class="user">
                                   <h5>${data[i].user}</h5>
                                   <p class="tweet-content">${text}</p>
                                </div>
                                <button class="showBtn" data-toggle="modal" data-target="#tweetModal" >Show</button>
                            </div>`);
                            div.find('button').on("click", () => this.showTweetInModal(data[i].id));
                } else if(data[i].images[0]) {
                    div = $(`<div class="tweet-images" data-toggle="modal" data-target="#tweetModal">
                                <img src="${data[i].profile || '/static/img/default_user.png'}" class="profile_pic" alt="profilepic_tweet${i}" onerror="this.src='/static/img/default_user.png'"></img>
                                <div class="user">
                                   <h5>${data[i].user}</h5>
                                   <img class="post_image" src="${data[i].images[0]}"></img>
                                </div>
                            </div>`);
                    div.on("click", () => this.showTweetInModal(data[i].id));
                }
               
                if(div) {
                    // Add the city and coordinates only if they are available in the tweet
                    if(data[i].city || data[i].coordinates){
                        let yCenter = (Number(data[i].coordinates[0][1][0]) + Number(data[i].coordinates[0][3][0])) / 2;
                        let xCenter = (Number(data[i].coordinates[0][1][1]) + Number(data[i].coordinates[0][3][1])) / 2;

                        let cityAndCoord = `<p>City: ${data[i].city}<br>Coordinates: lat ${xCenter}, long ${yCenter} </p>`;
                        $(cityAndCoord).insertBefore(div.find('button'));
                    }

                    $("#tweets-search").append(div);
                } else {
                    end++;
                }
            }

            //When the 50th tweet comes to the screen load 100 more
            if(end < data.length) {
                let end_count = $("#tweets-search").children().length;
                let i = begin_count + Math.floor((end_count - begin_count)/ 2);
                let div = $($("#tweets-search").children().get(i));
                $("#searchDiv").off();
                $("#searchDiv").on("scroll", () => {
                    if(div.visible()) {
                        $("#searchDiv").off();
                        this.appendTweets(data, end, end + 100, word, img_only);
                    }
                });
            }

            $("#tweets-search").addClass('bd-white');
        },
        

        // Display an array of tweets highlighting the specified word
        displayTweets(data, word, img_only) {
            $("#tweets-search").empty();
            $("#searchDiv")[0].scrollTop = 0;
            this.appendTweets(data, 0, 100, word, img_only);
        },

        setTitle(title) {
            $("#results").empty();
            $("#results").html('<h4 id="search-title">' + title + '</h4>');
        },

        // Set the title and the tweets of the tweets view
        setTitleAndTweets(title, data, word) {
            this.setTitle(title);
            lastTweetsList = data;
            //Make a copy of the search object at the time of search, so that we can use it when we save the collection
            lastTweetsSearchObj = JSON.parse(JSON.stringify(searchObj));
            $("#viewImages").prop("checked", lastTweetsSearchObj.images_only);
            
            this.displayTweets(data, word, lastTweetsSearchObj.images_only);
        },

         // Display an array of collections in the collections area
         setCollections(data) {
            $("#collections").empty();
            for(let i = 0; i < data.length; i++)
            {
                let c = data[i];
                let date = c.date || "";
                let div = $(`
                <div class="collection">
                    <button class="collection-delete" data-toggle="modal" data-target="#deleteModal" aria-labelledby="deleteLabel"><i class="fas fa-trash" title="Delete"></i><span id="deleteLabel" style="display: none;">Delete collection</span></button>
                    <button class="collection-open" data-toggle="modal" data-target="#openModal"  aria-labelledby="openLabel"><i class="fas fa-book-open" title="Open"></i><span id="openLabel" style="display: none;">Open collection</span></button>
                    <button class="collection-add" data-toggle="modal" data-target="#addModal"  aria-labelledby="addLabel"><i class="fas fa-plus" title="Add tweets"></i><span id="addLabel" style="display: none;">Add to collection</span></button>
                    <div class="collection-info">
                    <label id="nameLabel" style="display:none">Change the name of the collection</label> 
                    <input type="text" class="collection-name" value="${c.name}"  aria-labelledby="nameLabel">
                    <p class="collection-count">Number of tweets: ${c.count}</p>
                    <p class="collection-date">${date}</p>
                    </div>
                </div>
                `);

                div.find('.collection-name').on("change", (e) => {
                    let name = $(e.target).val();
                    updateCollectionName(c.id, name);
                    if(c.id == openCollectionId) {
                        this.setTitle(c.count + " Tweets from collection: " + name);
                    }
                });
                
                div.find('.collection-delete').on("click", () => {
                    $("#deleteBtn").off();
                    $("#deleteBtn").on("click", () => deleteCollection(c.id));
                });
                
                div.find('.collection-open').on("click", (e) => {
                    this.closeNav();
                    if(tweetsAreTemporary) {
                        $("#openBtn").off();
                        $("#openBtn").on("click", () => openCollection(c.id));
                    } else {
                        openCollection(c.id);
                        e.preventDefault();
                        return false;
                    }
                });

                div.find('.collection-add').on("click", () => {
                    $("#addBtn").off();
                    $("#addBtn").on("click", () => addToCollection(c.id, lastTweetsList));
                });

                $("#collections").append(div);
            }
        },
        openNav() {
            if($('#collectionDiv').css('display') == 'none') {
                $('#collectionDiv').css("display","block")
                $('#searchDiv').css("display","none")
            }
        },
        closeNav() {
            if($('#searchDiv').css('display') == 'none') {
                $('#searchDiv').css("display","block")
                $('#collectionDiv').css("display","none")
            }
        }
    },
    activated() {
        loadCollections()

        //Refresh the tweets if they arrived from a stream while in another component
        if(lastTweetsList) {
            $("#viewImages").prop("checked", lastTweetsSearchObj.images_only);
            this.displayTweets(lastTweetsList, lastTweetsSearchObj.keyword, lastTweetsSearchObj.images_only)
        }
    }

}