---
layout: post
title: "Log analysis using Fluentbit Elasticsearch Kibana"
date: 2023-09-11
description: This article shows how to analyze logs using Kibana dashboards. Fluentbit is used for injecting logs to elasticsearch, then it is connected to kibana to get some insights.
categories:
  - visualization
  - system management
tags: 
 - elasticsearch
 - docker
 - traefik
image:
  path: /assets/img/fluentbit-elasticsearch-kibana/main-16x9.jpg
  height: 788
  width: 1400
thumb:
  path: /assets/img/fluentbit-elasticsearch-kibana/main-thumb.jpg
  height: 225
  width: 400
#video: true

---

Logs are a valuable source of information about the health and performance of
an application or system. By analyzing logs, you can identify problems early on
and take corrective action before they cause outages or other disruptions.

One way to analyze logs is to use a tool like Fluent Bit to collect them from
different sources and send them to a central repository like Elasticsearch.
Elasticsearch is a distributed search and analytics engine that can store and
search large amounts of data quickly and efficiently.

Once the logs are stored in Elasticsearch, you can use Kibana to visualize and
analyze them. Kibana provides a variety of tools for exploring and
understanding log data, including charts, tables, and dashboards.

By analyzing logs using Fluent Bit, Elasticsearch, and Kibana, you can gain
valuable insights into the health and performance of your applications and
systems. This information can help you to identify and troubleshoot problems,
improve performance, and ensure the availability of your applications.

<center>
<amp-img src="/assets/img/fluentbit-elasticsearch-kibana/drawing.png" width="901" height="450" layout="intrinsic" alt="log injection architecture"></amp-img>
<br><i>Log injection architecture</i>
</center>

## Fluent-bit: log injection

Traefik, a modern reverse proxy and load balancer, generates access logs for
every HTTP request. These logs can be stored as plain text files and compressed
using the logrotation Unix utility. Fluent Bit, a lightweight log collector,
provides a simple way to insert logs into Elasticsearch. In fact, it provides
several input connectors for other sources, such as syslog logs, and output
connectors, such as Datadog or New Relic.

To send Traefik access logs to Elasticsearch using Fluent Bit, you will need to:
* Install Fluent Bit on the machine where Traefik is running.
* Configure Fluent Bit to collect the Traefik access logs.
* Configure Elasticsearch to receive the logs from Fluent Bit

The configuration file from fluent bit has the following sections:
* Input: I use the `tail` connector to fetch data from access.log file
* Filter: I use MaxMind plugin to geocode IP adresses. 
* Output: Points directly to elasticsearch database.

 
The following is configuration file shows how to collect Traefik logs and send
them to Elasticsearch:

```toml
# fluentbit.conf
[SERVICE]
    flush             5
    daemon            off
    http_server       off
    log_level         info
    parsers_file      parsers.conf

[INPUT]
    name              tail
    path              /var/log/traefik/access.log,/var/log/traefik/access.log.1
    Parser            traefik
    Skip_Long_Lines   On

[FILTER]
    Name                  geoip2
    Match                 *
    Database              /fluent-bit/etc/GeoLite2-City.mmdb
    Lookup_key            host
    Record country host   %{country.names.en}
    Record isocode host   %{country.iso_code}
    Record latitude host  %{location.latitude}
    Record longitude host %{location.longitude}
    
[FILTER]
    Name                lua
    Match               *
    Script              /fluent-bit/etc/geopoint.lua
    call                geohash_gen

[OUTPUT]
    Name                es
    Match               *
    Host                esurl.com
    Port                443
    HTTP_User           username
    HTTP_Passwd         password
    tls                 On
    tls.verify          On
    Logstash_Format     On
    Replace_Dots        On
    Retry_Limit         False
    Suppress_Type_Name  On
    Logstash_DateFormat all
    Generate_ID         On
``` 

I use an additional filter function to produce a geohash record, which then
it'll be used in kibana in geo maps plot.

```toml
# geopoint.lua
function geohash_gen(tag, timestamp, record)
        new_record = record
        lat = record["latitude"]
        lon = record["longitude"]
        hash = lat .. "," .. lon
        new_record["geohash"] = hash
        return 1, timestamp, new_record
end
```

The parser uses a regex expression to obtain the different fields for each record.
By default all fields are process as strings, but you can other types, like integer for fields like _request size_, _request duration_ and _number of requests_.


```toml
# parsers.conf
[PARSER]
    Name   traefik
    Format regex
    Regex  ^(?<host>[\S]*) [^ ]* (?<user>[^ ]*) \[(?<time>[^\]]*)\] "(?<method>\S+)(?: +(?<path>[^\"]*?)(?<protocol>\S*)?)?" (?<code>[^ ]*) (?<size>[^ ]*)(?: "(?<referer>[^\"]*)" "(?<agent>[^\"]*)")? (?<number_requests>[^ ]*) "(?<router_name>[^\"]*)" "(?<router_url>[^\"]*)" (?<request_duration>[\d]*)ms$
    Time_Key time
    Time_Format %d/%b/%Y:%H:%M:%S %z
    Types request_duration:integer size:integer number_requests:integer
```

Once you have configured Fluent Bit, you can start it by running the following command: `fluent-bit -c fluent-bit.conf` or by using docker compose:

