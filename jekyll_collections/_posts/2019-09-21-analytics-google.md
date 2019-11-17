---
layout: post
title: "Interactive dashboard using Google Analytics, Github Actions and Dc.js"
date: 2019-09-20
description: This article shows how to use google analytics api to build a customized dashboard using javascript library dc.js and deploy them using Github Actions
categories:
  - programming
  - visualization
tags: d3.js dc.js google-analytics github-actions
image:
  path: /assets/img/analytics-google/main-crop.jpg
  height: 200
  width: 300
ligthbox: true

---

Google analytics allows to measure a website performance.
The information collected by this module allows to improve the content of a
website by giving the owner insights about:
- what are the most relevant parts of the website ;
- how people reach the website ;
- how many time people spend in the website ;
- and also the path that they follow in the website.

All this information is available in the google analytics website, where you 
can find a sort of predefined charts.  Sometimes you want to personalize this 
charts and use them at your own will.
In this article I will show you how to:
- connect to the google analytics api to fetch your analytics data ;
- make interactive charts using the popular javascript library d3.js and dc.js ;
- deploy your dashboard automatically in github pages serveless architecture by using github actions.

<center>
<amp-img src="/assets/img/analytics-google/main.jpg" alt="google analytics dashboard" height="651" width="682" layout="intrinsic"></amp-img>
<br><i><a href="https://cristianpb.github.io/analytics-google">Interactive dashboard from my google analytics data</a></i>
</center>

## Google analytics

In order to fetch your analytics data, you have to:

<div class="columns is-mobile is-multiline is-horizontal-center">

<div class="column is-6-desktop is-6-mobile">
<amp-image-lightbox id="lightbox1"
  layout="nodisplay"></amp-image-lightbox>
<amp-img on="tap:lightbox1"
  role="button"
  tabindex="0"
  aria-describedby="credentials"
  alt="Credentials google analytics"
  title="Credentials google analytics"
  src="/assets/img/analytics-google/credentials.png"
  layout="responsive"
  width="697"
  height="355"></amp-img>
<div id="credentials">
1) Create project in [Google Developers Console](https://console.developers.google.com/)
</div>
</div>

<div class="column is-6-desktop is-6-mobile">
<amp-image-lightbox id="lightbox2"
  layout="nodisplay"></amp-image-lightbox>
<amp-img on="tap:lightbox2"
  role="button"
  tabindex="0"
  aria-describedby="service_account"
  alt="Service account key"
  title="Service account key"
  src="/assets/img/analytics-google/service_account.png"
  layout="responsive"
  width="505"
  height="428"></amp-img>
<div id="service_account">
2) Create service account and download `json` key file
</div>
</div>

<div class="column is-6-desktop is-6-mobile">
<amp-image-lightbox id="lightbox3"
  layout="nodisplay"></amp-image-lightbox>
<amp-img on="tap:lightbox3"
  role="button"
  tabindex="0"
  aria-describedby="enable"
  alt="Enable google analytics api"
  title="Enable google analytics api"
  src="/assets/img/analytics-google/enable.png"
  layout="responsive"
  width="697"
  height="355"></amp-img>
<div id="enable">
3) Enable Google Analytics API
</div>
</div>

<div class="column is-6-desktop is-6-mobile">
<amp-image-lightbox id="lightbox4"
  layout="nodisplay"></amp-image-lightbox>
<amp-img on="tap:lightbox4"
  role="button"
  tabindex="0"
  aria-describedby="account"
  alt="Grant service account"
  title="Grant service account"
  src="/assets/img/analytics-google/account.png"
  layout="responsive"
  width="505"
  height="428"></amp-img>
<div id="account">
4) Grant service account to access Analytics account
</div>
</div>

</div>

