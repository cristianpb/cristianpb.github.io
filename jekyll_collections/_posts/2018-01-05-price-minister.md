---
layout: post
title: "Price minister NLP project"
date: 2018-01-05
description: "This projects uses NLP to classify a user review as useful or not useful. Best practices for a data science project such as document structure, documentation and virtual environment are used"
categories:
  - data science
  - programming
tags: ["nlp", "python", "cookie-cutter", "sphinx"]
image:
  path: /assets/img/priceminister/main-4x3.jpg
  height: 1050
  width: 1400
thumb:
  path: /assets/img/priceminister/main-thumb.jpg
  height: 200
  width: 300

---

This post explains my solution for a data science competition on NLP. I use best practices for organization and documentation in a data sicence project. The competition was hosted by 
[ChallengeData.ens.fr](https://challengedata.ens.fr).
The partner for this competition was French company Price Minister, a 
subsidiary of the Rakouten Group, a major e-commerce player.

The goal of this challenge was to predict if a review of a user on a given 
product may be useful for others. The results from this challenge help to rank 
and filter the millions of reviews on PriceMinister, in order to increase the 
quality of user experience.

All the data is in French.  This is a binary classification problem, evaluated 
trough AUC metric. 

## Data exploration

For each user review we dispose information about **the content**, **the title**, **the numbers of stars** given to the product, the **hashed product id** and depending on the dataset a binary label that means if the review is consider useful or not. I dispose a sample of 60000 reviews with a label to train my model and 20000 reviews without label to test my model. 

ID| 	review_content |	review_title 	|review_stars 	|product 	|Target
---|---|---|---|---|---
0 	|En appelant un acheteur pour demander si l'écr... 	|La Police s'inscrit en acheteur privé sur Pric... 	|5 	|2fbb619e36cda771aa2c47ce50d5... 	|0
1 	|Alors, là, on a affaire au plus grand Navet ja... 	|Chef D'Oeuvre Absolu en vue... 	|5 	|7b56d9d378d9e999d293f3019afb... 	|1
2 	|Effet garanti sur la terrase. Ils donnent immé... 	|Effet garanti sur la terrase. Ils donnent immé... 	|3 	|7b37bf5dcb2fafd11a04ca36893c... 	|0
3 	|tres bon rapport qualite prix tre pratique en ... 	|bon produit 	|4 	|77d2dbd504b933ab3aaf7cb0cf88... 	|1
4 	|Ordinateur de bureau trés bien pour quelqu'un ... 	|Apple Power MAC G4 	|3 	|f574512e7d2dd1dd73c7f8f804bf... 	|1

The two labels are well represented and there is only a small percentage difference between the two. Same thing happen for the number of stars given to the product, each class has a representative number of 1 and 0 labels. There are more positive ratings for products, I guess the articles sell at Price Minister are very good

<amp-img src="/assets/img/priceminister/classes.png" alt="Number of classes" height="100" width="300" layout="responsive"></amp-img>

### Product reviews

There are some products that have several reviews. There is one product with 138 reviews, other with 115, other with 45, etc. At the end there are 19932 products with more than one review and 40068 with just one review. It doesn't seems to be a great correlation between useful reviews and the number of reviews of the article, the mean number of reviews for useful articles is 1.32 and 1.13 useless articles.

<amp-img src="/assets/img/priceminister/product_review.png" alt="Number of product reviews" height="150" width="300" layout="responsive"></amp-img>

### Review size

The review size has a bigger importance. The longer reviews tend to be more useful and shorter reviews are usually useless. However there is no big influence regarding the size of the title of the review.

<amp-img src="/assets/img/priceminister/review_size.png" alt="Size of the review" height="100" width="300" layout="responsive"></amp-img>

### Word number

The words of the review for each label are very similar. It is very difficult to difference a useful review just by counting the words that it contains. In addition, words like *c'est* doesn't give to much sense to the document analysis.

<amp-img src="/assets/img/priceminister/word_number.png" alt="Word number" height="100" width="300" layout="responsive"></amp-img>

We clean the words by removing common French stop words.

<amp-img src="/assets/img/priceminister/word_number_cleaned.png" alt="Word number cleaned" height="100" width="300" layout="responsive"></amp-img>

### Tfidf

Since the number of words doesn't give us to much information, we use instead **tfidf** (term frequency–inverse document frequency), which is intended to reflect how important a word is to a document in a collection. The result of **tfidf** is a score of importance for each word or combination of words. The common words that doesn't give information about the document have less score and the rare words that give much sense to a document have a higher score.  

<amp-img src="/assets/img/priceminister/tfidf_lemma.png" alt="tfidf representations of words lemma" height="100" width="300" layout="responsive"></amp-img>

The code source to make this analysis can be found at this [notebook](https://nbviewer.jupyter.org/url/github.com/cristianpb/priceminister/blob/master/notebooks/01-Exploration.ipynb).

## Feature engineering

The stars of the review are treated as categorical variables from 1-5. The review content and title are transformed using *tfidf*. The length of the review content is taken into account using integer encoding in order to keep the concept of distance between the variables.  The resulting transformations are converted to sparse matrices because they are lighter than dense matrices. 

The details of the feature engineering can be found at this [notebook](https://nbviewer.jupyter.org/url/github.com/cristianpb/priceminister/blob/master/notebooks/02-Train.ipynb).

### Word Embeddings

It is possible to transform the content reviews in embeddings representation using a pretrained model such as [FastText](https://fasttext.cc/docs/en/pretrained-vectors.html). This allows to transform a word or a sentence into a vectorial representation and also to find similarities betweend them.

I have used the facebook model *FastText* pretrained with french wikipedia pages. It is possible to test this model by a simple example: `king - men + woman`. Where the most similar word should be queen. 

```python
>>>model_fasttext = get_fasttext()
>>>result = model_fasttext.most_similar(positive=['femme', 'roi'], negative=['homme'], topn=1)
>>>print(result)
[('reine', 0.671850860118866)]
```

The result of the transformation for the review content is a vector with 300 dimensions. This can be simplified in 2D using [LDA](https://en.wikipedia.org/wiki/Latent_Dirichlet_allocation) and can be plotted as follows.

<amp-img src="/assets/img/priceminister/word_embeddings_lda.png" alt="Word embeddings" height="100" width="300" layout="responsive"></amp-img>

The details of word embeddings can be found at this [notebook](https://nbviewer.jupyter.org/url/github.com/cristianpb/priceminister/blob/master/notebooks/03-Word embeddings.ipynb).

## Modelling

One can train a binary classification model using the sparse matrix resulting from the feature engineering and also with the word embeddings. For this case I use a gradient boosting trees models XGBoost and LightGBM.
 
Model | Word Embeddings | Feature Eng
Xgboost | 0.712 | **0.719**
LightGBM | 0.704 | 0.717

I didn't spend too much time doing parameters optimization.

The resulting algorithms can be combined sing ensemble technique. I use the [ensemble function](https://github.com/abhishekkrthakur/pysembler) from Abhishek Thakur. His function trains several models using [cross validation](http://scikit-learn.org/stable/modules/generated/sklearn.model_selection.KFold.html), and them stack them together in a way that it optimizes a given function.  The result is a more robust model with the best characteristics of its components.

The details of the modelling and ensembling can be found at this [notebook](https://nbviewer.jupyter.org/url/github.com/cristianpb/priceminister/blob/master/notebooks/04-Ensembling.ipynb).

## Implementation

### Cookiecutter

The source code of my solution can be found on my [github](https://github.com/cristianpb/priceminister). The code has been organized in a modular way using [Cookiecutter for data science](https://drivendata.github.io/cookiecutter-data-science/). This solution makes a standard organization for data science projects where the functions can be placed in a `src` directory, notebooks in a `notebooks` directory with a given notation, data in a given directory, etc. 

The results are cleaner jupyter notebooks, with organized functions that can be called also from the command line. Data organized in different directories depending on the provenance. Also a standard organization that can be used for most data science projects.

### Virtualenv

The python package management is keeped clean using a virtual environement. I prefer to use [virtualenv wrapper](https://virtualenvwrapper.readthedocs.io/en/latest) since it has a higher level of abstraction of your virtual env, it place all the virtual env in one place and also you can implement rules to use a specific virtual env when you are in a directory.   


### Sphinx

Cookiecutter have also a `docs` folder, where the documentation can be placed and compiled using [Sphinx](http://www.sphinx-doc.org/en/stable/). This package can fill automatically the documentation using the docstrings inside the python code. Additionally, Sphinx documentation can be deployed using [Read the docs](https://readthedocs.org/), I test this feature as you can see [here](http://priceminister.rtfd.io/).
