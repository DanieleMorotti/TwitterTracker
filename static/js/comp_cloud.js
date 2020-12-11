import { lastTweetsList } from './comp_tweets.js'
import {addWordcloudPostPreview,post } from './autopost.js'

export default {
	name: 'word_cloud',
    template: `
    <div>
        <h3>Wordcloud of most common words in the results</h3>
        <div id="info">Search for tweets or just load a collection to see the relative wordcloud</div>
        <div id="wordcloud-container">
            <div id="img-container">
                <button @click="createModal" id="postbtn">POSTA</button>
            </div>
            <div class="flex-cloud-item" id="legend">
                <table id="frequency">
                    <thead>
                        <th>Word</th>
                        <th>Percentage</th>
                    </thead>
                    <tbody>         
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
        if (lastTweetsList) {
            $('#postbtn').show();
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
            $('#img-container ').prepend('<div id="wc-loading"><img src="static/img/wc_loading.gif"></div>');

            //XHR request to get PIL image and display it
            let xhr = new XMLHttpRequest();
            xhr.responseType = 'arraybuffer';

            xhr.onload = () => {
                var blb = new Blob([xhr.response], { type: 'image/png' });
                var url = (window.URL || window.webkitURL).createObjectURL(blb);
                $('#wc-loading').remove();
                $('#img-container').prepend(`<img id="wc-img" src="${url}">`);
            }

            xhr.onerror = () => console.log("Failed loading wordcloud");

            xhr.open('POST', '/wordcloud/' + max_req);
            xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
            xhr.send(JSON.stringify(lastTweetsList));
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