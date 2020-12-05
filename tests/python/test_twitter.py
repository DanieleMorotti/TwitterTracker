import pytest

import time
from twitter import *

# Test trends api
def test_trends():
    ITALY_WOEID = 23424853
    BOLOGNA_COORDS = (44.4949, 11.3426)

    # test places near coordinates
    places = get_places_with_trends(*BOLOGNA_COORDS)
    for p in places:
        assert "woeid" in p
    
    # test trends at woeid
    trends = get_trends_at_woeid(ITALY_WOEID)
    for t in trends:
        assert "name" in t
        assert t["count"] >= 0
        assert "query" in t

# Returns true if the t has all the fields a tweet is expected to have
def tweet_has_fields(t):
    fields = ["id", "text", "user", "username", "data", "location", "city", "coordinates", "images"]
    for f in fields:
        if f not in t:
            return False
    return True

# Test the search api
def test_get_tweets():
    tweets = get_tweets("test", None, False,10)
    assert len(tweets) == 10

    # test that tweet has the specified fields
    for t in tweets:
        assert tweet_has_fields(t)
    
    # test that all the tweets have coordinates if coordinates_only is true
    tweets = get_tweets("", "44.31554,10.79534,210km", True, 10)
    for t in tweets:
        assert t["coordinates"]
    
    # test that all the tweets have images if specified in the query
    tweets = get_tweets("filter:images", None, False, 10)
    for t in tweets:
        assert len(t["images"]) > 0

# Test the streaming api    
def test_stream_listener():
    # start the stream listener
    location = "-13.34305517746267,39.41734759551851,14.863944037539618,57.01059020786646"
    start_stream_listener("hello", "", location, False, False)

    # wait for at least 3 tweets for up to 10 seconds
    global streaming_data
    for i in range(10):
        time.sleep(1)
        if len(streaming_data) >= 3:
            break

    # check the returned tweets
    for t in streaming_data:
        assert tweet_has_fields(t)

    # stop the stream listener
    stop_stream_listener()