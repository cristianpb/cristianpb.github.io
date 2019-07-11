---
layout: post
title: "Creating parametrisable dashboards using Grafana"
date: 2019-07-11
description: Grafana propose great quantity of options to monitor data. This posts shows how to build plots using parameters form queries.
categories: grafana docker influxdb teleraf aws
image: /assets/img/grafana-dashboard/main-crop.jpg
ligthbox: true

---

In a previous post I showed how to monitor data using Collectd, Influxdb and Grafana. 
In the mean time I wanted to add more plugings to Colectd but it was difficult
to find plugings for Nvidia GPU and monitoring other docker instances. 
Instead I found Telegraf, which is a tool from the same InfluxDB company that collects data from several kinds of sources.
There are three advantages that made me change to Telegraf instead of collectd:
* Telegraf is written in go, which make it fast, light and it reduces the footprint when collecting data.
* There is a extensive list of [telegraf plugins](https://github.com/influxdata/telegraf/tree/master/plugins/inputs), well indexed. Which makes very practical to find and install plugins.
* There is more active support in [telegraf github](https://github.com/influxdata/telegraf) than in [collectd github](https://github.com/collectd/collectd).

## Monitoring stack

My current stack is still using docker compose as an orchestration of service.
Which allows me to deploy all my services with a simple `docker-compose up`. I
have three containers:
* Telegraf: Collecting data
* Influxdb: Saving data
* Grafana: Displaying data


<amp-image-lightbox id="lightbox1"
  layout="nodisplay"></amp-image-lightbox>
<amp-img on="tap:lightbox1"
  role="button"
  tabindex="0"
  aria-describedby="imageDescription2"
  alt="Picture of a dog"
  title="Picture of a dog, view in lightbox"
  src="/assets/img/grafana-dashboard/main.jpg"
  layout="intrinsic"
  width="1106"
  height="729"></amp-img>
<div id="imageDescription2">
  Monitoring stack
</div>
<br>

I collect data from CPU, RAM, uptime, connected users, network utilisation, disk utilization and docker stats.
It is possible to use Influxdb queries in grafana interface, which helps to chose the available parameters. 
For example in order to get docker cpu utilization for each available container we can use the following query:

`SELECT mean("usage_percent") FROM "docker_container_cpu" WHERE $timeFilter GROUP BY time($__interval), "container_name" fill(null)`

Which can be done using grafana interface as the folowing:

<amp-image-lightbox id="lightbox1"
  layout="nodisplay"></amp-image-lightbox>
<amp-img on="tap:lightbox1"
  role="button"
  tabindex="0"
  aria-describedby="imageDescription2"
  alt="Picture of a dog"
  title="Picture of a dog, view in lightbox"
  src="/assets/img/grafana-dashboard/tag3.jpg"
  layout="intrinsic"
  width="1320"
  height="567"></amp-img>
<div id="imageDescription2">
  Using tags for alias and group by 
</div>


## GPU monitoring

One of the main reasons was to monitor GPUs

This is available using a conf in telgraf
one for gpu and other for not gpu

which I control using a makefile that read env variables and then feeds docker compose with the appropriate file.

[nvidia plugin](https://github.com/influxdata/telegraf/tree/master/plugins/inputs/nvidia_smi)


<amp-image-lightbox id="lightbox1"
  layout="nodisplay"></amp-image-lightbox>
<amp-img on="tap:lightbox1"
  role="button"
  tabindex="0"
  aria-describedby="imageDescription2"
  alt="Picture of a dog"
  title="Picture of a dog, view in lightbox"
  src="/assets/img/grafana-dashboard/nvidia.jpg"
  layout="intrinsic"
  width="1270"
  height="367"></amp-img>
<div id="imageDescription2">
  Using tags for alias and group by 
</div>

## battery monitoring

[battery plugin](https://dev.sigpipe.me/dashie/telegraf-plugins)


<amp-image-lightbox id="lightbox1"
  layout="nodisplay"></amp-image-lightbox>
<amp-img on="tap:lightbox1"
  role="button"
  tabindex="0"
  aria-describedby="imageDescription2"
  alt="Picture of a dog"
  title="Picture of a dog, view in lightbox"
  src="/assets/img/grafana-dashboard/battery.jpg"
  layout="intrinsic"
  width="1283"
  height="316"></amp-img>
<div id="imageDescription2">
  Using tags for alias and group by 
</div>
