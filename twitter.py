import tweepy
import os
import urllib.parse

# Twitter keys
API_KEY = 'j6DEP35tCTAxgmoaCYMQAThHw'
API_SECRET_KEY = 'IStBpbpGzInMyzxAtlg6ZRLpJWZu5hS0SUAm6RB8YdmlNLz9OD'
ACCESS_TOKEN = '1315934369433956354-rLqEw3cEm7rCcM4gIkOwf769Bau9KO'
ACCESS_SECRET_TOKEN = '6PpugJgagpUUdkvI9ZZCK7qB6Z6TjATmbTilZkmQNOU3U'

# Initialize tweepy
auth = tweepy.OAuthHandler(API_KEY, API_SECRET_KEY)
auth.set_access_token(ACCESS_TOKEN, ACCESS_SECRET_TOKEN)
api = tweepy.API(auth)

# Stream tweets
class MyStreamListener(tweepy.StreamListener):

    def set_additional_filters(self, coordinates_only, images_only):
        self.coordinates_only = coordinates_only
        self.images_only = images_only

    # Called when the stream starts
    def on_connect(self):
        pass
    
    # Called when a new tweet is received
    def on_status(self, tweet):
        global streaming_data

        text = ""
        if hasattr(tweet, "retweeted_status"): # Check if Retweet
            try:
                text = tweet.retweeted_status.extended_tweet["full_text"]
            except AttributeError:
                text = tweet.retweeted_status.text
        else:
            try:
                text = tweet.extended_tweet["full_text"]
            except AttributeError:
                text = tweet.text

        city, coordinates = get_city_and_coordinates(tweet)
        # skip the tweet if we need coordinates and they are not available
        if self.coordinates_only and not coordinates:
            return        
            
        images = get_tweet_images(tweet)
        #skip the tweet if we need only tweets with images and the tweet doesn't have any
        if self.images_only and not images:
            return 
    
        streaming_data.append({
            'id': tweet.id_str,
            'text': text, 
            'user':tweet.user.name, 
            'username':tweet.user.screen_name,
            'data':tweet.created_at.strftime('%d/%m/%Y'),
            'location': tweet.user.location,
            'city':city, 
            'coordinates':coordinates,
            'images': images
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
    global my_stream
    if(my_stream != None): 
        streaming_data.clear()
        my_stream.disconnect()
        my_stream = None
    
# Function to starm StreamListener
def start_stream_listener(keyword, user, location, coordinates_only, images_only):
    global myStreamListener
    global my_stream
    
    # Disconnect existing stream
    stop_stream_listener()

    track = keyword.split() if keyword else None
    follow = user.split() if user else None
    loc = [float(i) for i in location.split(",")] if location else None

    # Create a new stream with the specified
    my_stream = tweepy.Stream(auth = api.auth, listener=myStreamListener, tweet_mode="extended")
    my_stream.filter(track=track, follow=follow, locations=loc, is_async=True)
    myStreamListener.set_additional_filters(coordinates_only, images_only)



# Search tweets

def build_search_query(word = "", user = "", images_only = False):
    query =  ""
    if word:
        query += word + " "
    if images_only:
        query += "filter:images "

    #Must be last for it to be applied after all filters
    if user:
        l = []
        for u in user.split():
            l.append("from:" + u)
        query += " OR ".join(l)
    return query

def get_tweet_text(tweet):
    try:
       text = tweet.retweeted_status.full_text
    except AttributeError:  # Not a Retweet
       text = tweet.full_text
    
    return text

def get_tweet_images(tweet):
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
    return images

def get_city_and_coordinates(tweet):
    # Store city coordinates only if they are available in the tweet
    city = coordinates = ""
    if tweet.place:
        coordinates = tweet.place.bounding_box.coordinates
        city =  tweet.place.full_name
    return city, coordinates
   
# Method to get a list of tweets
def get_tweets(query, location, coordinates_only, count):
    result = []
    max_count = min(count, 1000) 
    if coordinates_only:
        max_count = 1000

    # Ask for max_count tweets
    for tweet in tweepy.Cursor(api.search, q=query, geocode=location, count=max_count, tweet_mode="extended", include_entities=True).items(max_count):
        city, coordinates = get_city_and_coordinates(tweet)

        # skip the tweet if we need coordinates and they are not available
        if coordinates_only and not coordinates:
            continue

        images = get_tweet_images(tweet)
    
        result.append({
            'id': tweet.id_str,
            'text': get_tweet_text(tweet), 
            'user':tweet.user.name, 
            'username':tweet.user.screen_name,
            'data':tweet.created_at.strftime('%d/%m/%Y'),
            'location': tweet.user.location,
            'city':city, 
            'coordinates':coordinates,
            'images': images
        })
        #stop as soon as we reach the count we needed
        if len(result) >= count:
            break
    return result

#Tweet on fraydrum
def post_tweet_with_image(text, image):
    filename = "temptweet.png"
    image.save(filename)
    api.update_with_media(filename, text)
    os.remove(filename)

#Trends
def get_trends_at_woeid(woeid):
    res = api.trends_place(woeid)
    
    trends = []
    for t in res[0]['trends']:
        trends.append({
            "name": t['name'],
            "count": t['tweet_volume'] or 0,
            "query": urllib.parse.unquote_plus(t['query']),
        })
        
    return trends

def get_places_with_trends(lat, lng):
    places = api.trends_closest(lat, lng)
    return places
