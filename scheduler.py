import time
import atexit

from apscheduler.schedulers.background import BackgroundScheduler

#
# Notes:
# possiamo usare start_date end_date in add job per i tweet automatici
# possiamo usare un interval partito all'avvio dell'app per i trend
#

count = 0
scheduler = None

def print_date_time():
    print(time.strftime("%A, %d. %B %Y %I:%M:%S %p"))
    global count
    count += 1
    if count == 5:
        scheduler.remove_job("1")


def test():
    global scheduler
    global job
    scheduler = BackgroundScheduler()
    scheduler.add_job(func=print_date_time, trigger="interval", seconds=3, id="1")
    scheduler.start()

    # Shut down the scheduler when exiting the app
    atexit.register(lambda: scheduler.shutdown())
