---
layout: post
title: "Search posts functionality in AMP static website make with Jekyll"
date: 2020-04-06
description: Good web reference is related with how fast your web page loads. Google works in a web format called AMP, which makes loading pages faster but also imposes some restrictions, like no external javascript. It's not simple to add API calls in AMP so this post shows how to implement a search fonctionality in a static page.
categories:
  - programming
tags: amphtml jekyll bulma
video: true
image:
  path: /assets/img/amp-search-jekyll/main-16x9.jpg
  height: 788
  width: 1400
thumb:
  path: /assets/img/amp-search-jekyll/main-thumb.jpg
  height: 200
  width: 300

---

The dream of every web page is to appear naturally in the first place of the
Google search bar.
Google's sorting algorithm takes into account the structure of the page, the
metadata, the contents of the page,  the mobile compatibility and also how fast the
page loads.
Google works in a web standard called AMP, which imposes some restrictions to
the web page, but also guaranties fast page loading.

These restriction are:
* **No external js**: Only AMP components are allowed
* **No external css stylesheet**: Only in-line minified css at the header which can't exceed 50kb.
* External fonts calls are allowed but only from some CDN.

Not having external javascript calls makes really difficult to include some
dynamic functionalities like fetching external content or calling API services.
It's the case for a search bar which needs to fetch some content and render
the results.
This gets more complicated for static web content that it's hosted in servers
like Netlify, Gitlab or Github Pages. These options don't provide any
backend and thus no dynamic content.

Even if it seems complicated, it's not impossible. One can adapt a website to AMP format and include dynamic functionalities.
For example, this post shows how to implement a javascript calls in AMP pages
and implement a search bar which allows searching for content in a static
website hosted in Github pages.

<center>
<amp-img src="/assets/img/amp-search-jekyll/main-16x9.jpg" width="1400" height="788" layout="intrinsic" alt="amp search in jekyll"></amp-img>
<br><i>AMP search bar integration in static website made with Jekyll</i>
</center>

## Static API

