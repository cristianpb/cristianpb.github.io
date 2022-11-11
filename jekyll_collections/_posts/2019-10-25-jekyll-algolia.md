---
layout: post
title: "Algolia search engine in Jekyll static pages"
date: 2019-10-25
description: This article shows how to implementent Algolia searching engine in a static website and update the entries using Github Actions.
categories:
  - programming
tags: jekyll algolia github-actions bulma
image:
  path: /assets/img/jekyll-algolia/main-16x9.jpg
  height: 788
  width: 1400
thumb:
  path: /assets/img/jekyll-algolia/main-thumb.jpg
  height: 200
  width: 300

---

Static webpages are very popular these days, they are used to deploy showcase
websites that contains only `html` and don't need a backend server.

The lack of backend server simplifies a lot the infrastructure
to deploy the website and now a days you can deploy for free these kinds of
pages in places like github, gitlab, netlify and more.

This is what I have done to write this blog, 
which lead me to write more than 30 articles until know.
Having a lot of information also implies a need to organised them, which I have
done using categories and tags but it has been difficult to search for a
particular article just by having the categories.

So I decided to add a search engine to my blog using Algolia API.

<center>
<amp-img src="/assets/img/jekyll-algolia/main.jpg" width="800" height="420" layout="intrinsic"></amp-img>
<br><i>This article shows how to combine Algolia search API with Jekyll and Github Actions</i>
</center>

## Search engine for static webpages

There are two ways to implement a search engine:
- having a *backend* server that fetch the data and calculates the recommendation or 
- using a *frontend* application to filter data on the client side.

