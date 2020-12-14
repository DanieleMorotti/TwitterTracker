import os
import re
import json

tweets_dir = "tweets"
next_tweets_id = 1

#init tweets directory and next id based on present files
if not os.path.isdir(tweets_dir):
    os.mkdir(tweets_dir)
else:
    regex = re.compile(r'\d+')
    max_id = 0
    for f in os.listdir(tweets_dir):
        match = regex.search(f)
        if match.groups:
            val = int(match.group(0))
            if val < 1000:
                max_id = max(max_id, val)
    next_tweets_id = max_id + 1

def get_next_id():
    global next_tweets_id
    next = next_tweets_id
    next_tweets_id += 1
    return next

def get_tweets_path_from_id(id):
    filename = str(id) + ".json"
    return os.path.join(tweets_dir, filename)

def store_tweets(info):
    try:
        #ensure the tweets directory exists
        if not os.path.isdir(tweets_dir):
            os.mkdir(tweets_dir)

        #Add id and count to the info
        id = get_next_id()
        info['id'] = id
        info['count'] = len(info['data'])

        #Save into file
        path = get_tweets_path_from_id(id)
        with open(path, "w", encoding='utf-8') as f:
            json.dump(info, f, ensure_ascii=False, indent=2)
        return id

    except Exception as e:
        print(e)
        return None

def get_stored_tweets_info():
    if not os.path.isdir(tweets_dir):
        return []
    
    result = []
    for filename in os.listdir(tweets_dir):
        path = os.path.join(tweets_dir, filename)
        with open(path, encoding='utf-8') as f:
            info = json.load(f)
            result.append({
                'id': info['id'],
                'name': info['name'],
                'count': info['count'],
                'date': info.get('date', '')
            })
    
    return result

def get_stored_tweet(id):
    path = get_tweets_path_from_id(id)
    try:
        with open(path, encoding='utf-8') as f:
            info = json.load(f)
            return info
    except Exception as e:
        print(e)
        return None

def delete_stored_tweet(id):
    path = get_tweets_path_from_id(id)
    try:
        os.remove(path)
        return True
    except:
        return False

def update_tweets_name(id, name):
    path = get_tweets_path_from_id(id)
    try:
        info = {}
        with open(path, "r+", encoding='utf-8') as f:
            info = json.load(f)
            info["name"] = name
            f.seek(0)
            f.truncate()
            json.dump(info, f, ensure_ascii=False, indent=2)
            return True
    except:
        return False

def add_tweets(id, tweets):
    path = get_tweets_path_from_id(id)
    try:
        info = {}
        with open(path, "r+", encoding='utf-8') as f:
            info = json.load(f)
            
            #Prepare a set with all the ids of tweets in the collection
            old = set()
            for t in info["data"]:
                old.add(t["id"])
            
            #Only add the tweet if it's not already in the collection
            for t in tweets:
                if not t["id"] in old:
                    info["data"].append(t)
            info["count"] = len(info["data"])
            
            f.seek(0)
            f.truncate()
            json.dump(info, f, ensure_ascii=False, indent=2)
            return True
    except:
        return False


