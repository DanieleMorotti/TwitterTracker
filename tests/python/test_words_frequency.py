import pytest

import warnings

from words_frequency import *
from twitter import get_tweets
import random

def test_words_frequency():
    random_words = ["hello", "test", "words", "book", "apple", "cat"]
    data = {w : 0 for w in random_words}
    total = 0

    #generate 10 random tweets of 15 - 30 words
    test_tweets = []
    for t in range(10):
        words = []
        for i in range(15, 30):
            w = random.choice(random_words)
            words.append(w)
            data[w] += 1
            total += 1
        
        test_tweets.append({"text": " ".join(words)})
    
    freq = get_words_frequency(test_tweets, len(random_words))
    for w, c in data.items():
        assert freq[w] == c / total

def test_images():
    warnings.filterwarnings("ignore", module="matplotlib")

    tweets = get_tweets("ciao", None, False, 100)
    freq = get_words_frequency(tweets, 50)
    
    assert make_wordcloud(freq) is not None
    assert make_histograms(freq,'perc') is not None
    assert make_histograms(tweets, 'week') is not None