```yaml
# docker-compose.yml
version: "3.7"

services:
  fluent-bit:
    container_name: fluent-bit
    restart: unless-stopped
    image: fluent/fluent-bit
    volumes:
      - ./parsers.conf:/fluent-bit/etc/parsers.conf
      - ./fluentbit.conf:/fluent-bit/etc/fluent-bit.conf
      - ./geopoint.lua:/fluent-bit/etc/geopoint.lua
      - ./GeoLite2-City.mmdb:/fluent-bit/etc/GeoLite2-City.mmdb
      - /var/log/traefik:/var/log/traefik
```

## Elasticsearch: Log indexing

Elasticsearch is a popular open-source search and analytics engine that can be
used for a variety of tasks, including log analysis. It is a good choice for
log analysis because it can be queried using complex queries, and it provides a
REST API to cast queries directly in readable JSON format.

Elasticsearch uses a distributed architecture, which means that it can be
scaled to handle large amounts of data. It also supports a variety of data
types, including text, numbers, and dates, which makes it a versatile tool for
log analysis.

To use Elasticsearch for log analysis, you would first need to index the logs
into Elasticsearch. This can be done using a variety of tools, such as Logstash
or Fluent Bit. Once the logs are indexed, you can then query them using
Elasticsearch's powerful query language.

Elasticsearch's query language is based on JSON, which makes it easy to read
and write. It also supports a variety of features, such as full-text search,
regular expressions, and aggregations.

### Mappings

Elasticsearch creates a mapping for new indices by default, guessing the type
of each field. However, it is better to provide an explicit mapping to the
index. This will allow you to control the type of each field and the operations
that can be performed on it. For example, you can specify that a field is of
type ip so that it can be used to filter for IP address groups, or you can
specify that a field is of type geo_point so that it can be used to filter by
an specific location.


```bash
curl -XPUT "https://hostname/logstash-all" -H 'Content-Type: application/json' -d '{ "mappings": { "properties": { "@timestamp": { "type": "date" }, "agent": { "type": "text", "fields": { "keyword": { "type": "keyword", "ignore_above": 256 } } }, "code": { "type": "text", "fields": { "keyword": { "type": "keyword", "ignore_above": 256 } } }, "country": { "type": "text", "fields": { "keyword": { "type": "keyword", "ignore_above": 256 } } }, "geohash": { "type": "geo_point" }, "host": { "type": "ip" }, "isocode": { "type": "text", "fields": { "keyword": { "type": "keyword", "ignore_above": 256 } } }, "latitude": { "type": "float" }, "longitude": { "type": "float" }, "method": { "type": "text", "fields": { "keyword": { "type": "keyword", "ignore_above": 256 } } }, "number_requests": { "type": "long" }, "path": { "type": "text", "fields": { "keyword": { "type": "keyword", "ignore_above": 256 } } }, "protocol": { "type": "text", "fields": { "keyword": { "type": "keyword", "ignore_above": 256 } } }, "referer": { "type": "text", "fields": { "keyword": { "type": "keyword", "ignore_above": 256 } } }, "request_duration": { "type": "long" }, "router_name": { "type": "text", "fields": { "keyword": { "type": "keyword", "ignore_above": 256 } } }, "router_url": { "type": "text", "fields": { "keyword": { "type": "keyword", "ignore_above": 256 } } }, "size": { "type": "long" }, "user": { "type": "text", "fields": { "keyword": { "type": "keyword", "ignore_above": 256 } } } } } }'
```


### Managed database

[Bonsai.io](https://bonsai.io/) is a managed Elasticsearch service that
provides high availability and scalability without the need to manage or deploy
the underlying infrastructure. Bonsai offers a variety of plans to suit
different project requirements.

<center>
<amp-img src="/assets/img/fluentbit-elasticsearch-kibana/bonsai-io.jpg" width="901" height="450" layout="intrinsic" alt="bonsai.io overview dashboard"></amp-img>
<br><i>Bonsai.io dashboard</i>
</center>

The hobbyist tier is more than enough for this kind of use case, which comes
with a maximum of 35k documents, 125mb of data and 10 shards. At the moment of
writing this article its a free, you don't have to enter a credit card to use
it.

In order to be compliant with the limits of the hobby tier, I use the following
cronjob to remove old documents:

```bash
curl -X POST "https://hostname/logstash-all/_delete_by_query" -H 'Content-Type: application/json' -d '{ "query": { "bool": { "filter": [ { "range": { "@timestamp": { "lt": "now-10d" } } } ] } } }'
```

For my use case, 10 days retention is enough to be compliant with the plan
limits.


## Kibana: Log analysis

[Bonsai.io](https://bonsai.io) also provides a managed kibana service connected to the elasticsearch cluster.

There are certain limitations about the stack management, like there is no possibility to manage the index life cycle or alerting capacity.

Nevertheless, it provides basic functionality to create useful dashboards and
discover patterns inside the logs.

<center>
<amp-img src="/assets/img/fluentbit-elasticsearch-kibana/kibana.jpg" width="901" height="450" layout="intrinsic" alt="kibana dashboard provided by bonsai.io"></amp-img>
<br><i>Kibana dashboard</i>
</center>

Its interesting to see bot request trying to explode vulnerability from
services like wordpress and also bot scrapping services.

## Discusion

The following stack provides a simple and cost-effective way to analyze logs.
The computational footprint on your server is very low because most of the
infrastructure is in the cloud. There are many freemium services, such as
Bonsai.io and New Relic, that can be used to ingest and analyze logs.

Observability is important for infrastructure management, but it is also
important to have alerting capabilities to detect and respond to threats.
Unfortunately, these plugins are not typically included in the free plan, so
you will need to upgrade to a paid plan to get them.
