import { lastTweetsList } from './comp_tweets.js'
import {addHistogramsPostPreview,post} from './autopost.js'
export default {
	name: 'graphs',

	data() {
        return{
            value: 100
        }
	},
	
	template: ` 
	<div id="total">
		<h2> Graphs </h2>
		<div id="alert">No research was done</div>
		<div id="firstGraph">
			<div id="container1"> </div>
			<div class="didascalia">
				<h5 id="info1"> Temporal arrangement of the tweets found </h5>
				<button @click="createModal('histogram_week')" id="pbtn" class="share-bttns">
					SHARE <i class="fas fa-share-alt"></i>
				</button> 
			</div>
			
		</div>
		<div id="secondGraph">
			<div id="container2"> </div>
			<div class="didascalia">
				<h5 id="info2">Most used words in tweets found (in %)</h5>
				<button @click="createModal('histogram_perc')" id="pbtn2" class="share-bttns">
					SHARE <i class="fas fa-share-alt"></i>
				</button>
			</div>
		</div>
	</div>
	`,

	methods: {
		//Istogramma che rappresenta il numero di tweet postati per ogni giorno dell'ultima settimana
		createGraph1() {
			
			var dati = [];
			//Iterate over tweets
			for (let i = 0; i < lastTweetsList.length; i++) {  //calcola un tweet in meno tranne nella prima data
				//Counting occurence for the first date
				var data = lastTweetsList[i].data;
				var cont = 1;
				for (var j = i+1; j < lastTweetsList.length; j++) {
					if (lastTweetsList[j].data == data) {
						cont++;
					}
					else {
						break;
					}
				}
				i = j-1;
				dati.push( [data, cont] );
			}

			// create a chart
			var chart = anychart.column();
			
			// create a column series and set the data
			var series = chart.column(dati);

			// Tooltip
			var tooltip = chart.getSeries(0).tooltip();
			tooltip.title().text("Occurence");
			tooltip.format("{%y} found on {%x}");

			// style
			series.fill("#c98d26");
			series.stroke("#f7c672")
			chart.background().fill("#011219"); //colore di background del grafico
			var labelsx = chart.xAxis().labels();
			var labelsy = chart.yAxis().labels();

			labelsy.fontColor("white");
			labelsx.fontColor("white");
			labelsy.width(60);
			labelsx.rotation(320);

			chart.xAxis().title(' Dates ');
			chart.yAxis().title('Number of tweets found');
			chart.xAxis().title().padding(5);
			chart.yAxis().title().padding(5);

			var titlexBack = chart.xAxis().title();
			var titleyBack = chart.yAxis().title();
			titlexBack.fontColor("#9c9c9c"); 
			titlexBack.fontWeight("bold");
			titleyBack.fontColor("#9c9c9c");
			titleyBack.fontWeight("bold");

			// set the container id
			chart.container("container1");
			
			// initiate drawing the chart
			chart.draw();
		},

		//Istogramma che riporta le parole più utilizzate nei tweet trovati
		createGraph2() {

			//create data
			var dati = [];
			let max_req = 50;
			$.ajax({
                url: '/frequency/' + max_req,
				type: 'POST',
				contentType: 'application/json',
				data: JSON.stringify(lastTweetsList),
                success: (data) => {   
					var parola = Object.getOwnPropertyNames(data);
					let cont = [];
					parola.forEach(element => cont.push(data[element]));
					for(let i=0; i < max_req; i++) {
						cont[i] = cont[i] * 100;
						cont[i] = Math.round(cont[i]);
						dati.push( [parola[i], cont[i]] );
					}

					//created a set of data to sort the array
					var view = anychart.data.set(dati).mapAs();
					var sortedView = view.sort("value", "desc");
			
					// create a chart
					var chart = anychart.column();
					// create a column series and set the data
					var series = chart.column(sortedView);

					// Tooltip
					var tooltip = chart.getSeries(0).tooltip();
					tooltip.title().text("Percentage");
					tooltip.format('"{%x}" is the {%y}% of the total word count');


					// style
					series.fill("#c98d26"); //#fca26e"); //"#004085");
					series.stroke("#f7c672");
					chart.background().fill("#011219");
					var labelsx = chart.xAxis().labels();
					var labelsy = chart.yAxis().labels();

					labelsx.fontColor("white");
					labelsx.width(60);
					labelsx.rotation(320);
					labelsx.wordBreak("break-all");

					labelsy.fontColor("white");

					chart.xAxis().title('Most used words');
					chart.yAxis().title('% of occurrences of words');
					chart.yAxis().title().padding(5);

					var titlexBack = chart.xAxis().title();
					var titleyBack = chart.yAxis().title();
					titlexBack.fontColor("#9c9c9c");
					titlexBack.fontWeight("bold");
					titleyBack.fontColor("#9c9c9c");
					titleyBack.fontWeight("bold");
					
					// Scrollable
					chart.xScroller(true);
					// change the scroller orientation
					chart.xScroller().position("beforeAxes");
					// set the fill color
					chart.xScroller().fill('rgba(274,274,274,0.1)');
					// set the selected fill color
					chart.xScroller().selectedFill("rgba(274,274,274,0.5)");

					chart.xZoom().setToPointsCount(10, false);
					chart.xScroller().thumbs().autoHide(true);
					chart.xScroller().thumbs().hovered().fill("#004085");

					// set the container id
					chart.container("container2");	
					chart.draw();
                },
                error: (xhr, ajaxOptions, thrownError) => {
                    console.log("search: " + xhr.status + ' - ' + thrownError);
                }
            });
		},
		createModal(histoType){
			$("#imgPreview").empty();

			addHistogramsPostPreview($('#imgPreview'), histoType);

			$("#postBtn").off();
            $("#postBtn").on("click",()=>post(histoType));
			$('#postModal').modal('show');
		}
	},
	activated() {
		if (lastTweetsList != null) {
			$('#info1').show();
			$('#info2').show();
			$('#pbtn').show();
			$('#pbtn2').show();
			$('#alert').hide();
			$('#container1').empty();
			$('#container2').empty();
			this.createGraph1();
			this.createGraph2();
		}
		else {
			$('#info1').hide();
			$('#info2').hide();
			$('#pbtn').hide();
			$('#pbtn2').hide();
			$('#alert').show();
			$('#pbtn').hide();
			$('#pbtn2').hide();
		}

	}
}