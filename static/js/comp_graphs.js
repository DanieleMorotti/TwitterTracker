import { lastTweetsList } from './comp_tweets.js'

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
		<div id="firstGraph">
			<div id="alert">No research was done </div>
			<div id="container1"> </div>
			<div id="info1">Temporal arrangement of the tweets found </div>
		</div>
		<div id="secondGraph">
			<div id="container2"> </div>
			<div id="info2">Most used words in tweets found </div>
		</div>
	</div>
	`,

	methods: {
		//Istogramma che rappresenta il numero di tweet postati per ogni giorno dell'ultima settimana
		createGraph1() {
			
		//create data
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
		
		// set the container id
		chart.container("container1");
		
		// initiate drawing the chart
		chart.draw();
		},

		//Istogramma che riporta le parole più utilizzate nei tweet trovati
		createGraph2() {

			//create data
			var dati = [];
			let max_req = 10;
			$.ajax({
                url: '/frequency/' + max_req,
				type: 'POST',
				contentType: 'application/json',
				data: JSON.stringify(lastTweetsList),
                success: (data) => {
                    console.log(data);
                },
                error: (xhr, ajaxOptions, thrownError) => {
                    console.log("search: " + xhr.status + ' - ' + thrownError);
                }
            });

			// // create a chart
			// var chart = anychart.column();
			
			// // create a column series and set the data
			// var series = chart.column(dati);
			
			// // set the container id
			// chart.container("container2");
			
			// // initiate drawing the chart
			// chart.draw();
			}
	},

	activated() {
		if (lastTweetsList != null) {
			$('#info1').show();
			$('#info2').show();
			$('#alert').hide();
			$('#container1').empty();
			$('#container2').empty();
			this.createGraph1();
			this.createGraph2();
		}
		else {
			$('#info1').hide();
			$('#info2').hide();
			$('#alert').show();
		}
	}
}