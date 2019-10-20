---
layout: post
title: "Interactive data exploration using Dc.js"
date: 2018-02-18
description: "Interactive visualizations allows the reader to explore data for differents points of views. Javascript library Dc.js allows to combine multi variable firlters to the analysis."
categories: ["d3.js", "dc.js", "visualization", "bulma"]
image:
  path: /assets/img/dashboard-dc-js/main-crop.png
  height: 200
  width: 300

---

Interactive visualizations are a great alternative to static figures for data
analysis. The reader is able to define his own story by making its own
explorations and get its own conclusions. In this post I show a simple way to
get interactive visualization using javascript functions [dc.js](https://dc-js.github.io/dc.js/).

<amp-img src="https://gist.githubusercontent.com/cristianpb/f623461c406020eef068c1e4ecc6313f/raw/8ebd799fc42059fcd4b1163c96a66dd538013963/preview.png" alt="Preview of dc js dashboard" height="500" width="900" layout="responsive"></amp-img>

The code can be found at the following [gist](https://bl.ocks.org/cristianpb/f623461c406020eef068c1e4ecc6313f)
and the visualization is available [at this link](https://bl.ocks.org/cristianpb/raw/f623461c406020eef068c1e4ecc6313f/).
The visualization have to main files:
  * **index.html** that contains the front end of the visualization
  * **graph.js** that contains all javascript that runs the interactive components


## Front

I used [bulma.io](https://bulma.io/) css framework to set the differents charts
in a responsive way. This framework provides a **tiles** disposition to create
a grid of content. 

The structure of the grid in terms of bulma instructions is the following:

```
tile is-ancestor
|
├───tile is-vertical is-8
|   |
|   ├───tile
|   |   |
|   |   ├───tile is-parent is-vertical
|   |   |   ├───tile is-child
|   |   |   └───tile is-child
|   |   |
|   |   └───tile is-parent
|   |       └───tile is-child
|   |
|   └───tile is-parent
|       └───tile is-child
|
└────tile
    |
    ├───tile is-parent
    |   └───tile is-child
    |  
    └───tile is-parent
        └───tile is-child
```



## Back 

The `div` elements that are inside the tiles are created using the `graph.js`
file. This file uses [d3.queue](https://github.com/d3/d3-queue) to load the
json file `./df.json` using
[d3.json](https://github.com/d3/d3-request/blob/master/README.md#json) function
and wait until it finish to execute the function **makeGraphs**. 

The function **makeGraphs**:
  * Parses date time data
  * Creates a [crossfilter](https://square.github.io/crossfilter/) and add the records. A filter represents a multidimensional dataset. 
  * Definition of the dimension of the crossfilter.
  * Groups data on each dimension.
  * Define the charts and the id to be used in the html file.
  * Update the heatmap if any dc chart get filtered

The barplots are made using standard dc.js api. They are connected through
crossfilter.js so when each dimension each filter, the results can be see in
the other dimensions. In addition, the Leaflet map is connected to the charts
so when one chart is filtered, the results are shown in the heatmap.


## Conclusion

The final interactive visualization is available [in this block
link](https://bl.ocks.org/cristianpb/raw/f623461c406020eef068c1e4ecc6313f/)
