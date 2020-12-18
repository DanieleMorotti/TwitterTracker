//import collectionsComp from './comp_collections.js'

import tweetsComp from './comp_tweets.js'
import { setSearchObj, searchObj } from './search.js'
import { stream_stop, streamingInterval } from './stream.js'
import { getDateString } from './utils.js';

// Open a tweet collection
export function openCollection(id) {
    $.ajax({
        method: "GET",
        url: "/collections/" + id,
        success: (info) => {
            if (streamingInterval) { 
                stream_stop(); 
            }
            setSearchObj(info.filters);
            tweetsComp.methods.setFilters();
            tweetsComp.methods.setTitleAndTweets(info.count + " Tweets from collection: " + info.name, info.data, searchObj.keyword || "");
            tweetsComp.methods.setTweetsTemporary(false);
            tweetsComp.methods.setOpenCollectionId(id);
        },

        error: (xhr, ajaxOptions, thrownError) => {
            console.log("deleteCollections: " + xhr.status + ' - ' + thrownError);
        }
    })
}

// Delete a tweet collection
export function deleteCollection(id) {
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
export function updateCollectionName(id, name) {
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

// Add to collection
export function addToCollection(id, tweets) {
    $.ajax({
        method: "POST",
        url: `/collections/${id}/add`,
        contentType: 'application/json',
        data: JSON.stringify({
            data: tweets
        }),

        success: (data) => {
            // Reload collections to update counts
            loadCollections();
        },

        error: (xhr, ajaxOptions, thrownError) => {
            console.log("addToCollection: " + xhr.status + ' - ' + thrownError);
        }
    });
}

// Load tweet collections
export function loadCollections() {
    $.ajax({
        method: "GET",
        url: "/collections",

        success: (data) => {
         //   collectionsComp.methods.setCollections(data);
             tweetsComp.methods.setCollections(data);
        },

        error: (xhr, ajaxOptions, thrownError) => {
            console.log("loadCollections: " + xhr.status + ' - ' + thrownError);
        }
    });
}

// Save the currently loaded tweets as a new collection
export function saveCollection(tweets, filters, onSuccess)
{
    let datestring = getDateString();

    $.ajax({
        method: "POST",
        url: "/collections",
        contentType: 'application/json',
        data: JSON.stringify({
            name: "New collection",
            filters: filters,
            data: tweets,
            date: datestring
        }),

        success: (data) => {
            onSuccess(data.id);
        },

        error: (xhr, ajaxOptions, thrownError) => {
            console.log("saveCollections: " + xhr.status + ' - ' + thrownError);
        }
    });
}
