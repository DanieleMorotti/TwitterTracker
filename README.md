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

#### Risultati:
Questo modulo è preposto alla visualizzazione dei risultati a cascata sotto forma di tweet. Vengono visualizzati un massimo di 100 tweet a ricerca, per i risultati di stream invece non ci sono limiti di visualizzazione.
E' possibile espandere i tweet in forma *embedded* nei risultati mediante il pulsante show, vengono inoltre visualizzate delle etichette contenenti i filtri applicati alla ricerca che è possibile rimuovere per, eventualmente, ripetere la ricerca con meno parametri. Si può inoltre salvare i risultati della ricerca in forma di collezione che sarà possibile rinominare o eliminare dalla sezione **Collezioni**.

#### Mappa: 
E' una sezione interamente dedicata alla visualizzazione su mappa dei tweet geolocalizzati apparsi fra i risultati, nel caso in cui uno o più tweet sulla mappa contengano uno o più media, al posto dell'icona di base, verrà visualizzato il primo dei media in questione.

#### Word Cloud: 
_**W.I.P.**_

#### Visualizzazione grafica:
_**W.I.P.**_

#### Collezioni:
In questo modulo è possibile visualizzare, rinominare o rimuovere intere collezioni di tweet ottenute come risultato di una ricerca fatta precedentemente. Nel caso in cui si decida di visualizzare la collezione, verranno visualizzati anche i filtri applicati alla ricerca.
La ricerca viene effettuata tramite una parola chiave da inserire nell'apposito campo di testo. 
E' inoltre possibile inserire delle coordinate geografiche in gradi decimali e il raggio dell'area geografica all'interno della quale si vogliono cercare i tweet. I parametri devono essere separati da una virgola e il raggio di ricerca deve essere specificato in kilometri apponendo la sigla 'km' (e.g. Ricerca in 10km di raggio dal centro di Bologna : *[44.5075, 11.3514, 10km]*)
Lo stream viene effettuato tramite la sola parola chiave da cercare e viene fatto partire dal pulsante 'start'. Per terminare lo stream occorre cliccare sul tasto 'stop' o semplicemente iniziare una nuova ricerca o stream. 

Fraydrum utilizza i servizi di Web Hosting di AWS ed è disponibile al link http://fraydrum.tk/

## Librerie
Di seguito riportate le funzionalità back-end con la relativa libreria usata per 
implementarla:

Twitter API - tweepy: https://www.tweepy.org/

Server-Side Routing - flask: https://flask.palletsprojects.com/en/1.1.x/
