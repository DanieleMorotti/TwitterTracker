import { saveCollection } from './collections.js';
import { searchObj, dispatch_search } from './search.js'
import { stream_stop } from "./stream.js";
import { loadCollections, openCollection, deleteCollection, updateCollectionName, addToCollection} from './collections.js'


export var lastTweetsList = null;
export var lastTweetsSearchObj = null;
var tweetsAreTemporary = false;

export default {
    name: 'search',
    template: `
    <div class="flex-tweet-container">
        <div id="searchDiv" class="flex-tweet-left">
            <div id="tweetsDiv">
                <button id="stopBtn" @click="streamStop()">Stop</button>
                <button id="saveBtn" @click="onClickSearch()">Search</button>
                <button id="save-collection" @click="onClickSave()">Save</button>
                <div id="results"></div>
                <div id="filters"></div>
                <div id="tweets-search" style=""></div>
            </div>
        </div>
        <div id="collectionDiv" class="flex-tweet-right" >
            <button id="closeBtn" @click="closeNav">x</button>
            <h4>Le tue collezioni</h4>
            <div>
            <div id="collections"></div>
            </div>
        </div>
        <button id="collectionBtn" @click="openNav" style="transform: scale(1.3)"><i class="fas fa-folder-open"></i></button>

        <!-- modal for deleting collections -->
        <div class="modal fade" id="deleteModal" tabindex="-1" role="dialog" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered" role="document">
                <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                </div>
                <div class="modal-body">Sei sicuro di voler eliminare questa collezione? </div>
                <div class="modal-footer"> 
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Annulla</button>
                    <button id="deleteBtn" type="button" class="btn btn-primary" data-dismiss="modal">Conferma</button>
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
                <div class="modal-body">Sei apri questa collezione, i dati non salvati andranno persi</div>
                <div class="modal-footer"> 
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Annulla</button>
                    <button id="openBtn" type="button" class="btn btn-primary" data-dismiss="modal">Conferma</button>
                </div>
                </div>
            </div>
        </div>

        <!-- modal for adding to collections -->
        <div class="modal fade" id="addModal" tabindex="-1" role="dialog" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered" role="document">
                <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                </div>
                <div class="modal-body">Vuoi aggiungere i risultati a questa collezione?</div>
                <div class="modal-footer"> 
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Annulla</button>
                    <button id="addBtn" type="button" class="btn btn-primary" data-dismiss="modal">Conferma</button>
                </div>
                </div>
            </div>
        </div>
    </div>
    `,

    methods: {
        setTweetsTemporary(temporary) {
            tweetsAreTemporary = temporary;
        },

        streamStop() {
            stream_stop();
        }, 
        onClickSave() {
            if(lastTweetsList)
            {
                saveCollection(lastTweetsList, lastTweetsSearchObj, () => loadCollections());    
                this.setTitle(lastTweetsList.length + " Tweets from collection: New collection");
                this.setTweetsTemporary(false);
            }
        },

        onClickSearch() {
            if(searchObj && (searchObj.keyword || searchObj.center)) {
                this.clearTitleAndTweets();
                dispatch_search();
            }
        },

        // Show the tweet with Twitter's visualization in the modal window
        showTweetInModal(url){
            $('#tweetContent').empty();
            $('#tweetContent').append(`<blockquote class="twitter-tweet"><a href="${url}">Tweet</a></blockquote>  <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"><\/script>`);
        },

        setFilters() {
            $("#filters").empty();
            
            for(let field in searchObj) {
                $(`#${field}Btn`).remove();
                let val = searchObj[field];
        
                if (val && field != 'radius' && field != 'pdi') {
                    let text = val;
                    if (field == 'center') {
                        //Add parenthesis around the center field
                        text = '(' + parseFloat(text.split(',')[0]).toFixed(2) + ', ' + parseFloat(text.split(',')[1]).toFixed(2) + ')';
        
                        //If we have a pdi we write that too
                        if(searchObj.pdi) {
                            text = searchObj.pdi.split(',')[0];
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
                    let filter = $(`<button class="filter" id="${field}Btn">${text} &#10006;</button>`);
                    filter.on("click", () => this.deleteFilter(field));

                    $('#filters').append(filter);

                }
            }
        },

        deleteFilter(field) {
            $(`#${field}Btn`).remove();
            if (field == 'count') {
                searchObj[field] = 250
            } else {
                searchObj[field] = "";
            }
        },

        clearTitleAndTweets() {
            $("#results").empty();
            $("#tweets-search").empty();
            $("#tweets-search").removeClass('bd-white');
        },

        //Append an array of tweets to the tweets view highlighting the specified word
        appendTweets(data, word) {
            lastTweetsList = lastTweetsList.concat(data);
            
            word = word || "";
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
                                <p class="tweet-content">${text}</p>
                                <button class="showBtn" data-toggle="modal" data-target="#tweetModal" >Show</button>
                            </div>`);
                div.find('button').on("click", () => this.showTweetInModal(url) );
            
                // Add the city and coordinates only if they are available in the tweet
                if(data[i].city || data[i].coordinates){
                    let yCenter = (Number(data[i].coordinates[0][1][0]) + Number(data[i].coordinates[0][3][0])) / 2;
                    let xCenter = (Number(data[i].coordinates[0][1][1]) + Number(data[i].coordinates[0][3][1])) / 2;

                    let cityAndCoord = `<p>City: ${data[i].city}<br>Coordinates: lat ${xCenter}, lng ${yCenter} </p>`;
                    $(cityAndCoord).insertBefore(div.find('button'));
                }

                $("#tweets-search").append(div);
                $("#tweets-search").addClass('bd-white');
            }
        },
        
        // Display an array of tweets highlighting the specified word
        displayTweets(data, word) {
            $("#tweets-search").empty();
            this.appendTweets(data, word);
        },

        setTitle(title) {
            $("#results").empty();
            $("#results").html('<h4 id="search-title">' + title + '</h4>');
        },

        // Set the title and the tweets of the tweets view
        setTitleAndTweets(title, data, word) {
            this.setTitle(title);
            
            //Set lastTweetsList as empty list, appendTweets will add the tweets to the list
            lastTweetsList = [];
            //Make a copy of the search object at the time of search, so that we can use it when we save the collection
            lastTweetsSearchObj = JSON.parse(JSON.stringify(searchObj));

            this.displayTweets(data, word);
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
                    <button class="collection-delete" data-toggle="modal" data-target="#deleteModal"><i class="fas fa-trash" title="delete"></i></button>
                    <button class="collection-open" data-toggle="modal" data-target="#openModal"><i class="fas fa-book-open" title="read"></i></button>
                    <button class="collection-add" data-toggle="modal" data-target="#addModal"><i class="fas fa-plus"></i></button>
                    <div class="collection-info">
                    <input type="text" class="collection-name" value="${c.name}">
                    <p class="collection-count">Count: ${c.count}</p>
                    <p class="collection-date">${date}</p>
                    </div>
                </div>
                `);

                div.find('.collection-name').on("change", (e) => updateCollectionName(c.id, $(e.target).val()));
                
                div.find('.collection-delete').on("click", () => {
                    $("#deleteBtn").off();
                    $("#deleteBtn").on("click", () => deleteCollection(c.id));
                });
                
                div.find('.collection-open').on("click", (e) => {
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
            $('#collectionDiv').css("display","block")
            $('#searchDiv').css("display","none")
        },
        closeNav() {
            $('#searchDiv').css("display","block")
            $('#collectionDiv').css("display","none")
        }
    },
    activated() {
        loadCollections()
    }

}