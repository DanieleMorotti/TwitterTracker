
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
		<div id="info">Zero active publications</div>
		<div id="postMenu" v-if="actPost.length != 0">
				<div class="postList" v-for="post in actPost">
					<button id="delPub" @click="removePost(post.id)"><i class="fas fa-trash"></i></button>
					<h5> TITOLO: {{post.name}} </h5>
					<h5> PRIMA PUBBLICAZIONE: {{post.date}} </h5>
					<h5> TIPOLOGIA: {{post.type}} </h5>
				</div>
		</div>
	</div>

	`,

	methods: {
		removePost(id){

			$.ajax({
				method: "DELETE",
				url: "/removePost/" + id,
				success: () => {
					console.log("Cancellato post automatico con id: ",id);
					//If the request worked delete from the list of the user
					let toDel = this.actPost.findIndex(post => post.id === id);
					this.actPost.splice(toDel,1);
				},
		
				error: (xhr, ajaxOptions, thrownError) => {
					console.log("Remove automatic post: " + xhr.status + ' - ' + thrownError);
				}
			})
		}
	},
	activated() {
		$.ajax({
			method: "GET",
			url: "/getActivePost",
			success: (data) => {
				if(data.length != 0) {
					$("#info").hide();
					this.actPost = data.slice();
				}
				else $("#info").show();
			},
			error: (xhr, ajaxOptions, thrownError) => {
				console.log("Get active post: " + xhr.status + ' - ' + thrownError);
			}
		})
	}
}