from flask import Flask
from flask import send_file, redirect
import tweepy
import datetime, time
import json

API_KEY = 'j6DEP35tCTAxgmoaCYMQAThHw'
API_SECRET_KEY = 'IStBpbpGzInMyzxAtlg6ZRLpJWZu5hS0SUAm6RB8YdmlNLz9OD'
ACCESS_TOKEN = '1315934369433956354-4rOOoUjQUh6ePCUw5ZwtzeUF4t9Kks'
ACCESS_SECRET_TOKEN = 'apq38hqrJwSpZMGSBfU0qppMud9l8Dz0yE1F1PlPNhkdb'

auth = tweepy.OAuthHandler(API_KEY, API_SECRET_KEY)
auth.set_access_token(ACCESS_TOKEN, ACCESS_SECRET_TOKEN)
api = tweepy.API(auth)

application = Flask(__name__)

def get_tweets(api, username):
    deadend = False
    lista = {'tweets':[]}
    tweets = api.user_timeline(username)
    for tweet in tweets:
        lista['tweets'].append({'testo':tweet.text,'user':tweet.user.name,'data':tweet.created_at.strftime('%m/%d/%Y')})
        
    return json.dumps(lista,indent=2, sort_keys=True)


# Route for the index page
@application.route('/getTweets')
def sendData():
    return get_tweets(api,'SpaceX')
    
@application.route('/')
def getPage():
    return send_file("index.html")

    
if __name__ == "__main__":
    application.run()

