# Fraydrum

Fraydrum è un Twitter tracker utile alla collezione di tweet già esistenti e alla visualizzazione in tempo reale dei tweet secondo determinati parametri.

## Interfaccia grafica
L'applicazione è costituita da sei moduli accessibili attraverso la sidebar:

#### Ricerca: 
Attraverso questo modulo è possibile selezionare i filtri che si desiderano applicare alla ricerca o allo streaming di tweet. E' possibile selezionare:
* Una parola da ricercare all'interno dei tweet.
* Un utente di cui ricercare i tweet.
* Un punto d'interesse in cui ricercare i tweet.
* Un'area sulla mappa di google selezionando il bottone di disegno.
* Un'area da descrivere in termini di coordinate e raggio alternativa a quella descritta con la mappa.
* Un checkbox per visualizzare solo i tweet contenenti immagini.
* Un checkbox per visualizzare solo i tweet geolocalizzati.
Dopo aver compilato adeguatamente, secondo le proprie necessità, i campi appena descritti, è possibile avviare la ricerca per venire reindirizzati al modulo dei **Risultati**.

E' inoltre possibile decidere di selezionare un trend in modalità visualizzazione o streaming tramite la sezione dedicata

#### Risultati e Streaming:
Questo modulo è preposto alla visualizzazione dei risultati a cascata sotto forma di tweet. Vengono visualizzati un massimo di 500 tweet a ricerca, per i risultati di stream invece non ci sono limiti di visualizzazione.
E' possibile espandere i tweet in forma *embedded* nei risultati mediante il pulsante show, vengono inoltre visualizzate delle etichette contenenti i filtri applicati alla ricerca che è possibile rimuovere per, eventualmente, ripetere la ricerca con meno parametri o passare alla modalità streaming. Si può inoltre salvare i risultati della ricerca in forma di collezione che sarà possibile rinominare o eliminare dalla sezione dedicata sulla destra dello schermo.
E' inoltre possibile decidere di visualizzare solamente le immagini dei tweet - ove siano presenti - tramite il pulsante "*Visualizza immagini*".

#### Mappa: 
E' una sezione interamente dedicata alla visualizzazione su mappa dei tweet geolocalizzati apparsi fra i risultati, nel caso in cui uno o più tweet sulla mappa contengano uno o più media, al posto dell'icona di base, verrà visualizzato il primo dei media in questione.

#### Word Cloud: 
Da questa sezione è possibile visualizzare una wordcloud delle parole più comuni all'interno dei risultati della ricerca, assieme ad una legenda con le percentuali di frequenza di ogni parola.

#### Grafici:
Tramite questa sezione è possibile visualizzare dei grafici nei quali viene rappresentata la frequenza nel tempo dei risultati ottenuti da una ricerca e le parole che compaiono nei sopracitati risultati in termini di frequenza.

#### Post:
Da questa sezione è possibile gestire con comodità i post automatici precedentemente impostati. Per creare un post automatico è sufficiente cliccare sul pulsante **SHARE** in corrispondenza di ciò che si vuole postare. Il pulsante **SHARE** è disponibile per: **Mappa**, **Grafici** e **Word Cloud**.

Fraydrum utilizza i servizi di Web Hosting di AWS ed è disponibile al link http://fraydrum.ml/

## Librerie
Di seguito riportate le funzionalità back-end con la relativa libreria usata per 
implementarla:

Twitter API - tweepy: https://www.tweepy.org/

Server-Side Routing - flask: https://flask.palletsprojects.com/en/1.1.x/

## Test

#### Python

I test per le funzionalità server side sono in `tests/python`.
Per eseguire i test e generare le informazioni di code coverage occorre installare pytest e coverage:

```
pip install pytest coverage
```

Per eseguire i test e generare il report di code coverage per SonarQube eseguire i comandi:

```
coverage run -m pytest tests/python
coverage xml -i -o coverage/python/coverage.xml
```

Il report è generato nel file ```coverage/python/coverage.xml```

#### Javascript

I test per le funzionalità client side sono in `tests/js`.
Per eseguire i test e generare le informazioni di code coverage occorre installare i pacchetti necessari con npm:
```
npm install
```

Per eseguire i test e generare il report di code coverage per SonarQube eseguire il comando:
```
npm run test
```

Il report è generato nel file ```coverage/js/lconv.info```