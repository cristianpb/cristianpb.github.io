---
layout: post
title: "Music playlists dashboard"
date: 2024-02-23
description: This article shows how to collect data from  article shows how to analyze logs using Kibana dashboards. Fluentbit is used for injecting logs to elasticsearch, then it is connected to kibana to get some insights.
categories:
  - visualization
  - programming
tags: 
 - d3.js
 - python
 - opendata
image:
  path: /assets/img/playlists-dashboard/main-16x9.jpg
  height: 788
  width: 1400
thumb:
  path: /assets/img/playlists-dashboard/main-thumb.jpg
  height: 225
  width: 400
#video: true

---


Music has a significant impact on the world in various ways.
Gaining insight into the patterns of popular music can be a fascinating endeavor.
In this post, we will demonstrate how to utilize Spotify's trending music to stay up-to-date with current trends in a self-hosted manner.

<center>
<amp-img src="/assets/img/playlists-dashboard/main.jpg" width="450" height="450" layout="intrinsic" alt="realistic photo of yoda as a DJ from behind listening music in front of a playlist dashboard in a big screen"></amp-img>
<br><i>Stable diffusion: realistic photo of yoda as a DJ from behind listening music in front of a playlist dashboard in a big screen</i>
</center>

## Data

Spotify is a widely used music service, and its playlist data is publicly available on the internet.
There are several popular trending playlists that reflect current music preferences.
By utilizing GitHub Actions, you can automatically fetch this data at regular intervals and store it without needing to manage a database.
This data can then be easily accessed using straightforward HTTP requests directly to GitHub.
I utilize the project called [spotify-downloader](https://github.com/spotDL/spotify-downloader) to download the playlist data and save it as a file.
Here is the follwing code snippet to do it:

```python
def download(key, url):
    cmd=f"docker run --rm -v {CWD}/tmpplaylists:/music spotdl/spotify-downloader save {url.strip()} --save-file {key}.spotdl"
    p=subprocess.Popen(cmd.split(" "),
                             stderr=subprocess.STDOUT,
                             stdout=subprocess.PIPE)
    for line in iter(p.stdout.readline, b''):
        print(f">>> {line.rstrip().decode('utf-8')}")
```


Then I parse every playlists file and do simple preprocessing on the artists column in order to obtain a list of every artists that participates in the songs.

```python
def read_data():
    appended_data = []
    cols = ['name', 'artists', 'album_name', 'date', 'song_id', 'cover_url', 'playlist', 'position']
    for f in glob.glob('tmpplaylists/*.spotdl'):
        data = pd.read_json(f).assign(
                artists=lambda x: x['artists'].explode().str.replace("'","").str.replace("\"", "").reset_index().groupby('index').agg({'artists': lambda y: y.tolist()}),
                playlist=f.split("/")[1].split(".")[0],
                position=lambda x: x.index + 1
                )
        assert len(set(cols).difference(data.columns)) == 0, f'Columns: {", ".join(data.columns)}'
        assert len(data) > 0, f"Shape {data.shape[0]} and {data.shape[1]} columns"
        appended_data.append(data)
    (
            pd.concat(appended_data, ignore_index=True)
            .get(cols)
            .to_csv('static/data/data.csv', index=False, header=True, sep=";")
    )
```

By employing periodic GitHub Actions, it is possible to regularly save playlist positions every week, enabling further processing of this data through other tools.


## Observable dashboard


I utilize the [Observable framework](https://observablehq.com/), which incorporates the D3 JavaScript library for generating swift and adaptable visualizations.

Observable Notebook combines the features of conventional text editors, code editors, and document processors into a unified interface, simplifying the creation of rich and dynamic documents that integrate text, code, data visualization, and other multimedia elements.

Observable employs the concept of "cells" to arrange content within a notebook, where each cell can either contain plain text or executable code written in JavaScript or any other supported language. Cells can be rearranged, grouped, and nested, enabling the creation of hierarchical structures that reflect the logical organization of the document.

One can write a markdown notebook and import data from multiple languages, for example I use  a python preprocessing pipeline, then I import the data in the notebook and plot it using the available visualizations functions.


```markdown
# Playlist details

const commit_date_old = Array.from(new Set(diffData.map(i => i.commit_date)))[1];
const commit_date_recent = Array.from(new Set(diffData.map(i => i.commit_date)))[0];

From ${commit_date_old} to ${commit_date_recent} new songs have been added to the playlist.

const playlistsNames = bestArtists.map(i => i.playlist)
const playlistChoosen = view(Inputs.select(new Set(playlistsNames), {value: playlistsNames[0], label: "Playlists"}));
const artistsNames = bestArtists.map(i => i.artists)

const tableRows = RecentSongAdds(diffData, playlistChoosen, commit_date_old, commit_date_recent)

<div class="card" style="margin: 1rem 0 2rem 0; padding: 0;">
  ${Inputs.table(tableRows, {
  columns: ["position", "artists", "name", "album_name", "attribute"],
  align: {"position": "left"},
  format: {
    attribute: (x) => x == "+" ? "New!" : x == "-" ? "🗑" : x > 0 ? `⬆${x}` : x == 0 ? '--' : `⬇${Math.abs(x)}`
  }
})}
</div>

<div class="grid grid-cols-1" style="grid-auto-rows: 560px;">
  <div class="card">
    ${BestArtistsPlot(bestArtists, playlistChoosen)}
  </div>
</div>

const mostPopularArtists = view(Inputs.select(mostFrequent(bestArtists.filter(i => i.playlist == playlistChoosen).map(i => i.artists)).slice(0,10), {value: artistsNames[0], label: "Popular artists"}));

<div class="grid grid-cols-1" style="grid-auto-rows: 560px;">
  <div class="card">
    ${BestSongsPlot(bestArtists, playlistChoosen, mostPopularArtists)}
  </div>
</div>
```

The dashboard is hosted on GitHub pages, the link is available at [cristianpb.github.io/playlists](https://cristianpb.github.io/playlists).

## Analysis

The dashboard allows for the identification of patterns in the development of Spotify playlists over time.
The [Today Top Hits](https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M) playlist reflects global music trends, having garnered more than 34 million likes at the time of writing this article.

<center>
<amp-img src="/assets/img/playlists-dashboard/songs-popular-artists.png" width="901" height="450" layout="intrinsic" alt="realistic photo of yoda as a DJ from behind listening music in front of a playlist dashboard in a big screen"></amp-img>
<br>
</center>

 We can observe artists such as Olivia Rodrigo, who has multiple tracks featured in the "Today's Top Hits" playlist. Some songs exhibit a consistent pattern, indicating that they have maintained popularity and catchiness over time, for example, "The Vampire Song," which remained among the top 35 songs for more than four months. Conversely, other tracks like "Catch Me Now" may initially appear in the playlist due to the artist's popularity but subsequently decline in ranking during subsequent weeks.

<center>
<amp-img src="/assets/img/playlists-dashboard/artist-constant-radio.png" width="901" height="450" layout="intrinsic" alt="realistic photo of yoda as a DJ from behind listening music in front of a playlist dashboard in a big screen"></amp-img>
<br>
</center>

One might also observe that artist-specific radio playlists, which are frequently updated, exhibit minimal fluctuations. For instance, "Muse Radio," "Coldplay Radio," and "The Strokes" playlists undergo infrequent changes.

## Discusion

Observable is a practical platform for crafting data analyses, offering
versatile connectors and support for multiple programming languages. The
variety of available visualizations is crucial, and comprehensive documentation
plays a significant role in guiding users to create effective visualizations.

However, incorporating reactive filters or reusing variables within an
Observable notebook necessitates writing JavaScript code, which may be a
drawback for some users. Although the reactivity of Observable notebooks is
functional, it might not be the most advanced option available.

The code to process the data and build the dashboard is available at [github.com/cristianpb/playlists](https://github.com/cristianpb/playlists).
