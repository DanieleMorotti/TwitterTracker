import time
import atexit
import urllib.parse
import os
import datetime as dt

from apscheduler.schedulers.background import BackgroundScheduler

from twitter import get_trends_at_woeid, get_tweets, post_tweet_with_image
from tweets import store_tweets
from map import make_map
from words_frequency import make_wordcloud, get_words_frequency

scheduler = None
active_job_ids = []
next_job_id = 1

def job_autopost_map(params, center, zoom):
    tweets = get_tweets(**params)
    image = make_map(tweets, center, zoom)
    post_tweet_with_image("Automatic map!", image)
    
def job_autopost_wordcloud(params):
    tweets = get_tweets(**params)
    image = make_wordcloud(get_words_frequency(tweets, 500))
    post_tweet_with_image("Automatic wordcloud!", image)

def add_autopost_job(kind, args, hours, count):
    global next_job_id
    global active_job_ids

    func = job_autopost_map if kind == "map" else job_autopost_wordcloud
    # start = dt.datetime.now() + dt.timedelta(hours = hours)
    # end = dt.datetime.now() + dt.timedelta(hours = hours) * count - dt.timedelta(minutes = 5)
    start = dt.datetime.now() + dt.timedelta(minutes = hours)
    end = start + dt.timedelta(minutes = hours) * count - dt.timedelta(seconds = 30)

    id = str(next_job_id)
    active_job_ids.append(id)
    next_job_id += 1

    #scheduler.add_job(func=func, args=args, trigger="interval", hours=hours, start_date=start, end_date=end)
    scheduler.add_job(func=func, args=args, id=id, trigger="interval", minutes=hours, start_date=start, end_date=end)
    

def init_scheduler():
    global scheduler
    scheduler = BackgroundScheduler()
    scheduler.start()
    # Shut down the scheduler when exiting the app
    atexit.register(lambda: scheduler.shutdown())

def test():
    ITALY_WOEID = 23424853
    trends = get_trends_at_woeid(ITALY_WOEID)
    for i in range(min(len(trends), 5)):
        t = trends[i]
        name = t['name']
        query = urllib.parse.unquote_plus(t['query'])
        
        info = {}
        info['name'] = name
        info['data'] = get_tweets(query, None, False, 100)
        info['date'] = time.strftime("%d/%m/%Y")
        info['filters'] = {
            "keyword": query,
            "user": "",
            "center": "",
            "radius": "",
            "pdi": "",
            "images_only": False,
            "coordinates_only": False
        }

        store_tweets(info)
        print(f"Saved {info['count']} tweets on trend: {name} {query}")




