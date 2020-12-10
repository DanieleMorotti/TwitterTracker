import { lastTweetsList } from './comp_tweets.js'
import {addWordcloudPostPreview,post } from './autopost.js'

export default {
	name: 'word_cloud',
    template: `
        <div>
	      <h3>Wordcloud of most common words in the results</h3>
            
          <div id="wordcloud-container">
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
          <button @click="createModal">POSTA</button>
        </div>
    `,
    activated() {
        let max_req = 250; 
        if (lastTweetsList) {
            //Instruction message get deleted
            if ($('#wordcloud-container h4').length > 0) {
                $('#wordcloud-container h4').remove();
            }
            if ($('#wc-loading').length > 0) {
                $('#wc-loading').remove();
            }
            //Generate wc and legend
            this.getWordCloud(max_req);
            this.getLegend(max_req);
        } else {
            //No collection avaiable means instruction message displayed 
            if (!$('#wordcloud-container h4').length > 0) {
                $('#wordcloud-container').append('<h4>Search for tweets or just load a collection to see the relative wordcloud</h4>');
            }
            //Hide empty legend
            $('#legend').hide();
            //Hide share button
            $('#worcloud-container button').hide();
        }
    },
    methods: {
        getWordCloud(max_req) {
            //XHR request to get PIL image and display it
            let xhr = new XMLHttpRequest();
            xhr.responseType = 'arraybuffer';
            //Previous wc removed
            if ($('#wc-img').length > 0) {
                $('#wc-img').remove();
            }
            $('<img id="wc-loading" src="static/img/wc_loading.gif">').insertBefore('#legend');
            xhr.onload = () => {
                var blb = new Blob([xhr.response], { type: 'image/png' });
                var url = (window.URL || window.webkitURL).createObjectURL(blb);
                $('#wc-loading').remove();
                $(`<img id="wc-img" src="${url}">`).insertBefore('#legend');
            }

            xhr.onerror = () => console.log("Failed loading wordcloud");

            xhr.open('POST', '/wordcloud/' + max_req);
            xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
            xhr.send(JSON.stringify(lastTweetsList));
        },
        getLegend(max_req) {
            $('#frequency tbody').empty();
            $('#legend').show();
            $('#worcloud-container button').show();
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

                    sortable.forEach((el) => {
                        $('#frequency tbody').append(`
                              <tr>
                                <td>${el[0]}</td> 
                                <td>${(Number(el[1]) * 100).toFixed(2)}%</td> 
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