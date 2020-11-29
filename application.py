from flask import Flask, make_response
from flask import send_file, redirect, request, Response
import datetime, time
import json
import mimetypes
import os

from words_frequency import get_words_frequency, make_wordcloud
from twitter import start_stream_listener, stop_stream_listener, streaming_data, get_tweets, post_tweet_with_image
from tweets import store_tweets, get_stored_tweets_info, get_stored_tweet, delete_stored_tweet, update_tweets_name
import scheduler
import automation

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
@application.route('/streamUpdate')
def stream_update():
    return Response(json.dumps(list(reversed(streaming_data)), ensure_ascii=False, indent=2), status=200, mimetype="application/json")

# Route to search tweets    
@application.route('/search')
def search():
    count = int(request.args.get("count"))
    word = request.args.get("keyword")
    user = request.args.get("user")
    location = request.args.get("location")
    images_only = request.args.get("images_only")
    coordinates_only = request.args.get("coordinates_only")
    
    query = ""
    if word:
        query += word + " "
    if user:
        query += "from:" + user + " "
    if images_only:
        query += "filter:images "
    print(query)

    tweets = get_tweets(query, location, coordinates_only, count)
    
    return Response(json.dumps(tweets, ensure_ascii=False, indent=2), status=200, mimetype="application/json")
        
# Route for retrieving tweet collections info
@application.route('/collections')
def collections():
    info = get_stored_tweets_info()
    return Response(json.dumps(info, ensure_ascii=False, indent=2), status=200,  mimetype="application/json")

@application.route('/collections', methods=["POST"])
def save_collection():
    body = request.get_json()
    if not body:
        return Response(status=400)

    success = store_tweets(body)
    status = 200 if success else 400
    return Response(status=status)
    
@application.route('/collections/<int:id>/name', methods=["POST"])
def update_collection_name(id):
    body = request.get_json()
    if not body:
        return Response(status=400)

    success = update_tweets_name(id, body["name"])
    status = 200 if success else 400
    return Response(status=status)

@application.route('/collections/<int:id>', methods=["GET"])
def get_collection(id):
    result = get_stored_tweet(id)
    if result:
        return Response(json.dumps(result, ensure_ascii=False, indent=2), status=200,  mimetype="application/json")
    else:
        return Response(status=400)

@application.route('/collections/<int:id>', methods=["DELETE"])
def delete_collection(id):
    success = delete_stored_tweet(id)
    status = 200 if success else 400
    return Response(status=status)

#wordcloud request
@application.route('/wordcloud/<int:req_count>', methods=["POST"])
def get_wordcloud(req_count):
    data = request.get_json()
    response_content = make_wordcloud(get_words_frequency(data, int(req_count)))
    response = make_response(str(response_content), 200)
    response.mimetype = 'text/plain'
    return response

#frequency words request
@application.route('/frequency/<int:req_count>', methods=["GET"])
def get_frequency(req_count):
    return get_words_frequency(req_count)

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
    # The app is not in debug mode or we are in the reloaded process
    #scheduler.test()
    #post_tweet_with_image("Tweet automatico di prova!", "static/img/logo.png")
    #automation.get_image_to_post("ciao", '44.69164,10.47674,450km', 100, 7)
    pass

# Run the application
if __name__ == "__main__":
    application.run()
    stop_stream_listener()

