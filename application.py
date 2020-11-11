from flask import Flask
from flask import send_file, redirect, request, Response
import tweepy
import datetime, time
import json
import mimetypes

from tweets import store_tweets, get_stored_tweets_info, get_stored_tweet

# Set default mimetype for .js files
mimetypes.add_type('application/javascript', '.js')

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


#Stream tweets
class MyStreamListener(tweepy.StreamListener):

    # Called when the stream starts
    def on_connect(self):
        print("Connected to the server!")
    
    # Called when a new tweet is received
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
        
        streaming_data.append({
            'id': status.id_str, 
            'user':status.user.name, 
            'username': status.user.screen_name, 
            'text': text, 
            'data':status.created_at.strftime('%m/%d/%Y')
        })

    # Called when an error occurs
    def on_error(self, status):
        print('Streaming Error Status Code - ' + str(status))

# Global variables for the stream
myStreamListener = MyStreamListener()
my_stream = None
streaming_data = []

# Disconnect current stream if there is one
def stop_stream_listener():
    if(my_stream != None): 
        my_stream.disconnect()
        streaming_data.clear()
    
# Function to starm StreamListener
def start_stream_listener(keyword):
    global myStreamListener
    global my_stream
    
    # Disconnect existing stream
    stop_stream_listener()
    
    # Create a new stream with the specified 
    my_stream = tweepy.Stream(auth = api.auth, listener=myStreamListener, tweet_mode = 'extended')
    my_stream.filter(track=[keyword], is_async=True)

# Route to start stream
@application.route('/streamStart')
def stream_start():
    word = request.args.get("word")
    if not word:
        return Response(status = 400)
    
    start_stream_listener(word)
    
    return Response(status = 200)
    
# Route to stop stream
@application.route('/streamStop')
def stream_stop():
    stop_stream_listener()
    return Response(status = 200)

# Route to get tweets from the stream
@application.route('/streamUpdate')
def stream_update():
    return Response(json.dumps(list(reversed(streaming_data)), ensure_ascii=False, indent=2), status=200, mimetype="application/json")
    
# Search tweets
def get_tweet_text(tweet):
    try:
       text = tweet.retweeted_status.full_text
    except AttributeError:  # Not a Retweet
       text = tweet.full_text
    
    return text
                
@application.route('/search')
def search():
    word = request.args.get("keyword")
    location = request.args.get("location")
    print(word)
    # If no word is provided return an error code
    #if not word:
     #   return Response(status = 400)        

    list = []
    
    # Ask for 100 tweets
    for tweet in tweepy.Cursor(api.search,q=word,geocode=location,count=100,tweet_mode="extended").items(100):
        # Store city coordinates only if they are available in the tweet
        city=coordinates =""
        if tweet.place:
            city,coordinates = tweet.place.full_name,tweet.place.bounding_box.coordinates

        list.append({
            'id': tweet.id_str, 
            'text': get_tweet_text(tweet), 
            'user':tweet.user.name, 
            'username': tweet.user.screen_name,
            'data':tweet.created_at.strftime('%m/%d/%Y'),
            'geo_enabled':tweet.user.geo_enabled, 
            'city':city, 
            'coordinates':coordinates
        })
    
    return Response(json.dumps(list, ensure_ascii=False, indent=2), status=200, mimetype="application/json")
   
    
# Route for the index page
@application.route('/')
def get_page():
    return send_file("index.html")

# Headers to avoid browser caching
@application.after_request
def add_header(r):
    r.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    r.headers["Pragma"] = "no-cache"
    r.headers["Expires"] = "0"
    r.headers['Cache-Control'] = 'public, max-age=0'
    return r


# Run the application
if __name__ == "__main__":
    application.run()
    stop_stream_listener()

