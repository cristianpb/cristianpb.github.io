---
layout: post
title: "Creating parametrisable dashboards using Grafana"
date: 2019-07-11
description: Grafana propose great quantity of options to monitor data. This posts shows how to build plots using parameters form queries.
categories:
  - system management
tags: grafana docker influxdb telegraf aws
image:
  path: /assets/img/grafana-dashboard/main-4x3.jpg
  height: 1050
  width: 1400
thumb:
  path: /assets/img/grafana-dashboard/main-thumb.jpg
  height: 200
  width: 300
ligthbox: true

---

In a [previous post](/blog/music-voice-cotrol).  I showed how to monitor data using Collectd, Influxdb and Grafana. 
In the mean time I wanted to add more functionalities to Colectd but it was difficult
to find plugings for Nvidia GPU and also to monitor other docker instances.
Then I found Telegraf, which is a tool from the same InfluxDB company that can collect data from several sources.
There are three advantages that made me change to Telegraf instead of collectd:
* Telegraf is written in go, which make it fast, light and it reduces the footprint when collecting data.
* There is an extensive list of [telegraf plugins](https://github.com/influxdata/telegraf/tree/master/plugins/inputs) indexed in one official github repository. Which makes very practical to find and install plugins.
* There is more active support in [telegraf github](https://github.com/influxdata/telegraf) than in [collectd github](https://github.com/collectd/collectd).

In this post I will show how to use Telegraf plugins to monitor GPU devices and battery status using Grafana.

## Monitoring stack

My current stack is still using docker compose as an orchestration of service.
Which allows me to deploy all my services with a simple `docker-compose up`. 
Moreover I use a `Makefile` to control my docker compose commands and inject
environment variables to the `docker-compose.yml`.
I don't git the real environment file but instead a fake environment file to
show samples of used variables.

I define the following containers in my docker compose file:
* Telegraf: Collecting data
* Influxdb: Saving data
* Grafana: Displaying data

<amp-image-lightbox id="lightbox1"
  layout="nodisplay"></amp-image-lightbox>
<amp-img on="tap:lightbox1"
  role="button"
  tabindex="0"
  aria-describedby="imageDescription1"
  alt="Monitoring stack telegraf, influxdb and grafana"
  title="Monitoring stack telegraf, influxdb and grafana"
  src="/assets/img/grafana-dashboard/main.jpg"
  layout="intrinsic"
  width="1106"
  height="729"></amp-img>
<div id="imageDescription1">
  Monitoring stack
</div>
<br>


## Grafana parameters for queries

I collect data from CPU, RAM, uptime, connected users, network utilisation, disk utilization and docker stats.
It is possible to use Influxdb queries in grafana interface, which helps to chose the available parameters. 
For example in order to get docker CPU utilization for each available container we can use the following query:

```sql
SELECT mean("usage_percent") 
FROM "docker_container_cpu" 
WHERE $timeFilter
GROUP BY time($__interval), "container_name" fill(null)
```

The group by `container_name` allows to separate values for each available container and then we can use [grafana alias pattern](https://grafana.com/docs/features/datasources/influxdb/#alias-patterns) options in order to have give nice names to each line.

<amp-image-lightbox id="lightbox2"
  layout="nodisplay"></amp-image-lightbox>
<amp-img on="tap:lightbox2"
  role="button"
  tabindex="0"
  aria-describedby="imageDescription2"
  alt="using alias pattern in grafana"
  title="Using alias pattern in grafana"
  src="/assets/img/grafana-dashboard/pattern_alias.jpg"
  layout="intrinsic"
  width="1320"
  height="567"></amp-img>
<div id="imageDescription2">
  Using alias pattern to name *group by* variables
</div>


## GPU monitoring

One of the main reasons I started using *telegraf* was because I wanted to monitor a server with NVIDIA GPU and telegraf proposed a nice 
[nvidia plugin](https://github.com/influxdata/telegraf/tree/master/plugins/inputs/nvidia_smi)
to do so.

I use an environment variable if I want to monitor GPU. This will include an
additional docker-compose file with special configuration values for Nvidia
GPU.

```yml
version: '2.3'

services:
  telegraf:
    runtime: nvidia
    environment:
      - NVIDIA_VISIBLE_DEVICES=all
    volumes:
      - ./docker/telegraf/telegraf-gpu.conf:/etc/telegraf/telegraf.conf
```

* The first one is the runtime option so that docker can access to the GPU. 
* The other one if an environment variable `NVIDIA_VISIBLE_DEVICES` to select the number of allowed NVIDIA devices. The possible values are either *all* or the *device number* (multiple device id can be added separated with comma).
* I use a different telegraf configuration when monitoring GPU because I add the telegraf plugin to monitor GPU using `nvidia_smi` tool. The only thing that changes is to uncomment the following lines:

```config
[[inputs.nvidia_smi]]
  ## Optional: path to nvidia-smi binary, defaults to $PATH via exec.LookPath
  # bin_path = /usr/bin/nvidia-smi
  
  ## Optional: timeout for GPU polling
  # timeout = 5s
```

In the image below you can see the temperature of each GPU and the utilization of them. I have a batch of work distributed on all GPU that when it finish it writes things in a database. 

<amp-image-lightbox id="lightbox3"
  layout="nodisplay"></amp-image-lightbox>
<amp-img on="tap:lightbox3"
  role="button"
  tabindex="0"
  aria-describedby="imageDescription3"
  alt="NVIDIA GPU temperature and utilisation in grafana"
  title="GPU temperature and utilisation"
  src="/assets/img/grafana-dashboard/nvidia.jpg"
  layout="intrinsic"
  width="1270"
  height="367"></amp-img>
<div id="imageDescription3">
  GPU temperature and utilisation
</div>
<br>

You can notice two things:
* *GPU 0* has a lower temperature than the other devices. This occurs because in my disposition *GPU 0* is placed near the border and the fan is not blocked by the other GPU.
* Temperatures don't go beyond 80C, which is OK for my GPU.

## Battery monitoring

I was also curious about my battery utilisation. Because I try to optimize the
charging cycles by don't letting the battery go below 20% and not charging
above 90%.
So I tried [telegraf battery plugin](https://dev.sigpipe.me/dashie/telegraf-plugins),
which fetch battery status from `/proc` folder.
The following image shows the battery capacity and the battery cycle count.

<amp-image-lightbox id="lightbox4"
  layout="nodisplay"></amp-image-lightbox>
<amp-img on="tap:lightbox4"
  role="button"
  tabindex="0"
  aria-describedby="imageDescription4"
  alt="Battery monitoring using grafana"
  title="Battery monitoring using grafana"
  src="/assets/img/grafana-dashboard/battery.jpg"
  layout="intrinsic"
  width="1283"
  height="316"></amp-img>
<div id="imageDescription4">
  Battery monitoring using Grafana
</div>
<br>

My laptop has two batteries. I try to use only one battery, the one that it can be remove from the laptop and so that I can be replaced easily. So I can see that the number cycles are lower for *BAT0*.
I also try to do complete cycle for the batteries as one can see in the battery capacity plot.


## Conclusion

The combination of telegraf, influxdb and grafana allows me to get an overview of the resources of my system. Combining them with docker allows me to deploy it easily in any remote server.
All the stack is easily deploy using docker-compose. You can checkout the [github code here](https://github.com/cristianpb/telegraf-influxdb-grafana-docker).