The advantage of using a frontend application to filter data is the fact that
you don't need a backend service, so it works well with static sites. However,
if your data is heavy, it may decrease the web navigation performance. 
A popular example of search engine on client side is [lunr.js](https://github.com/olivernn/lunr.js).

The backend service is then a more robust solution that can scale with your data.
Some examples of engines that can be used for backend search engines are Apache
SolR or Elasticsearch. 

I wanted to have the advantages of both of them, having an scalable, fast and light search solution,
so I decided to use Algolia search engine.

### Why Algolia ?

Algolia offers a hosted search engine capable of delivering real-time results
from the first keystroke. You can load data in text and numerical format,
Algolia indexes data in a backend service. In addition Algolia also provides an
API to query your data and obtain relevant results in under 100ms anywhere in
the world.

You don't have to worry about hosting an backend server and you can fetch data
in the frontend in a fast and scalable way.

There are two ways to communicate with Algolia:
1. **the backend**: to push your data to Algolia service.
2. **the frontend**: the php or javascript libraries that is executed in the client side to fetch your search results.

## Algolia Jekyll 

For the backend service, in a static website context, most applications provide utilities to push your records to Algolia using [Hugo](https://github.com/replicatedhq/hugo-algolia), [Jekyll](https://github.com/algolia/jekyll-algolia) or [Pelican](https://devops.datenkollektiv.de/finally-pelican-with-algolia-search.html).
In Jekyll, you can install the package [jekyll-algolia](https://github.com/algolia/jekyll-algolia) by adding the following to your `Gemfile`:

```ruby
# Gemfile

group :jekyll_plugins do
  gem 'jekyll-algolia', '~> 1.0'
end
```

Then download all the dependencies using `bundle install`and push
information about your html files using the command `bundle exec jekyll algolia`. This package sends the structured data from your `html`/`md` like title, description, image, categories, tags, content, etc.

You can customize the information that you want to send in your `_config.yml` file as stated in the [jekyll-algolia documentation](https://community.algolia.com/jekyll-algolia/options.html). For example, I exclude pages from my home page and drafts.

## Github Actions for Algolia CI

Even if pushing data to Algolia is very simple with the jekyll plugins, there
is nothing like having a continuous integration service that do it automatically
for you.

Since my blog is already in github, I chose [Github Actions](https://github.com/features/actions) to leverage this action for me. I just have to create the following `yaml` in the `.github/workflows` folder:

{% raw %}
```yaml
# .github/workflows/jekyll-algolia.yml
on: [push]

jobs:
  build:
    name: Algolia push records

    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v1
      - name: Set up Ruby 2.6
        uses: actions/setup-ruby@v1
        with:
          ruby-version: 2.6.x
      - name: Install dependencies and push records
        run: |
          gem install bundler
          bundle install --jobs 4 --retry 3
          bundle exec jekyll algolia
        env:
          ALGOLIA_API_KEY: ${{ secrets.ALGOLIA_API_KEY }}
```
{% endraw %}

As you can see it this will install the dependencies and launch the command to push the data to Algolia. Please note that the `ALGOLIA_API_KEY` needs to be defined in the github secrets.

## Frontend application

Algolia offers multilingual implementation to query their API. I chose the vanilla [instantsearch.js](https://www.algolia.com/doc/guides/building-search-ui/getting-started/js/) to adapt the elements with the [bulma css](https://bulma.io) that I use in my website.

In order to add a functional search bar I need to put an `input` and `hits` elements in the html page and add a javascript function to render them:


```javascript
// Listen changes from input element
search.addWidget({
  init: function(opts) {
    const helper = opts.helper;
    const input = document.querySelector('#searchBox');
    input.addEventListener('input', function(e) {
      helper.setQuery(e.currentTarget.value) // update the parameters
            .search(); // launch the query
    });
  }
});

// Render results in hits element
search.addWidget({
  render: function(opts) {
    const results = opts.results;
    // read the hits from the results and transform them into HTML.
    document.querySelector('#hits').innerHTML = results.hits.map(function(h) {
      let formattedTime = date_unix_str(h.date);
      let external_tag = ('link' in h) ? `<span class="tag is-danger"><i class="fas fa-external-link-alt"></i></span>`: '' ;
      let img_template = '';
      if ('image' in h) {
        img_template = `
      <div class="card-image">
        <figure class="image">
          <a href="${('link' in h) ? h.link : h.url}">
            <center>
              <amp-img src="${h.image.path}" width="368" height="245" alt="${h.title}" layout="intrinsic"></amp-img>
            </center>
          </a>
        </figure>
      </div>`
      } 

      return `
    <div class="column is-one-third">
      <div class="card">` + img_template  + `
        <div class="card-content">
          <div class="media apretaito">
            <div class="media-content">
              <a href="${('link' in h) ? h.link : h.url}" ${('link' in h) ? "target=\"_blank\"" : ''} class="title is-4">${h.title}</a>
            </div>
          </div>
          <div class="content apretaito">
            <p>
              ${h.description}
            </p>
            <div class="tags has-addons">
              <span class="tag">
                <i class="fas fa-calendar-alt"></i>&nbsp;${ formattedTime }
              </span>
              <span class="tag is-link">
                ${ h.categories.join(", ")}
              </span>` + external_tag + `
            </div>
          </div>
        </div>
      </div>
    </div>`
    }).join('');
  }
});
```

The rest of the code can be found at the [github page of my website](https://github.com/cristianpb/cristianpb.github.io). There, you can find some extra functionalities like pagination buttons.

Instantsearch.js queries the API at every key stroke, which gives the impression of having the results on real time. You can try it at [cristianpb.github.io/blog](https://cristianpb.github.io/blog).

<center>
<amp-img src="/assets/img/jekyll-algolia/algolia-search.jpg" width="800" height="420" layout="intrinsic" alt="algolia search bar"></amp-img>
<br><i>The search bar returns results in real time</i>
</center>

## Conclusions

Searching for content in my blog is now easy thanks to Algolia search engine and it's free for the moment. I have a developer account which lets me save 10k records and do 50k indexing operations. Today I have 35 post entries, which results in 320 records ~= 3% of record utilisation. So I think I have plenty of time to use Algolia in my blog.

Github Actions automatically syncs records to Algolia at every push. Even if this can be done with other services like CircleCI or TravisCI, I prefer to keep all in one service.

One inconvenient that I have found is the fact that using `instantsearch.js` breaks AMP compatibility because AMP doesn't allow to have custom javascript code in the webpage. For information AMP standard are some Google norms that certifies that your page is optimized, you can find more information about AMP in one of my other articles.