All this information is also available in [analytics developer guide](https://developers.google.com/analytics/devguides/reporting/core/v4/authorization).

After downloading the `json` service account key, you can use it in python or nodejs API to fetch your data.
I used the example shown in the [google 
documentation](https://developers.google.com/analytics/devguides/config/mgmt/v3/quickstart/service-py).
I [modified the example](https://github.com/cristianpb/analytics-google/blob/master/analytics.py) to:
- save results in a `csv` file
- use a service account key in a `dict` form instead of reading it from a file. 
  This will allow us to read the token from an environment variable.

## Create a dashboard

Javascript libraries like d3 allow us to create interactive visualizations, 
where the reader is able to define his own story by making his own data 
explorations.

- import the `js` libraries in the html
- create a script section in the html for visualizations
- define the `div` place holder in the html where the figures will be drawn.


For the ones that like to see some code, here I present a simplified extraction 
from my js code to show you how it is simple to create the interactive figures.

```js
// Reading data
d3.csv("data.csv").then(function(data) {
  // Create a Crossfilter instance
  var ndx = crossfilter(data);

  // Parse date
  var dateFormatParser = d3.timeParse("%Y%m%d");
  data.forEach(function(d) {
		d.dd = dateFormatParser(d.date);
	});

  //Define Dimensions
  var countryDim = ndx.dimension(function(d) { return d["country"]; });
  var dateDim = ndx.dimension(function(d) { return d.dd; });
  var deviceDim = ndx.dimension(function(d) { return d["device"]; });
  var sourceDim = ndx.dimension(function(d) { return d["source"]; });
  var pageDim = ndx.dimension(function(d) { return d["pagePath"]; });
  var allDim = ndx.dimension(function(d) {return d;});

  //Group Data
  var countryGroup = countryDim.group().reduceSum(function (d) {
    return d["sessions"];
  });
  var dateGroup = dateDim.group().reduceSum(function (d) {
    return d["sessions"];
  });
  var deviceGroup = deviceDim.group().reduceSum(function (d) {
    return d["sessions"];
  });
  var sourceGroup = sourceDim.group().reduceSum(function (d) {
    return d["sessions"];
  });
  var pageGroup = pageDim.group().reduceSum(function (d) {
    return d["sessions"];
  });
  var all = ndx.groupAll();

  //Charts
  var countryChart = dc.rowChart("#country-chart");
  var timeChart = dc.barChart("#time-chart");
  var deviceChart = dc.pieChart("#device-chart");
  var sourceChart = dc.rowChart("#source-chart");
  var pageChart = dc.rowChart("#page-chart");
  var dataTable = dc.dataTable("#data-table");
  var numberRecordsND = dc.numberDisplay("#number-records-nd");

  // Count the number of records
  numberRecordsND
    .formatNumber(d3.format("d"))
    .valueAccessor(function(d){return d; })
    .group(all);

  // Country chart
  countryChart
    .width(300)
    .height(400)        
    .margins({top: 10, right: 50, bottom: 30, left: 40})
    .dimension(countryDim)
    .group(filter_countryGroup)
    .cap(10)
    .ordering(function(d) { return -d.value })
    .elasticX(true);

  // ....

  // Draw all the charts
  dc.renderAll();
});
```

In a few words:
- Read data from a `csv` file (other formats can be used `csv`, `json`, `tsv`, ..) ;
- Create a crossfilter instance from the data. Using this, the filter used in 
  one graph would be applied to all of the graphs that use the same crossfilter 
  ;
- Create dimensions using different available variables, like date, device, etc ;
- Group data using dimensions an reducing using a defined parameter. I used the number of sessions.


## Github Actions

Deploying the code in github pages allows to deploy static page and removes 
completely the server dependency. In addition github actions allows to have a 
complete CI/CD that can be configured in a `yaml` file like the following:

{% raw %}
```yaml
on:
  schedule:
    # * is a special character in YAML so you have to quote this string
    - cron:  '57 23 * * *'

jobs:
  publish:
    name: Publish github pages
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v1
      - name: Set up Python 3.7
        uses: actions/setup-python@v1
        with:
          python-version: 3.7
      - name: install requirements
        run: make venv
      - name: get data
        run: make data
        env:
          TOKEN: ${{ secrets.TOKEN }}
      - name: build html
        run: make build
      - name: deploy
        uses: docker://peaceiris/gh-pages:v2.3.2
        if: success()
        env:
          ACTIONS_DEPLOY_KEY: ${{ secrets.ACTIONS_DEPLOY_KEY }}
          PUBLISH_BRANCH: gh-pages
          PUBLISH_DIR: ./dist
```
{% endraw %}

In this way, I will:
- fetch the data everyday in order to keep an updated dashboard and copy it to 
  the `dist` folder ;
- render my html and copy it to the `dist` folder ;
- copy my `js` script to the `dist` folder ;
- copy my `dist` folder to the `gh-pages` branch so that github can publish it in github-pages. I use [@peaceiris github action](https://github.com/peaceiris/actions-gh-pages) to publish to github-pages.

This file is put in the `.github/workflows` folder. It's automatically taken
into account if you have github actions active for you account. It's still in
beta phase but it will be released to the public in November 2019.

## Conclusions

Github actions are a great way to publish content in a serverless architecture.
It's schedule option opens great opportunities like the ones published in their
[repository](https://github.com/sdras/awesome-actions).

The interactive dashboard uses only `div` elements in the html page. The
frontend part can be controlled from libraries such as [bulma](http://bulma.io) in order to create
responsive designs.

From my dashboard I can conclude that people visit mostly:
- my [image rotation article](https://cristianpb.github.io/blog/image-rotation-opencv) is one of the most popular articles. It's because I wrote the article to solve a [stackoverflow question](https://stackoverflow.com/questions/42354804/find-x-y-rotated-coordinates-locations-in-image-opencv-python/47956005#47956005) and put the link to my article there. Stackoverflow is a very popular website!
- my [ssd yolo article](https://cristianpb.github.io/blog/ssd-yolo) is very popular too. It's because deep learning applications are a big hype right now, so I get a lot of organic traffic coming mostly from google. My website is well ranked by google search algorithm, I think [AMP standard](https://cristianpb.github.io/blog/bulma-amp) helps a lot.
- People visit mostly form desktop devices, but that may change in the future.  
  I let you have your own conclusions by exploring the chart by yourself at 
  [this page](https://cristianpb.github.io/analytics-google) 

As always, the code is available at [github](https://github.com/cristianpb/analytics-google). Don't forget to 🌟.
