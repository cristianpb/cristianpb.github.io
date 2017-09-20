---
layout: default
avatar: true
permalink: /
---
## 🚀 Lastest post
{% for post in site.posts limit: 3 %}<a href="{{ post.url | prepend: site.baseurl }}">🅿️ {{ post.title }}</a>
{% assign date_format = site.minima.date_format | default: "%b %-d, %Y" %}{{ post.date | date: date_format }}
<br>
{{ post.description }}
<br>
<br>
{% endfor %}

<center><a href="{{ site.baseurl | append: '/blog/'}}">More at the blog</a></center>
