from wordcloud import WordCloud, ImageColorGenerator
from stop_words import get_stop_words
from scipy.ndimage import gaussian_gradient_magnitude
from PIL import Image
import string
import numpy
import os
import time
import matplotlib.pyplot as plt
from io import BytesIO
import threading

#Create a list with word and frequency
def get_words_frequency(tweets, word_count):
    words = []
    stopwords = get_stop_words('italian')
    stopwords += get_stop_words('english')
    stopwords += get_stop_words('spanish')
    stopwords += get_stop_words('french')
    stopwords += get_stop_words('german')

    stopwords.append('')
    stopwords=set(stopwords)
    tr = str.maketrans('', '', string.punctuation.replace('@','').replace('#',''))
    
    for val in tweets:
        val = str(val['text'])
        tokens = val.split()
        for t in tokens:
            if t.startswith('http'):
                continue
            t = t.lower().translate(tr)
            if t not in stopwords:
                words.append(t)

    dict = {}
    for w in words:
        if w not in dict:
            dict[w] = 1
        else:
            dict[w] += 1

    items = sorted(dict.items(), key = lambda item: item[1], reverse=True)
    
    word_count = min(len(items), word_count)
    items = items[0 : word_count]
    
    total_count = 0

    for (w, c) in items:
        total_count += c
    result = {}

    for (w, c) in items:
        result[w] = c/total_count
    return result

#Random colors
def random_color_func(word=None, font_size=None, position=None,  orientation=None, font_path=None, random_state=None):
    h = 37  #Hue
    s = 100#Saturation
    l = int(100.0 * float(random_state.randint(80, 150)) / 255.0) #Light

    return "hsl({}, {}%, {}%)".format(h, s, l)

#Wordcloud
def make_wordcloud(words):
    mask_color = numpy.array(Image.open("static/img/mask.png"))
     
    mask = mask_color.copy()
    mask[mask.sum(axis=2) == 0] = 255

    edges = numpy.mean([gaussian_gradient_magnitude(mask_color[:,:,i]/255., 2) for i in range(3)], axis=0)
    mask[edges > .08] = 255
    wc = WordCloud(
            width = 900,
            height = 600,
            mode='RGBA',
            background_color = (0,0,0,0),  
            mask=mask,
            font_path = 'static/fonts/seguiemj.ttf',
            random_state=42,
            color_func=random_color_func)
    wc.fit_words(words)
    
    #colors = ImageColorGenerator(mask_color)
    #wc.recolor(color_func=colors)
    #
    #Return a PIL image of the wordcloud
    return wc.to_image()
    

#group the data according to the histogram type is requested
def make_histograms(words_data,hist_type):
    x_data = []
    y_data = []
    results = {}
    
    #here words_data contain all the tweets
    if hist_type=='week':
        title = ''
        x_label = 'Days'
        y_label = 'Number of tweets found'
        for tweet in words_data:
            data = tweet['data']
            if data in results:
                results[data]+=1
            else:
                results[data]=1
        
        x_data = list(results.keys())
        y_data = list(results.values())
    #here words_data contain the words with their percentage of usage
    else:
        title = ''
        x_label = 'Most typed words'
        y_label = '% of occurrences of words'
        x_data = list(words_data.keys())
        #get all the frequencies in percentage
        for word in x_data:
            y_data.append(round(words_data[word]*100))

    return draw_histogram(x_data,y_data,title,x_label,y_label)

# Lock to not allow concurrent usage of matplotlib
plt_lock = threading.Lock()

#create the histogram
def draw_histogram(x_data,y_data,title,x_label,y_label):
    # acquire the lock to ensure matplotlib is being used only once
    if not plt_lock.acquire(True, 10):
        return None

    try:
        #set size(in inches) and colors
        plt.figure(figsize=(6.4,4.8))
        plt.rcParams['axes.facecolor']='#FFFFFF' #sfondo bianco
        plt.rcParams['axes.edgecolor']='#000000' #assi neri
        plt.rcParams['figure.facecolor']='#FFFFFF' 
        plt.rcParams['savefig.facecolor']='#FFFFFF'
        plt.rcParams['font.size'] = '12'
        plt.bar(x_data,y_data,width=0.45,color="#004085",edgecolor="#004085") #caratteristiche delle barre
        plt.xticks(rotation=30)

        #add labels and title to the histogram
        if x_label and y_label:
            plt.xlabel(x_label)
            plt.ylabel(y_label)
        if title: plt.title(title)
            
        plot_img = BytesIO()
        plt.savefig(plot_img,format='png',dpi=80,bbox_inches='tight')
    finally:
        plt_lock.release()
    
    return Image.open(plot_img)