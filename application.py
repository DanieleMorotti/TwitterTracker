from flask import Flask
from flask import send_file, redirect
import tweepy
import datetime, time
import json

API_KEY = 'j6DEP35tCTAxgmoaCYMQAThHw'
API_SECRET_KEY = 'IStBpbpGzInMyzxAtlg6ZRLpJWZu5hS0SUAm6RB8YdmlNLz9OD'
ACCESS_TOKEN = '1315934369433956354-KSJwtOBr3B9deMyqlF2pkNBU3sTmnk'
ACCESS_SECRET_TOKEN = 'qLaGNPiYvJX0RgWeqvdx9iDe5lwDQRRAe5OruhGLtHkq1'

auth = tweepy.OAuthHandler(API_KEY, API_SECRET_KEY)
auth.set_access_token(ACCESS_TOKEN, ACCESS_SECRET_TOKEN)
api = tweepy.API(auth)

application = Flask(__name__)

def get_tweets(api, username):
    deadend = False
    lista = {'tweets':[]}
    tweets = api.user_timeline(username)
    for tweet in tweets:
        lista['tweets'].append({'testo':tweet.text,'user':tweet.user.name,'data':tweet.created_at.strftime('%m/%d/%Y')})
        
    return json.dumps(lista,indent=2, sort_keys=True)
# Get tweets by keyword
#override tweepy.StreamListener to add logic to on_status

streaming_data = []

class MyStreamListener(tweepy.StreamListener):
    def on_connect(self):
        print("Connected to the server!")
    
    def on_status(self, status):
        text = "";
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
        
        streaming_data.append(text)

    def on_error(self, status):
        print('Streaming Error Status Code - ' + status)

myStreamListener = MyStreamListener()
# Function to starm StreamListener
def get_keyword_stream(keyword):
    global myStreamListener
    myStream = tweepy.Stream(auth = api.auth, listener=myStreamListener, tweet_mode = 'extended')
    myStream.filter(track=[keyword], is_async=True)

    return 'Streaming started'

# Route for the index page
@application.route('/getTweets')
def sendData():
    return get_tweets(api,'SpaceX')

# Route to start stream
@application.route('/searchTweets/<keyword>')
def getStreamingListener(keyword):
    return get_keyword_stream(str(keyword))

# Route to get tweets from the stream
@application.route('/streamUpdate')
def getStreamingTweets():
    return json.dumps(streaming_data)        

@application.route('/')
def getPage():
    return send_file("index.html")

    
if __name__ == "__main__":
    application.run()

