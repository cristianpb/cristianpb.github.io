---
layout: post
title: "Chatbots"
date: 2018-04-30
description: "Chatbos"
categories: ["d3.js", "dc.js", "visualization"]

---


<iframe
    width="350"
    height="430"
    src="https://console.dialogflow.com/api-client/demo/embedded/01fe3d4f-c601-43f5-b4e5-4b393c0d98ca">
</iframe>

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


<br>

{:.title}
## Conclusion

The final interactive visualization is available [in this block
link](https://bl.ocks.org/cristianpb/raw/f623461c406020eef068c1e4ecc6313f/)
