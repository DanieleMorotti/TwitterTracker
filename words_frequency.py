from wordcloud import WordCloud
from stop_words import get_stop_words
import matplotlib.pyplot as plt
import string

#Create a list with word and frequency
def get_words_frequency(tweets, word_count):
    words = []
    
    stopwords = get_stop_words('italian')
    stopwords += get_stop_words('english')
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
    make_wordcloud(result)
    return result

#Wordloud
def make_wordcloud(words):
    wordcloud = WordCloud(width = 800, height = 800, 
                background_color ='white',  
                font_path = 'static/fonts/seguiemj.ttf',
                min_font_size = 10).fit_words(words).to_image()
    wordcloud.save('wc.png')
