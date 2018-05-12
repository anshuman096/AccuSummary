'''
Created on May 6, 2018

@author: anshuman
'''
from flask import *
import unirest
import json
from nltk.tokenize import RegexpTokenizer
from stop_words import get_stop_words
from nltk.stem.porter import PorterStemmer
from gensim import corpora, models
import numpy as np
import gensim
from flask_cors import CORS


app = Flask(__name__)
CORS(app)

tokenizer = RegexpTokenizer(r'\w+')
# create English stop words list
en_stop = get_stop_words('en')
# Create p_stemmer of class PorterStemmer
p_stemmer = PorterStemmer()


def get_summary(summary_params):
    response = unirest.post("https://textanalysis-text-summarization.p.mashape.com/text-summarizer", 
        headers = {
            "X-Mashape-Authorization":"dVEjGnG8JqmshWGKaVcoVc7BMtTgp1zNkodjsnxP5u9O8fpt6t", # unsure if this is the right api key, get API key from Mashape
            "Content-Type":"application/json",
            "Accept":"application/json"
        },
        params = summary_params
    )
    return response.body





def get_tokens(text):
    raw = text.lower()
    tokens = tokenizer.tokenize(raw)
    #remove stop words from tokens
    stopped_tokens = [i for i in tokens if not i in en_stop]
    #stem tokens
    stemmed_tokens = [p_stemmer.stem(text) for i in stopped_tokens]
    #add tokens to list
    return stemmed_tokens





def get_differences(original, summary, corpus):
    original_topics = original.get_document_topics(corpus[0])
    summary_topics = summary.get_document_topics(corpus[1])
    differences = []
    for i,j in zip(original_topics, summary_topics):
        difference = abs(i[1] - j[1])
        differences.append(difference)
    return differences




@app.route('/summarize', methods=['POST'])
def summarize():
    indata =  request.json
    print json.dumps(indata)
    params = {
        "url": indata['url'],
        "text": indata['text'],
        "sentnum": indata["sentnum"]
    }
    params_json = json.dumps(params)
    loaded_params = json.loads(params_json)
    original = loaded_params["text"]
    summary = get_summary(params_json)
    # summary = {"sentences": []}
    # summary["sentences"].append("Automatic summarization is the process of shortening a text document with software, in order to create a summary with the major points of the original document. Automatic data summarization is part of machine learning and data mining. The main idea of summarization is to find a subset of data which contains the information of the entire set. There are two general approaches to automatic summarization: extraction and abstraction. Extractive methods work by selecting a subset of existing words, phrases, or sentences in the original text to form the summary. In contrast, abstractive methods build an internal semantic representation and then use natural language generation techniques to create a summary that is closer to what a human might express.")
    print original
    print summary
    texts = []
    original_tokens = get_tokens(params["text"])
    summary_tokens = get_tokens(summary["sentences"][0])
    
    texts.append(original_tokens)
    texts.append(summary_tokens)

    dictionary = corpora.Dictionary(texts)
    corpus = [dictionary.doc2bow(text) for text in texts]

    original_lda = gensim.models.ldamodel.LdaModel([corpus[0]], num_topics = 6, id2word = dictionary, passes = 30)
    summary_lda = gensim.models.ldamodel.LdaModel([corpus[1]], num_topics = 6, id2word = dictionary, passes = 30)

    topic_differences = get_differences(original_lda, summary_lda, corpus)
    mean_score_raw = np.mean(topic_differences)
    percentage = (1 - mean_score_raw) * 100
    #return render_template("display.html", summary=summary, percentage=percentage)
    rData = { "summary" : summary, "percentage" : percentage }
    return json.dumps(rData)

@app.route('/')
def index():
    return render_template("index.html") #index.html can be modified to make front page look better


if __name__ == '__main__':
    app.run(debug=True)
    
