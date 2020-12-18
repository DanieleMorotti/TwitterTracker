
export default {
	name: 'post',

	data() {
        return{
            actPost:[]
        }
	},
	
	template: ` 
	<div id="component">
		<div id="info">
			<img src="/static/img/noshare.png" alt="icona no pubblicazioni attive">
			<p>No active publication yet.<br>
			Do a search or load a collection to share your results.</p>
		</div>
		<div id="postMenu" v-if="actPost.length != 0">
			<div class="postList" v-for="post in actPost">
				<button type="button" id="delPub" data-toggle="modal" data-target="#deletePModal" @click="removePost(post.id)"><i class="fas fa-trash"></i></button>
				<h5> TITLE: {{post.name}} </h5>
				<h5> FIRST PUBLICATION: {{post.date}} </h5>
				<h5> POST TYPE: {{post.type}} </h5>
			</div>
		</div>

		<!-- modal for deleting collections -->
        <div class="modal fade" id="deletePModal" tabindex="-1" role="dialog" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered" role="document">
                <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                </div>
                <div class="modal-body">Are you sure to delete this publication? </div>
                <div class="modal-footer"> 
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
                    <button id="deletePostBtn" type="button" class="btn btn-primary" data-dismiss="modal">Delete</button>
                </div>
                </div>
            </div>
        </div>

	</div>

	`,

	methods: {
		removePost(id){
			$("#deletePostBtn").off();
			$("#deletePostBtn").on("click", () => {
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
				});
			});
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