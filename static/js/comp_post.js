import { lastTweetsList } from './comp_tweets.js'
import {addWordcloudPostPreview,autopostWordcloud} from './autopost.js'

export default {
	name: 'post',

	data() {
        return{
            autPost:[]
        }
	},
	
	template: ` 
	<div id="component">
		<h2> Post </h2>
		<div id="postMenu">
			<h3>Post automatici attivi</h3>
			<ul id="postList" v-if="autPost.length != 0">
				<li v-for="post in autPost">
					{{post.name}}-{{post.date}}-{{post.type}}
				</li>
			</ul>
			<span v-else>Nessun post automatico attivo</span>
		</div>
	</div>
	`,

	methods: {
		post(){

		}
	},
	activated() {
	}
}