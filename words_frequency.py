from wordcloud import WordCloud, ImageColorGenerator
from stop_words import get_stop_words
from scipy.ndimage import gaussian_gradient_magnitude
from PIL import Image
import string
import numpy
import os
import time
MAX = 100
#Create a list with word and frequency
def get_words_frequency(tweets, word_count):
    words = []
    stopwords = get_stop_words('italian')
    stopwords += get_stop_words('english')
    stopwords += get_stop_words('spanish')
    stopwords += get_stop_words('french')
    stopwords += get_stop_words('german')
    stopwords += get_stop_words('hungarian')
    stopwords += get_stop_words('polish')
    stopwords += get_stop_words('portuguese')
    stopwords += get_stop_words('dutch')
    stopwords += get_stop_words('czech')
    stopwords += get_stop_words('bulgarian')
    stopwords += get_stop_words('finnish')
    stopwords += get_stop_words('norwegian')
    stopwords += get_stop_words('swedish')
    stopwords += get_stop_words('romanian')
    stopwords += get_stop_words('russian')

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
 
    #MAX è il numero di parole nella wordcloud
    MAX = word_count = min(len(items), word_count)
    items = items[0 : word_count]
    
    total_count = 0

    for (w, c) in items:
        total_count += c
    result = {}

    for (w, c) in items:
        result[w] = c/total_count
    return result


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
            max_words=MAX)
    wc.fit_words(words)
    
    colors = ImageColorGenerator(mask_color)
    wc.recolor(color_func=colors)
    
    #Return a PIL image of the wordcloud
    return wc.to_image()
    
    # save_folder = 'static/pil'
    # if not os.path.exists(save_folder):
    #     os.mkdir(save_folder)
    
    # save_path = os.path.join(save_folder, 'wordcloud.png')
    # wc.to_file(save_path)
    # return time.time()   
