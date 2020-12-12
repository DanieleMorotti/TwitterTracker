
export default {
	name: 'post',

	data() {
        return{
            actPost:[]
        }
	},
	
	template: ` 
	<div id="component">
		<h2> Pubblicazioni attive </h2>
		<div id="info">Nessuna pubblicazione attiva</div>
		<div id="postMenu" v-if="actPost.length != 0">
				<div class="postList" v-for="post in actPost">
					<button type="button" id="delPub" data-toggle="modal" data-target="#deletePModal"><i class="fas fa-trash"></i></button>
					<h5> TITOLO: {{post.name}} </h5>
					<h5> PRIMA PUBBLICAZIONE: {{post.date}} </h5>
					<h5> TIPOLOGIA: {{post.type}} </h5>
				</div>
		</div>

		<!-- modal for deleting collections -->
        <div class="modal fade" id="deletePModal" tabindex="-1" role="dialog" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered" role="document">
                <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                </div>
                <div class="modal-body">Sei sicuro di voler eliminare questa pubblicazione? </div>
                <div class="modal-footer"> 
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Annulla</button>
                    <button id="deleteBtn" @click="removePost(post.id) "type="button" class="btn btn-primary" data-dismiss="modal">Conferma</button>
                </div>
                </div>
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