import requests
from math import pi,cos
from PIL import Image
import tweepy
from io import BytesIO
from twitter import get_tweets
import random as rand

MAP_IMAGE_SIZE = 640

history_pixels = []
#to prevent images over other images
def val_dist(pix):
    global history_pixels
    px,py = pix[0],pix[1]
    #until the pixel coordinates are equals to others
    if((int(px),int(py)) in history_pixels):
        px+= 30 * (-1 if rand.random() < 0.5 else 1)
        py+= 30 * (-1 if rand.random() < 0.5 else 1)
        #until the pixels is already taken
        if((int(px),int(py)) in history_pixels):px,py =val_dist((px,py))
        else:history_pixels.append((int(px),int(py)))
    return px,py

#convert coordinates lat,long to pixels given a center,the zoom used and the size of the image
def coord_to_pixel(center_lat,center_lon, lat, lon,zoom,img_size):
    degreesPerPixelX = 360 / 2**(zoom+8)
    degreesPerPixelY = 360 / 2**(zoom+8) * cos(center_lat * pi / 180)
    py = ((center_lat - lat)/degreesPerPixelY)+img_size/2
    px = ((lon - center_lon)/degreesPerPixelX)+img_size/2
    px,py = val_dist((px,py))
    return px, py


def get_maps_image(center,markers,zoom):
    global MAP_IMAGE_SIZE
    BASE_URL = "https://maps.googleapis.com/maps/api/staticmap?"
    API_KEY = "AIzaSyDD9bBnkYVGlT_4TOWjQkhVe9M3RchWAmU"
    #google maps api limit
    if(MAP_IMAGE_SIZE > 640):MAP_IMAGE_SIZE=640
    MARKERS_URL = "markers=color:red"

    #generate the string to draw all the markers in the map
    for coord in markers:
        MARKERS_URL+=f'|{str(coord[0])},{str(coord[1])}'

    URL = f'{BASE_URL}center={center}&zoom={zoom}&scale=1&size={MAP_IMAGE_SIZE}x{MAP_IMAGE_SIZE}&{MARKERS_URL}&key={API_KEY}'
    #request for receiving the image of the map with the markers
    try:
        response = requests.get(URL)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        print(e)
    #storing the response in a file (image)
    with open('toPost.png', 'wb') as file:
        file.write(response.content)
    
    #change the image mode so all the pictures(bytes) is not converted to 'P' mode
    im_tmp = Image.open('toPost.png').convert(mode="RGB", matrix=None, dither=None, palette=0, colors=256)
    im_tmp.save('toPost.png', quality=95)


def draw_on_image(tw_im,px,py):
    #the width i want the twitter images are resized to
    basewidth = 35

    im_map = Image.open('toPost.png')
    #get the img from the url
    tweet_im = requests.get(tw_im)
    im2 = Image.open(BytesIO(tweet_im.content))

    #resize the image keeping the aspect ratio
    wpercent = (basewidth / float(im2.size[0]))
    hsize = int((float(im2.size[1]) * float(wpercent)))
    im2 = im2.resize((basewidth, hsize),Image.ANTIALIAS)

    #back_im = im1.copy()
    im_map.paste(im2,(px, py))
    im_map.save('toPost.png', quality=95)


def get_image_to_post(word,location,count,zoom):
    #True because i need only geo-located tweet
    tweets = get_tweets(word,location,True,count,'automatic')
    markers = []
    #loop to find all the geo-localized tweet, but not pictures
    for tw in tweets:
        if not tw['images']:
            #to get the north-west coordinate
            lon,lat = tw["coordinates"][0][1][0],tw["coordinates"][0][1][1]
            markers.append((lat,lon))

    #get the coordinates without the radius
    center = location.rsplit(',', maxsplit=1)[0]
    get_maps_image(center,markers,zoom)

    float_lat = float(center.split(',')[0])
    float_lon = float(center.split(',')[1])
    #draw all the pictures over the map
    for tw in tweets:
        if(tw['images'] and tw['images']['media_url']):
            px,py = coord_to_pixel(float_lat,float_lon,tw["coordinates"][0][1][1],tw["coordinates"][0][1][0],zoom,MAP_IMAGE_SIZE)
            draw_on_image(tw["images"]['media_url'],int(px),int(py))

