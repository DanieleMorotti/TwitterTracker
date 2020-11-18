from flask import Flask
from flask import send_file, redirect, request, Response
import tweepy
import datetime, time
import json
import mimetypes

from tweets import store_tweets, get_stored_tweets_info, get_stored_tweet, delete_stored_tweet, update_tweets_name

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
    # NEEDED represents the number of tweet to return inside the response
    # TO_REQUIRE represents the number of tweets to analyze, due to small amount of tweets with coordinates,
    # if such filter is set, 10000 tweets are required from the API
    NEEDED = TO_REQUIRE = 100
    word = request.args.get("keyword")
    user = request.args.get("user")
    location = request.args.get("location")
    images_only = request.args.get("images_only")
    coordinates_only = request.args.get("coordinates_only")
    
    query = ""
    if word:
        query += word + " "
    if user:
        query += "from:" + user + " "
    if images_only:
        query += "filter:images "
    if coordinates_only:
        TO_REQUIRE = 10000 
    print(query)

    list = []
    get_tweets(NEEDED, TO_REQUIRE, location, coordinates_only, query, list)
    
    return Response(json.dumps(list, ensure_ascii=False, indent=2), status=200, mimetype="application/json")
   
# Method to fullfill the list of tweets
def get_tweets(NEEDED, TO_REQUIRE, location, coordinates_only, query, list):
    # Ask for TO_REQUIRE tweets
    for tweet in tweepy.Cursor(api.search, q=query, geocode=location, count=TO_REQUIRE, tweet_mode="extended", include_entities=True).items(TO_REQUIRE):
        # Store city coordinates only if they are available in the tweet
        city = coordinates = ""
        if tweet.place:
            coordinates = tweet.place.bounding_box.coordinates
            city =  tweet.place.full_name
        if((coordinates_only and coordinates) or not coordinates_only):
            media = []
            media_tweet = tweet
            #If it's a retweet the media is actually in retweeted_status
            if hasattr(tweet, "retweeted_status"):
                media_tweet = tweet.retweeted_status

            if hasattr(media_tweet, "extended_entities") and 'media' in media_tweet.extended_entities:
                media = media_tweet.extended_entities["media"]
            elif hasattr(media_tweet, "entities") and 'media' in media_tweet.entities:
                media = media_tweet.entities["media"]

            images = []
            for m in media:
                if m["type"] == "photo" or m["type"] == "animated_gif":
                    images.append(m["media_url"])
                
            list.append({
                'id': tweet.id_str,
                'text': get_tweet_text(tweet), 
                'user':tweet.user.name, 
                'username':tweet.user.screen_name,
                'data':tweet.created_at.strftime('%m/%d/%Y'),
                'location': tweet.user.location,
                'city':city, 
                'coordinates':coordinates,
                'images': images
            })
            print(len(list),'element grouped')
            if len(list) >= NEEDED:
                break
        
# Route for retrieving tweet collections info
@application.route('/collections')
def collections():
    info = get_stored_tweets_info()
    return Response(json.dumps(info, ensure_ascii=False, indent=2), status=200,  mimetype="application/json")

@application.route('/collections', methods=["POST"])
def save_collection():
    body = request.get_json()
    if not body:
        return Response(status=400)

    success = store_tweets(body["name"], body["data"], body["filters"])
    status = 200 if success else 400
    return Response(status=status)
    
@application.route('/collections/<int:id>/name', methods=["POST"])
def update_collection_name(id):
    body = request.get_json()
    if not body:
        return Response(status=400)

    success = update_tweets_name(id, body["name"])
    status = 200 if success else 400
    return Response(status=status)

@application.route('/collections/<int:id>', methods=["GET"])
def get_collection(id):
    result = get_stored_tweet(id)
    if result:
        return Response(json.dumps(result, ensure_ascii=False, indent=2), status=200,  mimetype="application/json")
    else:
        return Response(status=400)

@application.route('/collections/<int:id>', methods=["DELETE"])
def delete_collection(id):
    success = delete_stored_tweet(id)
    status = 200 if success else 400
    return Response(status=status)
    

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

