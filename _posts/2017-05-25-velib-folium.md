---
layout: post
title: "Analysis of Paris bike systems Velib"
date: 2017-05-25
description: "This post shows how to query data from Paris Open Data base, make some geographical plots using folium and also some analysis about the bike utilisation depending on the date"
categories: ["folium", "python", "Open Data"]
chartjs: true
image: /assets/img/velib-folium/main.jpg

---

Paris Open Data platform proposes databases of the bike rental system [Velib](http://en.velib.paris.fr/). They propose an API to download the data in real-time. The file can be obtained using a http query to the [API](https://opendata.paris.fr/explore/dataset/stations-velib-disponibilites-en-temps-reel/) and saved in `csv` or `json` format.
We will use `python` in this post to obtain some insights about the rental systems.

## Obtaining the data

```python
import requests
response = requests.get("http://opendata.paris.fr/api/records/1.0/download/?dataset=stations-velib-disponibilites-en-temps-reel&facet=banking&facet=bonus&facet=status&facet=contract_name&rows=-1")
txt = response.text
f = open('velib.csv', 'w+')
f.write(txt)
```

The file contains information about the number, the name, the address and the position of the station. In addition, it also has information about the number of available bikes and the number of stands for each station. This information can be used to have a global view of the rental systems. The complete information of the file is shown below.

```python
import pandas as pd
velibs = pd.read_csv("velib.csv", sep=";")
velibs.head()
```


```
-   | number | name                         | address                                    | position                     | banking | bonus | status | contract_name | bike_stands | available_bike_stands | available_bikes | last_update               |
--- | ---    | ---                          | ---                                        | ---                          | ---     | ---   | ---    | ---           | ---         | ---                   | ---             | ---                       |
0   | 5035   | 05035 - BUFFON AUSTERLITZ    | 1 RUE BUFFON - 75005 PARIS                 | 48.8431581782, 2.36374844464 | True    | False | CLOSED | Paris         | 24          | 0                     | 0               | 2017-04-20T06:58:24+00:00 |
1   | 5104   | 05104 - BUFFON               | 47 RUE BUFFON - 75005 PARIS                | 48.8419161798, 2.35891268132 | True    | False | CLOSED | Paris         | 55          | 0                     | 0               | 2017-04-20T07:56:57+00:00 |
2   | 8034   | 08034 - HAUSSMANN COURCELLES | 49 RUE DE BERRI - 75008 PARIS              | 48.87481039, 2.30831406419   | True    | False | OPEN   | Paris         | 34          | 25                    | 9               | 2017-05-06T21:14:59+00:00 |
3   | 22407  | 22407 - BARBUSSE (MALAKOFF)  | ROND POINT HENRI BARBUSSE - 92240 MALAKOFF | 48.8146796589, 2.28740045741 | True    | True  | OPEN   | Paris         | 25          | 20                    | 4               | 2017-05-07T01:09:16+00:00 |
4   | 19116  | 19116 - JAURES VILLETTE      | 180 BOULEVARD DE LA VILLETTE - 75019 PARIS | 48.8814724985, 2.37026248226 | True    | False | CLOSED | Paris         | 30          | 0                     | 0               | 2017-05-07T01:20:16+00:00 |
```

We will focus only in the open stations by using the following command: 

```python
velibs = velibs[velibs.status == 'OPEN']
```

## Number of bike stands per _arrondisement_

The number of arrondisement can be obtained from the address of station. We
will focus only on the stations that are in Paris, which means that has a
zip code beginning with 75. We can simply do that using the following command:  

```python
velibs['arron'] = velibs['address'].map(lambda x: int(x.split()[-2][3:]) if x.split()[-2][:2] == '75' else np.NaN)
```

Then we can group the number of bike stands by each arrondisement.

```python
bike_stands_arron = velibs.groupby('arron')['bike_stands'].sum()
```

This information can be bind to a geojson file that contains the coordinates of each _arrondisement_. This information has been 
posted in [github](https://github.com/codeforamerica/click_that_hood/raw/master/public/data/paris.geojson).
We can use [Folium](https//github.com/python-visualization/foliumm) to plot this information using the following command:

```python
# https://github.com/codeforamerica/click_that_hood/raw/master/public/data/paris.geojson
state_geo = r'paris.json'

m = folium.Map(location=[48.856614, 2.3522219], zoom_start=13, tiles='Stamen Toner')
m.choropleth(geo_path=state_geo, 
             data=bike_stands_arron,
             columns=['arron', 'bike_stands'],
             key_on='properties.cartodb_id',
             fill_color='YlGn', 
             fill_opacity=0.9, line_opacity=0.2,
             legend_name='Number of bike stands',
             highlight=1)
m
```



<amp-iframe width="100" height="70" sandbox="allow-scripts" layout="responsive" src="/iframes/folium-arrondisement"></amp-iframe>

We can see graphically that the 15th arrondisement has more bikes than any
other. It is mainly because it is bigger than other arrondisements.

## Available bikes 

We can normalize the number of available bikes using the total number of bikes for each station. This give information if the station is relatively empty or not.
We can plot this information directly to a map using the coordinates of the station and a function that colours the station to red if the station is empty and green if the station is full.

```python
from colour import Color
red = Color("red")
colors = list(red.range_to(Color("green").hex,10))
def red(brightness):
    brightness = int(round(9 * brightness)) # convert from 0.0-1.0 to 0-255
    return colors[brightness]
m = folium.Map(location=[48.856614, 2.3522219], zoom_start=13, tiles='Stamen Toner')

for k,v in velibs.iterrows():
    folium.CircleMarker(location=[v.position.split(",")[0], v.position.split(",")[1]], 
                        fill_color=red(v.available_bikes/float(v.bike_stands)).hex,
                        popup= str(v.available_bikes) + " / " + str(v.bike_stands),
                        radius=7).add_to(m)
```


<amp-iframe width="100" height="70" sandbox="allow-scripts" layout="responsive" src="/iframes/folium-available"></amp-iframe>


Each point can be clicked to obtain more information about the station.  Using
this information over different times, we can see that during the night, there
are a lot of available bikes near the outer ring of Paris and a few in the
inner side of Paris, near Châtelet.
On the opposite, at 8am, a lot of people take the bikes on the outer ring and
they tend to go to the inner side of Paris.


<amp-video width="1280"
  height="720"
  src="/assets/img/velib-folium/anim.webm"
  poster="/assets/img/velib-folium/main.jpg"
  layout="responsive"
  controls
  loop
  autoplay>
  <div fallback>
    <p>Your browser doesn't support HTML5 video.</p>
  </div>
</amp-video>


## Bike utilisation by hour

Using an scheduler [cron](https://en.wikipedia.org/wiki/Cron) task, we can
obtain information about the evolution of the bike utilisation. For this case,
download the information each hour. 

Since we do not have any information about the actual number of rent bikes, we
can use the number of available bikes in each station and calculate the difference 
in a certain time range. 
I take into account only when the bikes are added to the stations to avoid
counting twice the utilisation of a bike (i.e when a bike is taken from a
station and put in an other station we have +1, -1 for each station
respectively)

<amp-iframe width="100" height="85" sandbox="allow-scripts" layout="responsive" src="/iframes/velib-hour"></amp-iframe>

During weekdays, there is a peak of utilisation at 8am and 7pm. When people is going to work. 
The peak of utilisation is 4552 bikes, which is around  30 % of the available bikes in the city (~15593).
On weekend, the peak is at 6pm, maybe because people is coming back home.

The complete code can be found at in [this
notebook](https://nbviewer.jupyter.org/url/cristianpb.github.io/assets/img/velib-folium/02-Exploration.ipynb).

