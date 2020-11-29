import { lastTweetsList } from './comp_tweets.js'

export default {
	name: 'word_cloud',
    template: `
        <div>
	      <h3>Wordcloud of most common words in the results</h3>
            <div id="containing">
              <table id="frequency">
                <thead>
                  <th>Word</th>
                  <th>Percentage</th>
                </thead>
                <tbody>
                
                </tbody>
               </table>
             </div>
          <div id="wordcloud"></div>
        </div>
    `,
    activated() {
        let max_req = 250;
        if (lastTweetsList) {
            $('#wordcloud').empty();
            $('#wordcloud').append('<img id="cloud_loading" src="static/img/wc_loading.gif"></img>');
            this.getWordCloud(max_req);
            this.getLegend(max_req);
        } else {
            if (!$('#wordcloud h4').length > 0) {
                $('#wordcloud').append('<h4>Search for tweets or just load a collection to see the relative wordcloud</h4>');
            }
            $('#containing').css('display', 'none');
        }
    },
    methods: {
        getWordCloud(max_req) {
            let xhr = new XMLHttpRequest();
            xhr.responseType = 'arraybuffer';
            xhr.onload = () => {
                $('#wordcloud').empty();
                var blb = new Blob([xhr.response], { type: 'image/png' });
                var url = (window.URL || window.webkitURL).createObjectURL(blb);
                $('#wordcloud').append(`<img id="wc-img" src="${url}">`);
            }

            xhr.onerror = () => console.log("Failed loading wordcloud");

            xhr.open('POST', '/wordcloud/' + max_req);
            xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            xhr.send(JSON.stringify(lastTweetsList));
        },
        getLegend(max_req) {
            $('#frequency tbody').empty();
            $('#containing').css('display', 'inline-block');
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
        }
    }

}