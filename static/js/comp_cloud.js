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
        let max_req = 100;
        if (lastTweetsList) {
            console.log(lastTweetsList)
            $.ajax({
                url: '/wordcloud/' + max_req,
                type: 'POST',
                contentType:'application/json',
                data: JSON.stringify(lastTweetsList),
                success: (data) => {
                    $('#wordcloud img').remove();
                    $('#wordcloud').append('<img src="static/pil/wordcloud.png"></img>');
                },
                error: (xhr, ajaxOptions, thrownError) => {
                    console.log("search: " + xhr.status + ' - ' + thrownError);
                }
            });
        }
    }

}