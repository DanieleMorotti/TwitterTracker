import requests
import json
import datetime
import sys

url = 'https://wakatime.com/share/@8068813f-7ab9-4ce6-9f99-41777a9d6ede/ffd8737f-cf3b-43c8-90e9-cbe61c04c7ce.json'
url2 = 'https://wakatime.com/share/@8068813f-7ab9-4ce6-9f99-41777a9d6ede/95df2f63-6790-45e8-a43d-b96af58a6b1f.json'
body = requests.get(url).json()
languages =  requests.get(url2).json()

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

    print('\n', file = f)
    for l in languages["data"]:
        print(l["name"] + "\t" + str(l["percent"]), file = f)
        


