import time
import atexit
import urllib.parse
import os
import datetime as dt
import pytz

from apscheduler.schedulers.background import BackgroundScheduler

from twitter import get_trends_at_woeid, get_tweets, post_tweet_with_image
from tweets import store_tweets
from map import make_map
from words_frequency import make_wordcloud, get_words_frequency, make_histograms

scheduler = None
active_jobs = []
next_job_id = 1

#functions for auto post 
def job_autopost_map(id, params, center, zoom, mess, map_type):
    tweets = get_tweets(**params)
    image = make_map(tweets, center, zoom, map_type)
    post_tweet_with_image(mess, image)
    decrement_job_count(id)
    
def job_autopost_wordcloud(id, params, mess):
    tweets = get_tweets(**params)
    image = make_wordcloud(get_words_frequency(tweets, 500))
    post_tweet_with_image(mess, image)
    decrement_job_count(id)

def job_autopost_hist_week(id, params, mess):
    tweets = get_tweets(**params)
    image = make_histograms(tweets,'week')
    post_tweet_with_image(mess, image)
    decrement_job_count(id)

def job_autopost_hist_perc(id, params, mess):
    tweets = get_tweets(**params)
    image = make_histograms(get_words_frequency(tweets, 10),'perc')
    post_tweet_with_image(mess, image)
    decrement_job_count(id)

italy_tz = pytz.timezone("Europe/Rome")

def add_autopost_job(kind, args, hours, count, name):
    global next_job_id
    global active_jobs

    if kind == "map": func = job_autopost_map
    elif kind == "wordcloud": func = job_autopost_wordcloud
    elif kind == "histogram_week": func = job_autopost_hist_week
    elif kind == "histogram_perc": func = job_autopost_hist_perc
    else: return False

    start = dt.datetime.now() + dt.timedelta(hours = hours)
    end = dt.datetime.now() + dt.timedelta(hours = hours) * count - dt.timedelta(minutes = 5)

    # Minutes instead of hours for testing
    # start = dt.datetime.now() + dt.timedelta(minutes = hours)
    # end = start + dt.timedelta(minutes = hours) * count - dt.timedelta(seconds = 30)

    id = str(next_job_id)
    active_jobs.append({"id":id,"name":name,"type":kind, "date": dt.datetime.now(italy_tz), "count": count})
    next_job_id += 1

    #Add id argument to job
    args.insert(0, id)

    #scheduler.add_job(func=func, args=args, trigger="interval", minutes=hours, start_date=start, end_date=end)
    scheduler.add_job(func=func, args=args, id=id, trigger="interval", hours=hours, start_date=start, end_date=end)
    
    return True

def get_job_by_id(id):
    global active_jobs
    for j in active_jobs:
        if j["id"] == id:
            return j
    return None

def decrement_job_count(id):
    global active_jobs
    job = get_job_by_id(id)
    if job:
        job["count"] -= 1
        if job["count"] <= 0:
            active_jobs.remove(job)

def delete_job(id):
    global active_jobs
    global scheduler
    job = get_job_by_id(id)
    if job:
        active_jobs.remove(job)
        scheduler.remove_job(id)
        return 1
    
    return None

def init_scheduler():
    global scheduler
    scheduler = BackgroundScheduler()
    scheduler.start()
    # Shut down the scheduler when exiting the app
    atexit.register(lambda: scheduler.shutdown())





