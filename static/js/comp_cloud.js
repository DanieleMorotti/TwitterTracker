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
            $('#wordcloud').append('<img id="cloud_loading" src="static/img/wc_loading.gif">');

            let xhr = new XMLHttpRequest();
            xhr.responseType = 'arraybuffer';
            xhr.onload = () => {
                $('#wordcloud').empty();
                var blb = new Blob([xhr.response], {type: 'image/png'});
                var url = (window.URL || window.webkitURL).createObjectURL(blb);
                $('#wordcloud').append(`<img id="wc-img" src="${url}">`);
            }

            xhr.onerror = () => console.log("Failed loading wordcloud");

            xhr.open('POST', '/wordcloud/' + max_req);
            xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            xhr.send(JSON.stringify(lastTweetsList));
        } else {
            $('#wordcloud').append('<h4>Search for tweets or just load a collection to see the relative wordcloud</h4>');
        }
    }

}