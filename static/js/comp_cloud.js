import { lastTweetsList } from './comp_tweets.js'

export default {
	name: 'word_cloud',
    template: `
        <div>
	      <h3>Wordcloud of most common words in the results</h3>
          <div id="wordcloud"></div>
        </div>
    `,
    activated() {
        let max_req = 500;
        if (lastTweetsList) {
            $('#wordcloud').empty();
            $('#wordcloud').append('<img id="cloud_loading" src="static/img/wc_loading.gif"></img>');
            $.ajax({
                url: '/wordcloud/' + max_req,
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(lastTweetsList),
                success: (data) => {
                    $('#wordcloud').empty();
                    $('#wordcloud').append('<img id="wc-img" src="static/pil/wordcloud.png?nocache=' + data + '"></img>');
                },
                error: (xhr, ajaxOptions, thrownError) => {
                    console.log("search: " + xhr.status + ' - ' + thrownError);
                }
            });
        } else {
            $('#wordcloud').append('<h4>Search for tweets or just load a collection to see the relative wordcloud</h4>');
        }
    }

}