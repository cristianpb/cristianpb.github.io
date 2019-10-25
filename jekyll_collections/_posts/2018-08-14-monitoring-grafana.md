---
layout: post
title: "System monitoring with Grafana, InfluxDB and Collectd"
date: 2018-08-14
description: "Docker allows to easily deploy a monitoring system using beautiful 
Grafana dashboards and connected with optimized data sources with Influxdb and 
Collectd"
categories: ["grafana", "docker", "influxdb", "collectd", "aws"]
image:
  path: /assets/img/monitoring-grafana/main-crop.jpg
  height: 200
  width: 300

---
System monitoring is important to understand the global performance of a
machine. For instance, unix systems provide command lines tools like `top`,
`free` or `df`. Which gives simple and accurate functionalities but it
lacks of a global vision, like the one that that we can have in a dashboard.

This article will explains the components of a responsive dashboard system and 
how to easily deploy it using docker technology.

## Introduction

Let's start with the presentation of the components of the stack.

<amp-img src="/assets/img/monitoring-grafana/schema.jpg" alt="Schema grafana" height="150" width="300" layout="responsive"></amp-img>

[Collectd](https://collectd.org/) is a daemon process that runs on the system
and collects information like CPU, memory, disk usage, network data, etc. It
can send these data to some data store.

The data store that we have chosen is [Influxdb](https://www.influxdata.com/).
The main reason is because influxdb is a time series database designed to store
and analyse time-series data, likes the one we can get from our system.

The final part is [Grafana](https://grafana.com/), which is a data query and
presenting tool, that let you build beautiful graph chart based on your
defined data source. And of course InfluxDB is on the officially supported data
source.

Each component of the stack is saved as a docker instance using a dockerfile
image and they are build and launched using docker-compose program.

## Data collection

There is no official dockerfile image available for collectd. The closest
available comes from [fr3nd](https://hub.docker.com/r/fr3nd/collectd/).
Collectd daemon collects system information from the unix `/proc` folder, so we
need to access this folder from inside our docker container.
For that reason, we have to give elevated privileges to the container in order
to read the folder `/proc` and also include an option to access network
information from the host machine and not the docker virtual machine itself.

```yaml
image: fr3nd/collectd
privileged: true
network_mode: host
volumes:
  - /proc:/mnt/proc:ro
  - ./docker/collectd/collectd.conf:/etc/collectd/collectd.conf
```

We can use the default configuration file from collectd and add the following
lines in order to communicate to our data saving service. 

```html
LoadPlugin network

<Plugin network>
    Server "127.0.0.1" "25826"
</Plugin>
```

This line uses a collectd plugin to send data to the address
`127.0.0.1:25826/udp`, where we have to listen to save the data.

## Saving the data

Influxdb has an official [dockerfile
image](https://hub.docker.com/_/influxdb/). We use the version 1.4, which
includes performance improvements and also they remove the default visual
administration interface from port 8083.

When running our docker, influxdb read data from port 25826/udp that comes from
collectd and then save it in the folder `/var/lib/influxdb`, which we mapped to
an external docker folder `influxdb-data` in order to have data persistence.
Finally it exposes this data using port 8086.

```yaml
influxdb:
image: influxdb:1.4
ports:
  - "8086:8086"
  - "25826:25826/udp"
volumes:
  - ./influxdb-data:/var/lib/influxdb
  - ./docker/influxdb/influxdb.conf:/etc/influxdb/influxdb.conf
  - ./docker/influxdb/types.db:/usr/share/collectd/types.db:ro
```

The connection with collectd is done inside the configuration file
`influxdb.conf` in the following lines:

```yaml
[[collectd]]
  enabled = true
  bind-address = ":25826"
  database = "collectd"
  retention-policy = ""
  batch-size = 5000
  batch-pending = 10
  batch-timeout = "10s"
  read-buffer = 0
  typesdb = "/usr/share/collectd/types.db"
```

The `types.db` file defines the collectd data source specification, which influxdb needs this file to understand collectd’s data.

## Dashboard monitoring

We use the grafana docker image 5.1 which comes with the possibility to include
data sources and predefined dashboards as `yaml` files, which makes easier the
deployment task. The influxdb data source is declared in the `datasource.yaml`
file and a simple dashboard configuration is included in the file
`Dashboard.json`.

```yaml
grafana:
  image: grafana/grafana:5.1.1
  user: "root"
  ports:
    - "3000:3000"
  volumes:
    - ./grafana-storage:/var/lib/grafana
    - ./docker/grafana/datasource.yaml:/etc/grafana/provisioning/datasources/datasource.yaml
    - ./docker/grafana/dashboard.yaml:/etc/grafana/provisioning/dashboards/dashboard.yaml
    - ./docker/grafana/Dashboard.json:/var/lib/grafana/dashboards/Dashboard.json
```

Grafana is specially designed to monitor data sources, it has the following
advantages:
  - Community provides many *dashboards layouts* in the [website](https://grafana.com/dashboards). 
  - Several input [datasources](http://docs.grafana.org/features/datasources/)
  - *Monitor alerts*, which can send notification through email, slack, APIs.

The grafana interface can be reached at port 3000. The default username is admin and the password is admin.

<amp-img src="/assets/img/monitoring-grafana/dashboard.png" alt="grafana dashboard" height="150" width="300" layout="responsive"></amp-img>

Grafana has many ways to be customized and also an [explicit documentation](http://docs.grafana.org/guides/getting_started/).

## Conclusion

The main motivation of this project was to monitor AWS instances. Which can be
easily done using our code source that is available in
[github](https://github.com/cristianpb/collectd-influxdb-grafana-docker) and
easily deployed with the only command `docker-compose up -d --build`.

However, the scope of this projet can be wider using the several plugins that
can be used with collectd. For example it is possible to calculate more detailed
information such the [state of mongodb database](https://github.com/sebest/collectd-mongodb), the [number of rabbitmq queued
messages](https://github.com/akrzos/collectd-rabbitmq-monitoring) or the [memory consumption of docker services](https://github.com/dustinblackman/collectd-docker-plugin).


---

Thanks to [Han Xiao](https://github.com/justlaputa/collectd-influxdb-grafana-docker) for initial work.
