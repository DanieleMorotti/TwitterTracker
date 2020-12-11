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
			<div id="info1">Temporal arrangement of the tweets found </div>
			<button @click="createModal('histogram_week')" id="pbtn">POSTA</button>
		</div>
		<div id="secondGraph">
			<div id="container2"> </div>
			<div id="info2">Most used words in tweets found (in %) </div>
			<button @click="createModal('histogram_perc')" id="pbtn2">POSTA</button>
		</div>
	</div>
	`,

	methods: {
		//Istogramma che rappresenta il numero di tweet postati per ogni giorno dell'ultima settimana
		createGraph1() {
			
			var dati = [];
			for (let i = 0; i < lastTweetsList.length; i++) {  //calcola un tweet in meno tranne nella prima data
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
				i = j;
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
			series.fill("#004085");
			chart.background().fill("#011219");
			var labelsx = chart.xAxis().labels();
			var labelsy = chart.yAxis().labels();
			labelsx.fontColor("#ffffff");
			labelsy.fontColor("#ffffff");
			labelsx.rotation(320);
			chart.xAxis().title(' Dates ');
			chart.yAxis().title('Number of tweets found');
			chart.xAxis().title().padding(5);
			chart.yAxis().title().padding(5);

			/*var titlexBack = chart.xAxis().title();
			var titleyBack = chart.yAxis().title();
			titlexBack.fontColor("/*");
			titlexBack.fontWeight("bold");
			titleyBack.fontColor("/*");
			titleyBack.fontWeight("bold");*/


			/*
			semplificazione della grafica
			titlexBack.enabled(true);
			titlexBack.fill("transparent");
			titlexBack.cornerType("round");
			titlexBack.corners(10);
			titlexBack.stroke("#004085");
			titleyBack.enabled(false);
			titleyBack.fill("#fff");
			titleyBack.cornerType("round");
			titleyBack.corners(10);
			titleyBack.stroke("#004085");
			*/

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
					series.fill("#004085");
					chart.background().fill("#011219"); //#5C99E2
					var labelsx = chart.xAxis().labels();
					var labelsy = chart.yAxis().labels();
					labelsx.fontColor("white");
					labelsy.fontColor("white");

					labelsx.rotation(70);
					labelsx.wordBreak("break-all");
					labelsx.width(100);
					chart.xAxis().title('Most used words');
					chart.yAxis().title('% of occurrences of words');
					chart.xAxis().title().padding(5);
					chart.yAxis().title().padding(5);
					//var titlexBack = chart.xAxis().title().background();
					//var titleyBack = chart.yAxis().title().background();
					//titlexBack.enabled(true);
					//titlexBack.fill("#fff");
					//titlexBack.cornerType("round");
					//titlexBack.corners(10);
					//titlexBack.stroke("#004085");
					//titleyBack.enabled(true);
					//titleyBack.fill("#fff");
					//titleyBack.cornerType("round");
					//titleyBack.corners(10);
					//titleyBack.stroke("#004085");

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