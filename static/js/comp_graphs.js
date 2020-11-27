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
			<div id="container"> </div>
			<div id="info">Temporal arrangement of the tweets found </div>
		</div>
	</div>
	`,

	methods: {
		//Istogramma che rappresenta il numero di tweet postati per ogni giorno dell'ultima settimana
		createGraph() {

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
		chart.container("container");
		
		// initiate drawing the chart
		chart.draw();
		}
	},

	activated() {
		if (lastTweetsList != null) {
			$('#info').show();
			$('#alert').hide();
			$('#container').empty();
			this.createGraph();
		}
		else {
			$('#info').hide();
			$('#alert').show();
		}
	}
}