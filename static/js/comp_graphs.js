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
		<div id="alert">No research was done</div>
		<div id="firstGraph">
			<div id="container1"> </div>
			<div id="info1">Temporal arrangement of the tweets found </div>
		</div>
		<div id="secondGraph">
			<div id="container2"> </div>
			<div id="info2">Most used words in tweets found (in %) </div>
		</div>
		<div id="histo"></div>
		<div id="histo2"></div>
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
			
			// style
			series.fill("#004085");
			chart.background().fill("#011219");
			var labelsx = chart.xAxis().labels();
			var labelsy = chart.yAxis().labels();
			labelsx.fontColor("white");
			labelsy.fontColor("white");
			labelsx.rotation(320);
			chart.xAxis().title(' Dates ');
			chart.yAxis().title('Number of tweets found');
			chart.xAxis().title().padding(5);
			chart.yAxis().title().padding(5);
			//semplificazione della grafica
			//var titlexBack = chart.xAxis().title().background();
			//var titleyBack = chart.yAxis().title().background();
			//titlexBack.enabled(true);
			//titlexBack.fill("transparent");
			//titlexBack.cornerType("round");
			//titlexBack.corners(10);
			//titlexBack.stroke("#004085");
			//titleyBack.enabled(false);
			//titleyBack.fill("#fff");
			//titleyBack.cornerType("round");
			//titleyBack.corners(10);
			//titleyBack.stroke("#004085");


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
					
					// style
					series.fill("#004085");
					chart.background().fill("#011219"); //#5C99E2
					var labelsx = chart.xAxis().labels();
					var labelsy = chart.yAxis().labels();
					labelsx.fontColor("white");
					labelsy.fontColor("white");

					labelsx.rotation(320);
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

					// set the container id
					chart.container("container2");	
					chart.draw();
                },
                error: (xhr, ajaxOptions, thrownError) => {
                    console.log("search: " + xhr.status + ' - ' + thrownError);
                }
            });
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

		/*TODO:Funzione per testare le immagini degli istogrammi create dal server(se volete eliminatela)
		(function try(){
			let max_req = 10;
			let obj = {tweets:lastTweetsList,req_count:max_req,kind:'histogram_week'};

			let xhr = new XMLHttpRequest();
			xhr.responseType = 'arraybuffer';
			xhr.onload = () => {
				$('#histo').empty();
				var blb = new Blob([xhr.response], { type: 'image/png' });
				var url = (window.URL || window.webkitURL).createObjectURL(blb);
				$('#histo').append(`<img id="wc-img1" src="${url}">`);

				//appena ho terminato faccio questa se no il server va giù
				let xhr1 = new XMLHttpRequest();
				obj['kind']="histogram_perc";
				xhr1.responseType = 'arraybuffer';
				xhr1.onload = () => {
					$('#histo2').empty();
					var blb = new Blob([xhr1.response], { type: 'image/png' });
					var url = (window.URL || window.webkitURL).createObjectURL(blb);
					$('#histo2').append(`<img id="wc-img2" src="${url}">`);
				}
				xhr1.onerror = () => console.log("Failed loading wordcloud");
				xhr1.open('POST', '/postPreview');
				xhr1.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
				xhr1.send(JSON.stringify(obj));
			}

			xhr.onerror = () => console.log("Failed loading wordcloud");
			xhr.open('POST', '/postPreview');
			xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
			xhr.send(JSON.stringify(obj));
			setTimeout(()=>{console.log("sto aspettando")},5000);

			
		})();*/
	}
}