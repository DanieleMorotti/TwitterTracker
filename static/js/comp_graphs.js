//import tweetsComp from './comp_tweets.js'
import { lastTweetsList } from './comp_tweets.js'

export default { //Il file css associato è ancora vuoto
	name: 'graphs',

	data() {
        return{
            value: 100
        }
	},
	
	template: `
	<div id="container" style="width: 500px; height: 400px;"></div>
	`,

	methods: {
		//Istogramma che rappresenta il numero di tweet postati per ogni giorno dell'ultima settimana
		createGraph() { //se faccio nuova ricerca il grafico non cambia

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

	mounted() {
        this.createGraph();
    }
}