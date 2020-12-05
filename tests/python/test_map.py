import pytest

from map import *
from twitter import get_tweets

def test_map_generation():
    tweets = get_tweets("filter:images", "44.31554,10.79534,210km", True, 5)
    image = make_map(tweets, "44.31554,10.79534", 7)
    assert image.width == MAP_IMAGE_SIZE and image.height == MAP_IMAGE_SIZE
