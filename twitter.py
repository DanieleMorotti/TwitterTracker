import tweepy
  
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
            'data':status.created_at.strftime('%d/%m/%Y')
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



# Search tweets
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

   
# Method to get a list of tweets
def get_tweets(query, location, coordinates_only, count):
    result = []
    max_count = count 
    if coordinates_only:
        max_count = count*3

    # Ask for max_count tweets
    for tweet in tweepy.Cursor(api.search, q=query, geocode=location, count=max_count, tweet_mode="extended", include_entities=True).items(max_count):
        # Store city coordinates only if they are available in the tweet
        city = coordinates = ""
        if tweet.place:
            coordinates = tweet.place.bounding_box.coordinates
            city =  tweet.place.full_name
        
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
def post_tweet_with_image(text, img_path):
    api.update_with_media(img_path, text)

#Trends
def get_trends_at_woeid(woeid):
    res = api.trends_place(woeid)
    trends = res[0]['trends']
    sorted_trends = sorted(trends, key=lambda t: t["tweet_volume"] or 0, reverse=True)
    return sorted_trends

def get_places_with_trends(lat, lng):
    places = api.trends_closest(lat, lng)
    return places

def test_trends():
    ITALY_WOEID = 23424853
    BOLOGNA_COORDS = (44.4949, 11.3426)

    places = get_places_with_trends(*BOLOGNA_COORDS)
    print(places)
    
    trends = get_trends_at_woeid(ITALY_WOEID)
    for t in trends:
        print(t['name'], t['tweet_volume'] or 0)

#test_trends()