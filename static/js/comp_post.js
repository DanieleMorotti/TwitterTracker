import { lastTweetsList } from './comp_tweets.js'
import {addWordcloudPostPreview,autopostWordcloud} from './autopost.js'

export default {
	name: 'post',

	data() {
        return{
            actPost:[]
        }
	},
	
	template: ` 
	<div id="component">
		<h2> Active Publications </h2>
		<div id="postMenu">
			<ul id="postList" v-if="actPost.length != 0">
				<li v-for="post in actPost" >
					{{post.name}}-{{post.date}}-{{post.type}} <i class="fas fa-minus-square" @click="removePost(post.id)"></i>
				</li>
			</ul>
			<span v-else>Nessun post automatico attivo</span>
		</div>
	</div>
	`,

	methods: {
		removePost(id){
			//to make the change immediatly visible to the user
			let toDel = this.actPost.findIndex(post => post.id === id);
			this.actPost.splice(toDel,1);
			$.ajax({
				method: "DELETE",
				url: "/removePost" + id,
				success: () => {
					console.log("Cancellato post automatico con id:",id);
				},
		
				error: (xhr, ajaxOptions, thrownError) => {
					console.log("deleteCollections: " + xhr.status + ' - ' + thrownError);
				}
			})
		}
	},
	activated() {
		$.ajax({
			method: "GET",
			url: "/getActivePost",
			success: (data) => {
				if(data.length != 0) this.actPost = data.slice();
			},
			error: (xhr, ajaxOptions, thrownError) => {
				console.log("Get active post: " + xhr.status + ' - ' + thrownError);
			}
		})
	}
}