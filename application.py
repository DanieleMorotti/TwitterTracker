from flask import Flask
from flask import send_file, redirect
import logging as log
import os

log_path = '/opt/python/log/application.log'

# EB looks for an 'application' callable by default <- name MUST be 'application'
application = Flask(__name__)

# Initialize logger to output to log_path
log.basicConfig(filename=log_path, level=log.DEBUG)

# Route for the index page
@application.route('/')
def hello_world():
    log.debug('Got index request')
    return send_file("index.html")
    

# Route for retrieving log
@application.route('/log')
def get_log():
    return send_file(log_path, "text/plain")
    with open(log_path) as f:
        return f.read();
        
    return "Unable to open log file";
    
    
# Route for clearing the log
@application.route('/log/clear')
def clear_log():
    os.truncate(log_path, 0);
    return redirect('/log');

    
# Run the application
if __name__ == "__main__":
    # Setting debug to True enables debug output. This line should be
    # removed before deploying a production app.
    application.debug = True
    application.run()
    