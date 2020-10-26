from flask import Flask
from flask import send_file, redirect, request, Response
import tweepy
import datetime, time
import json

# Twitter keys
API_KEY = 'j6DEP35tCTAxgmoaCYMQAThHw'
API_SECRET_KEY = 'IStBpbpGzInMyzxAtlg6ZRLpJWZu5hS0SUAm6RB8YdmlNLz9OD'
ACCESS_TOKEN = '1315934369433956354-KSJwtOBr3B9deMyqlF2pkNBU3sTmnk'
ACCESS_SECRET_TOKEN = 'qLaGNPiYvJX0RgWeqvdx9iDe5lwDQRRAe5OruhGLtHkq1'

# Initialize tweepy
auth = tweepy.OAuthHandler(API_KEY, API_SECRET_KEY)
auth.set_access_token(ACCESS_TOKEN, ACCESS_SECRET_TOKEN)
api = tweepy.API(auth)

# Initialize flask
application = Flask(__name__)

# def get_tweets(api, username):
#     deadend = False
#     lista = {'tweets':[]}
#     tweets = api.user_timeline(username)
#     for tweet in tweets:
#         lista['tweets'].append({'testo':tweet.text,'user':tweet.user.name,'data':tweet.created_at.strftime('%m/%d/%Y')})
#         
# 
#     string = json.dumps(lista, ensure_ascii=False, indent=2, sort_keys=True)
#     return string
# 
#    
# @application.route('/getTweets')
# def sendData():
#     return get_tweets(api,'SpaceX')

#Stream tweets
class MyStreamListener(tweepy.StreamListener):
    def on_connect(self):
        print("Connected to the server!")
    
    def on_status(self, status):
        text = ""
        if hasattr(status, "retweeted_status"): # Check if Retweet
            try:
                text = status.retweeted_status.extended_tweet["full_text"]
            except AttributeError:
                text = status.retweeted_status.text
        else:
            try:
                text = status.extended_tweet["full_text"]
            except AttributeError:
                text = status.text
        
        streaming_data.append({'text': text, 'user':status.user.name,'data':status.created_at.strftime('%m/%d/%Y')})

    def on_error(self, status):
        print('Streaming Error Status Code - ' + status)

myStreamListener = MyStreamListener()
myStream = None
streaming_data = []

# Disconnect current stream if there is one
def stopStreamListener():
    if(myStream != None): 
        myStream.disconnect()
        streaming_data.clear()
    
# Function to starm StreamListener
def startStreamListener(keyword):
    global myStreamListener
    global myStream
    
    # Disconnect existing stream
    stopStreamListener()
    
    # Create a new stream with the specified 
    myStream = tweepy.Stream(auth = api.auth, listener=myStreamListener, tweet_mode = 'extended')
    myStream.filter(track=[keyword], is_async=True)

# Route to start stream
@application.route('/streamStart')
def streamStart():
    word = request.args.get("word")
    if not word:
        return Response(status = 400)
    
    startStreamListener(word)
    
    return Response(status = 200)
    
# Route to stop stream
@application.route('/streamStop')
def streamStop():
    stopStreamListener()
    return Response(status = 200)

# Route to get tweets from the stream
@application.route('/streamUpdate')
def streamUpdate():
    return Response(json.dumps(streaming_data, ensure_ascii=False, indent=2), status=200, mimetype="application/json")
    
#Search tweets
def get_tweet_text(tweet):
    try:
       text = tweet.retweeted_status.full_text
    except AttributeError:  # Not a Retweet
       text = tweet.full_text
    
    return text
                
@application.route('/search')
def search():
    word = request.args.get("word")
    if not word:
        return Response(status = 400)
    
    list = []
    for tweet in api.search(q=word, tweet_mode="extended"):
        list.append({'id': tweet.id_str, 'text': get_tweet_text(tweet), 'user':tweet.user.name, 'username': tweet.user.screen_name,'data':tweet.created_at.strftime('%m/%d/%Y')})
    
    return Response(json.dumps(list, ensure_ascii=False, indent=2), status=200, mimetype="application/json")
   
   
@application.route('/geo')
def geo():
    word = request.args.get("word")
    location = request.args.get("location")
    list = []
    
    for tweet in tweepy.Cursor(api.search,q=word,count=1000,geocode=location).items(1000):
        #verifico se la geo-localizzazione è abilitata e se esiste l'oggetto che contiene informazioni
        if(tweet.user.geo_enabled is not False and tweet.place is not None):
            list.append({'id': tweet.id_str, 'text': tweet.text, 'user':tweet.user.name, 'username': tweet.user.screen_name,'data':tweet.created_at.strftime('%m/%d/%Y'),'geo_enabled':tweet.user.geo_enabled,'city':tweet.place.full_name,'coordinates':tweet.place.bounding_box.coordinates})
    
    return Response(json.dumps(list, ensure_ascii=False, indent=2), status=200, mimetype="application/json")
    

# Route for the index page
@application.route('/')
def getPage():
    return send_file("index.html")

    
if __name__ == "__main__":
    application.run()
    stopStreamListener()

