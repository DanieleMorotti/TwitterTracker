import tweets
import requests
import re
import os

url = "http://flask-env.eba-snhy2wnm.eu-west-3.elasticbeanstalk.com"

# Remove all tweets >= 1000.json
regex = re.compile(r'\d+')
for f in os.listdir(tweets.tweets_dir):
    match = regex.search(f)
    if match.groups:
        id = int(match.group(0))
        if id >= 1000:
            path = tweets.get_tweets_path_from_id(id) 
            os.remove(path)

# Set next tweets id to 1000 
tweets.next_tweets_id = 1000

# Request info
info = requests.get(url + "/collections").json()

# Request collections
for i in info:
    id = i['id'];
    c = requests.get(url + "/collections/" + str(id)).json()
    tweets.store_tweets(c['name'], c['data'], c['filters'])

