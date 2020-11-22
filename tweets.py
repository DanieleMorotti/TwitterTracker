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

def store_tweets(name, data, filters):
    try:
        #ensure the tweets directory exists
        if not os.path.isdir(tweets_dir):
            os.mkdir(tweets_dir)

        id = get_next_id()
        info = {
            'id': id,
            'name': name,
            'filters': filters,
            'count': len(data),
            'data': data,
        }
        path = get_tweets_path_from_id(id)

        with open(path, "w", encoding='utf-8') as f:
            json.dump(info, f, ensure_ascii=False, indent=2)
        return True
    except Exception as e:
        print(e)
        return False

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


def test():
    store_tweets("prova1", [{'prova' : "Hello 1"}, {'other' : 'Hello other'}])
    store_tweets("prova2", [{'prova' : "Hello 2"}])
    store_tweets("prova3", [{'prova' : "Hello 3"}])
    print(get_stored_tweets_info())
    print(get_stored_tweet(2))

#test()
