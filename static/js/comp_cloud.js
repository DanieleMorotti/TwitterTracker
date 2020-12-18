import { lastTweetsList } from './comp_tweets.js'
import {addWordcloudPostPreview,post } from './autopost.js'
import { imageRequest } from './utils.js';

export default {
	name: 'word_cloud',
    template: `
    <div>
        <div id="info">
            <img src="/static/img/nocloud.png" alt="icona no word-cloud">
            <p>There is still no data to display. <br>
            Do a search or load a collection to create a Word-Cloud</p>
        </div>
        <div id="share-div">
            <button @click="createModal" id="postbtn" class="share-bttns">SHARE <i class="fas fa-share-alt"></i></button>
        </div>
        <div id="wordcloud-container" class="flex-container">
            <div id="img-container" >
                <!-- Images -->
            </div>
           <div class="flex-cloud-item" id="legend" >
                <table id="frequency">
                    <thead>
                        <tr>
                            <th>Word</th>
                            <th>Percentage</th>
                        </tr>
                    </thead>
                    <tbody>         
                        <!-- Data -->
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    `,
    activated() {
        let max_req = 250;
        //Hide empty legend
        $('#legend').hide();
        $('#img-container').hide();
        $('#wordcloud-container').hide();
        if (lastTweetsList) {
            $('#postbtn').show();
            $('#wordcloud-container').show();
            $('#img-container').show();
            $('#info').hide();
            if ($('#wc-loading').length > 0) {
                $('#wc-loading').remove();
            }
            //Generate wc and legend
            this.getWordCloud(max_req);
            this.getLegend(max_req);
        } else {
            //Hide post button
            $('#postbtn').hide();
            //No collection avaiable means instruction message displayed 
            $('#info').show();
        }
    },
    methods: {
        getWordCloud(max_req) {
            //Previous wc removed
            if ($('#wc-img').length > 0) {
                $('#wc-img').remove();
            }
            $('#img-container ').prepend('<div id="wc-loading"><span class="helper"></span><img aria-hidden="true" src="static/img/wc_loading.gif"></div>');

            // request to get PIL image and display it
            imageRequest('/wordcloud/' + max_req, JSON.stringify(lastTweetsList)).then( 
                (url) => {
                    $('#wc-loading').remove();
                    $('#img-container').prepend(`<img id="wc-img" src="${url}" alt="Word cloud delle parole più frequenti nei tweet">`);
                });
        },
        getLegend(max_req) {
            $('#frequency tbody').empty();
            $('#legend').show();
            $.ajax({
                url: '/frequency/' + max_req,
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(lastTweetsList),
                success: (data) => {
                    var sortable = [];
                    for (var el in data) {
                        sortable.push([el, data[el]]);
                    }

                    sortable.sort(function (a, b) {
                        return b[1] - a[1];
                    });

                    sortable.forEach((e) => {
                        $('#frequency tbody').append(`
                              <tr>
                                <td>${e[0]}</td> 
                                <td>${(Number(e[1]) * 100).toFixed(2)}%</td> 
                             </tr>
                            `);
                    });
                },
                error: (xhr, ajaxOptions, thrownError) => {
                    console.log("search: " + xhr.status + ' - ' + thrownError);
                }
            });
        },
        createModal(){
            addWordcloudPostPreview($('#imgPreview'));
            $("#postBtn").off();
            $("#postBtn").on("click",()=>post('wc'));
            $('#postModal').modal('show');
        }
    }

}