There are various alternatives to integrate a search function in a static website:
* Client side options like [Lunr.js](https://www.npmjs.com/package/lunr) or [SimpleJekyllSearch](https://github.com/christian-fei/Simple-Jekyll-Search) provide some javascript functions to search indexed content, but these are not compatible with AMP because of the external javascript libraries restriction.
* Services like Algolia, Swifttype or Google's Custom Search Engine, which uses external API services, but which are not compatible with AMP due to CORS endpoint restrictions.

I personally prefer the approach from SimpleJekyllSearch which exposes an
endpoint with the posts information and which can be then used in AMP
components. 
The front-matter tells Jekyll that is a special page so it takes into account
the defined parameters in order to render it.
The front-matter defines the following properties:
* **limit**, which is used to limit the number of posts that will be iterated in the loop. 
* **permalink**, to overwrite the default URL of the file, so the endpoint can be found at the URL `/api/github-pages.json`.

Jekyll allows looping over the posts using the `site.posts` array and get data from each post.
Here's how my endpoint file looks:

{% raw %}
```yaml
---
limit: 100
permalink: /api/github-pages.json
---
[{% for post in site.posts limit: page.limit %}{"title": "{{ post.title }}", "description": "{{ post.description }}", "image": "{{ post.image.path }}", "thumb": "{{ post.thumb.path }}", "date": "{{ post.date | date: "%B %d, %Y" }}",{% if post.source %}"source": "{{ post.source }}",{% endif %}{% if post.link %}"link": "{{ post.link }}",{% endif %}{% if post.categories %}"categories": [{% for category in post.categories %}"{{ category }}"{% if forloop.last %}{% else %},{% endif %}{% endfor %}],{% endif %}{% if post.categories == nil %} "categories"  : [],  {% endif %} "url": "{{ post.url }}", {% if post.tags %}"tags": [{% for tag in post.tags %}"{{ tag }}"{% if forloop.last %}{% else %},{% endif %}{% endfor %}]{% endif %}{% if post.tags == nil %}"tags": []{% endif %}}{% unless forloop.last %},{% endunless %}{% endfor %}]
```
{% endraw %}

The content of the file uses the [liquid](https://shopify.github.io/liquid/) syntax to iterate between the posts. The result is an array that contains the following information for each post:
* title
* description
* image
* categories
* description

## AMP search

There are AMP components that can use the static API:
* The [amp-state]() component allows to fetch a JSON from a CORS compatibility endpoint. The fetch is done once the page load and then it's binned to the component.
* The binned element can be filtered using the [amp-bind]() component, which listen to DOM events like clicks in buttons on writing in input fields.

For example, if we define an HTML *input* element, it's possible to add a listener that takes the input value and it filters the results using some javascript functions (not all ES6 are allowed). The javascript [indexOf](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/String/indexOf) function returns an `int` larger than -1 if the input element is found, so one can use it as a simple search like this:

`allArticles.filter(a => a.title.indexOf(event.value) != -1)`

For more complex research, in multiple fields, the components looks like the following:

```html
<amp-state id="allArticles"
         src="/api/github-pages.json"></amp-state>
<input class="input" type="text" on="input-throttled:AMP.setState({filteredArticles: allArticles.filter(a => ((a.title.toLowerCase().indexOf(event.value.toLowerCase()) != -1) || (a.description.toLowerCase().indexOf(event.value.toLowerCase()) != -1) || (a.tags.join(' ').toLowerCase().indexOf(event.value.toLowerCase()) != -1) || (a.categories.join(' ').toLowerCase().indexOf(event.value.toLowerCase()) != -1) ) ), inputValue: event.value }), top-blog-page.scrollTo(duration=200)" placeholder="🔍 Search" [value]="inputValue">
```

## Render search results with AMP

AMP provides some components to process the JSON object that is binned with [amp-bind](https://amp.dev/documentation/components/amp-bind/?format=websites):
* The [amp-list](https://amp.dev/documentation/components/amp-list/?format=websites) component dynamically downloads data and creates a list of items using a template.
* The [amp-mustache](https://amp.dev/documentation/examples/components/amp-mustache) component renders and element using [mustache](https://mustache.github.io/) syntax.

### AMP lists

The *amp-list* component loads the *filteredArticles* object, the height is controlled dynamically with the number of elements in the object.

By default *amp-list* expects an object with the format `{"items": [obj1, obj2]}`,
it's possible to configure the location of the *items* list using the *items* parameter.

### AMP template

Mustache syntax allows to filter properties of the component using the conditional notation. Here are the definition of the special characters:
{% raw %}
* {{variable}}: A variable tag. It outputs the the HTML-escaped value of a variable.
* {{#section}} {{/section}}: A section tag. It can test the existence of a variable and iterate over it if it's an array.
* {{^section}} {{/section}}: An inverted tag. It can test the non-existence of a variable.
* {{{unescaped}}}: Unescaped HTML. It's restricted in the markup it may output (see "Restrictions" below).
{% endraw %}

Please note that static websites generator like Jekyll needs to escape mustache templates using
{% raw %}{ raw } and { endraw }{% endraw %} elements. Otherwise the results would not be rendered.
Here is how it look the final combination of the two elements:

{% raw %}
```html
<amp-list height="500"
         [height]="(400) * filteredArticles.length"
         layout="fixed-height"
         items="."
         src="/api/github-pages.json"
         [src]="filteredArticles"
         binding="no">
<div placeholder>Loading ...</div>
<div fallback>Failed to load data.</div>

<template type="amp-mustache">
{% raw %}
<div class="box">
 <div class="columns is-multiline">
   <div class="column is-3-desktop is-12-mobile">
     <a class="image" href="{{#link}}{{ link }}{{/link}}{{^link}}{{ url }}{{/link}}" data-proofer-ignore>
       <amp-img 
         width="300" height="200" 
         src="{{ thumb }}" 
         srcset="{{ thumb }} 400w, {{ image }} 900w"
         alt="{{ title }}" layout="responsive"></amp-img>
     </a>
   </div>
   <div class="column is-9-desktop is-12-mobile">
     <div class="content">
       <a class="title is-6" href="{{#link}}{{ link }}{{/link}}{{^link}}{{ url }}{{/link}}" data-proofer-ignore>{{ title }}</a>
       <p class="is-size-7">
         {{ description }}
       </p>
       <div class="tags has-addons">
         <span class="tag"><i class="fas fa-calendar-alt"></i>&nbsp;{{ date }}</span>
         {{#tags}}<a class="tag" href="/blog/tags#{{.}}" data-proofer-ignore> {{.}}</a>{{/tags}}
         {{#categories}}<a class="tag is-link" href="/blog/categories#{{.}}" data-proofer-ignore> {{.}}</a>{{/categories}}
         {{#source}}
         <span class="tag is-danger"><i class="fas fa-external-link-alt"></i>&nbsp; {{ source }}</span>
         {{/source}}
       </div>
     </div>
   </div>
 </div>
</div>
{{% endraw %}}
</template>
</amp-list>
```
{% endraw %}


The final version of the search bar can be seen in the following
video. The search bar filters the posts at every key stroke. An
additional AMP event is called to place the window at the top of the list
results and the amp list height is controlled by the number of posts that are
shown. 

The search bar is always visible using a `position: fixed` css property.
The code can be found at [the github repository of this page](https://github.com/cristianpb/cristianpb.github.io).

<amp-video width="1024"
  height="610"
  src="/assets/img/amp-search-jekyll/search.mp4"
  poster="/assets/img/amp-search-jekyll/main.png"
  layout="responsive"
  controls
  loop
  autoplay>
  <div fallback>
    <p>Your browser doesn't support HTML5 video.</p>
  </div>
</amp-video>

## Conclusions

I have found separated opinions on the effect of using AMP format.
For my personal point of view, my SEO has increased since I started using this format and also the page load speed. The AMP rules impose good web format that guaranties the best performances. The traffic data of my website can be found [this github page](https://cristianpb.github.io/analytics-google/).

AMP integrates smoothly with API endpoints defined in static website build
tools like Jekyll. The endpoint with the contents of the blog is a small json,
which can be filtered using simple javascript functions allowed in AMP.

I'm happy with the results since, the json is still very small (less than 19kb) and I think that when I write more posts I can add more advanced functions of *amp-list* to include a pagination.
