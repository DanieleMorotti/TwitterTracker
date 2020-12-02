import { saveCollection } from './collections.js';
import { searchObj, dispatch_search } from './search.js'
import { stream_stop } from "./stream.js";
import { loadCollections, openCollection, deleteCollection, updateCollectionName} from './collections.js'


export var lastTweetsList = null;
export var lastTweetsSearchObj = null;

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
    </div>
    `,

    methods: {
        streamStop() {
            stream_stop();
        }, 
        onClickSave() {
            saveCollection(lastTweetsList, lastTweetsSearchObj, () => loadCollections());// () => this.$router.push("collections"));
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

        // Display an array of tweets highlighting the specified word
        displayTweets(data, word) {
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
                    <button class="collection-delete"><i class="fas fa-trash" title="delete"></i></button>
                    <button class="collection-open"><i class="fas fa-book-open" title="read"></i></button>
                    <div class="collection-info">
                    <input type="text" class="collection-name" value="${c.name}">
                    <p class="collection-count">Count: ${c.count}</p>
                    <p class="collection-date">${date}</p>
                    </div>
                </div>
                `);

                div.find('.collection-name').on("change", (e) => updateCollectionName(c.id, $(e.target).val()));
                div.find(".collection-open").on("click", () => openCollection(c.id));
                div.find(".collection-delete").on("click", () => deleteCollection(c.id));

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