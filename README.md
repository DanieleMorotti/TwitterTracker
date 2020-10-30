# Fraydrum

Fraydrum è un Twitter tracker utile alla collezione di tweet già esistenti e alla visualizzazione in tempo reale dei tweet secondo determinati parametri.

## Interfaccia grafica
La GUI si articola in due moduli distinti:

Il primo modulo, quello nella parte superiore dell'applicazione è costituito da due tab alternative, una dedicata ai filtri per la ricerca e l'altra a quelli per lo stream. 
La ricerca viene effettuata tramite una parola chiave da inserire nell'apposito campo di testo. 
E' inoltre possibile inserire delle coordinate geografiche in gradi decimali e il raggio dell'area geografica all'interno della quale si vogliono cercare i tweet. I parametri devono essere separati da una virgola e il raggio di ricerca deve essere specificato in kilometri apponendo la sigla 'km' (e.g. Ricerca in 10km di raggio dal centro di Bologna : *[44.5075, 11.3514, 10km]*)
Lo stream viene effettuato tramite la sola parola chiave da cercare e viene fatto partire dal pulsante 'start'. Per terminare lo stream occorre cliccare sul tasto 'stop' o semplicemente iniziare una nuova ricerca o stream. 

Sia durante lo streaming che durante la ricerca i tweet attinenti ai filtri vengono visualizzati nella porzione più in basso dell'applicazione come preview che è possibile espandere tramite il bottone 'show' nei quali viene evidenziata in giallo la corrispondenza con la parola ricercata. 
In caso di Ricerca vengono visualizzati un massimo di 100 risultati, in caso di Stream vengono visualizzati in tempo reale tutti i tweet contenenti la parola ricercata.

Fraydrum utilizza i servizi di Web Hosting di AWS ed è disponibile al link http://fraydrum.tk/

## Librerie
Di seguito riportate le funzionalità back-end con la relativa libreria usata per implementarla:

Twitter API - tweepy: https://www.tweepy.org/

Server-Side python - flask: https://flask.palletsprojects.com/en/1.1.x/
