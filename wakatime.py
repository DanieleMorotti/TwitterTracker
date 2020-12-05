import requests
import json
import datetime
import sys

url = 'https://wakatime.com/share/@sofiagavanelli/56736fa7-d80b-41e4-84cb-be611c07f761.json'
body = requests.get(url).json()

datefrom = datetime.datetime.strptime("20/11/2020", "%d/%m/%Y")
if len(sys.argv) > 1:
    try:
        datefrom = datetime.datetime.strptime(sys.argv[1], "%d/%m/%Y")
    except Exception as e:
        print(e)

with open("wakatime.txt", "w") as f:
    for r in body["data"]:
        timestr = r["grand_total"]["digital"]
        timeobj = datetime.datetime.strptime(timestr, "%H:%M")
        timedelta = datetime.timedelta(hours=timeobj.hour, minutes=timeobj.minute)
        time = str(timedelta.total_seconds() / 3600.0)

        datestr = r["range"]["date"]
        dateobj = datetime.datetime.strptime(datestr, "%Y-%m-%d")
        
        if datefrom and dateobj < datefrom:
            continue

        date = dateobj.strftime("%d/%m/%Y")
        print(date + "\t" + time, file = f)


        


