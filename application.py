from flask import Flask, make_response
from flask import send_file, redirect, request, Response
import datetime, time
import json
import mimetypes
import os
from io import BytesIO

from words_frequency import get_words_frequency, make_wordcloud
from twitter import start_stream_listener, stop_stream_listener, streaming_data, get_tweets, post_tweet_with_image, get_trends_at_woeid
from tweets import store_tweets, get_stored_tweets_info, get_stored_tweet, delete_stored_tweet, update_tweets_name, add_tweets
from scheduler import add_autopost_job, init_scheduler
from map import make_map

# Set default mimetype for .js files
mimetypes.add_type('application/javascript', '.js')

# Initialize flask
application = Flask(__name__)

# Route to start stream
@application.route('/streamStart')
def stream_start():
    word = request.args.get("word")
    if not word:
        return Response(status = 400)
    
    start_stream_listener(word)
    return Response(status = 200)
    
# Route to stop stream
@application.route('/streamStop')
def stream_stop():
    stop_stream_listener()
    return Response(status = 200)

# Route to get tweets from the stream
@application.route('/streamUpdate/<int:next_index>')
def stream_update(next_index):
    if next_index > len(streaming_data):
        return Response(status=400)
    return Response(json.dumps(streaming_data[next_index:], ensure_ascii=False, indent=2), status=200, mimetype="application/json")

# Get search parameters for get_tweets function
def get_search_parameters(filters):
    count = int(filters.get("count"))
    word = filters.get("keyword")
    user = filters.get("user")
    location = filters.get("location")
    images_only = filters.get("images_only")
    coordinates_only = filters.get("coordinates_only")

    query =  ""
    if word:
        query += word + " "
    if user:
        query += "from:" + user + " "
    if images_only:
        query += "filter:images "

    result = {
        'query': query,
        'location': location,
        'coordinates_only': coordinates_only,
        'count': count,
    }

    return result


# Route to search tweets    
@application.route('/search')
def search():
    params = get_search_parameters(request.args)
    tweets = get_tweets(**params)
    return Response(json.dumps(tweets, ensure_ascii=False, indent=2), status=200, mimetype="application/json")

# Get image from automatic post request body
def get_image_from_request_body(body):
    tweets = body["tweets"]
    kind = body["kind"]

    if kind == "map":
        zoom = body["zoom"]
        center = body["center"]
        return make_map(tweets, center, zoom)
    elif kind == "wordcloud":
        return make_wordcloud(get_words_frequency(tweets, 500))
    else:
        return None

# Route to get preview of image to post automatically
@application.route('/postPreview', methods=["POST"])
def post_preview():
    body = request.get_json()
    image = get_image_from_request_body(body)
    return send_image(image)

# Automate posting of maps and wordclouds
@application.route('/autopost', methods=["POST"])
def autopost():
    body = request.get_json()
    filters = body['filters']
    freq = body["frequency"]
    post_count = body["post_count"]
    kind = body["kind"]

    # Post the first image immediately
    image = get_image_from_request_body(body)
    post_tweet_with_image("Testo di prova", image)

    #Create a scheduled job to post again later
    if post_count > 1:
        params = get_search_parameters(filters)
        # Force coordinates_only for the map
        if kind == "map":
            params['coordinates_only'] = True
        
        args = [params] if kind == "wordcloud" else [params, body['center'], body['zoom']]
        add_autopost_job(kind, args, freq, post_count - 1) # - 1 because we already posted the first time

    return Response(status=200)

# Route for retrieving tweet collections info
@application.route('/collections')
def collections():
    info = get_stored_tweets_info()
    return Response(json.dumps(info, ensure_ascii=False, indent=2), status=200,  mimetype="application/json")

# Create a new collection
@application.route('/collections', methods=["POST"])
def save_collection():
    body = request.get_json()
    if not body:
        return Response(status=400)

    success = store_tweets(body)
    status = 200 if success else 400
    return Response(status=status)
    
# Rename a collection with the specified id
@application.route('/collections/<int:id>/name', methods=["POST"])
def update_collection_name(id):
    body = request.get_json()
    if not body:
        return Response(status=400)

    success = update_tweets_name(id, body["name"])
    status = 200 if success else 400
    return Response(status=status)

# Rename a collection with the specified id
@application.route('/collections/<int:id>/add', methods=["POST"])
def add_to_collection(id):
    print("route")
    body = request.get_json()
    if not body:
        print("no json yo")
        return Response(status=400)

    print("adding")
    success = add_tweets(id, body["data"])
    status = 200 if success else 400
    print("wat")
    return Response(status=status)

# Get the collection with the specified id
@application.route('/collections/<int:id>', methods=["GET"])
def get_collection(id):
    result = get_stored_tweet(id)
    if result:
        return Response(json.dumps(result, ensure_ascii=False, indent=2), status=200,  mimetype="application/json")
    else:
        return Response(status=400)

# Delete collection with the specified id
@application.route('/collections/<int:id>', methods=["DELETE"])
def delete_collection(id):
    success = delete_stored_tweet(id)
    status = 200 if success else 400
    return Response(status=status)

# Send image as a png in the response body
def send_image(image):
    image_io = BytesIO()
    image.save(image_io, 'PNG')
    image_io.seek(0)

    #Return the image directly in the body    
    return send_file(image_io, mimetype="image/png")

# Wordcloud request
@application.route('/wordcloud/<int:req_count>', methods=["POST"])
def get_wordcloud(req_count):
    data = request.get_json()

    image = make_wordcloud(get_words_frequency(data, int(req_count)))
    return send_image(image)

# Frequency words request
@application.route('/frequency/<int:req_count>', methods=["POST"])
def get_frequency(req_count):
    data = request.get_json()
    freq_list = get_words_frequency(data, int(req_count))
    return Response(json.dumps(freq_list, ensure_ascii=False), status=200,  mimetype="application/json")

# Get trends in italy
@application.route('/trends')
def get_trends():
    ITALY_WOEID = 23424853
    trends = get_trends_at_woeid(ITALY_WOEID)
    return Response(json.dumps(trends, ensure_ascii=False), status=200,  mimetype="application/json")    

# Route for the index page
@application.route('/')
def get_page():
    return send_file("index.html")

# Headers to avoid browser caching (comment before deploy)
@application.after_request
def add_header(r):
    r.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    r.headers["Pragma"] = "no-cache"
    r.headers["Expires"] = "0"
    r.headers['Cache-Control'] = 'public, max-age=0'
    return r


# Only run this once even if the reloader is running:
if not (application.debug or os.environ.get("FLASK_ENV") == "development") or os.environ.get("WERKZEUG_RUN_MAIN") == "true":
    init_scheduler()
    #post_tweet_with_image("Tweet automatico di prova!", "static/img/logo.png")
    pass

# Run the application
if __name__ == "__main__":
    application.run()
    stop_stream_listener()

