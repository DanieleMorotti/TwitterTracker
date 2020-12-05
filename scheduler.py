import time
import atexit
import urllib.parse
import os
import datetime as dt

from apscheduler.schedulers.background import BackgroundScheduler

from twitter import get_trends_at_woeid, get_tweets, post_tweet_with_image
from tweets import store_tweets
from map import make_map
from words_frequency import make_wordcloud, get_words_frequency, make_histograms

scheduler = None
active_jobs = []
next_job_id = 1

#functions for auto post 
def job_autopost_map(params, center, zoom, mess):
    tweets = get_tweets(**params)
    image = make_map(tweets, center, zoom)
    post_tweet_with_image(mess, image)
    
def job_autopost_wordcloud(params, mess):
    tweets = get_tweets(**params)
    image = make_wordcloud(get_words_frequency(tweets, 500))
    post_tweet_with_image(mess, image)

def job_autopost_hist_week(params, mess):
    tweets = get_tweets(**params)
    image = make_histograms(tweets,'week')
    post_tweet_with_image(mess, image)

def job_autopost_hist_perc(params, mess):
    tweets = get_tweets(**params)
    image = make_histograms(get_words_frequency(tweets, 10),'perc')
    post_tweet_with_image(mess, image)

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
    active_jobs.append({"id":id,"name":name,"type":kind, "date":start})
    next_job_id += 1

    #scheduler.add_job(func=func, args=args, trigger="interval", hours=hours, start_date=start, end_date=end)
    scheduler.add_job(func=func, args=args, id=id, trigger="interval", minutes=hours, start_date=start, end_date=end)
    
    return True
    
def delete_job(id):
    global active_jobs
    active_jobs[:] = [job for job in active_jobs if job.get('id') != id]
    return active_jobs

def init_scheduler():
    global scheduler
    scheduler = BackgroundScheduler()
    scheduler.start()
    # Shut down the scheduler when exiting the app
    atexit.register(lambda: scheduler.shutdown())





