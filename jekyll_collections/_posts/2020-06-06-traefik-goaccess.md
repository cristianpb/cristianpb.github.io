---
layout: post
title: "Reverse proxy management with Traefik and GoAccess"
date: 2020-06-07
description: Traefik is a modern and dynamic reverse proxy with a native support with docker containers. This article compares Traefik with existing solutions and shows how to setup a privacy compliant monitoring tool with GoAccess.
categories:
  - system management
tags: traefik goaccess docker
image:
  path: /assets/img/traefik-goaccess/main-16x9.jpg
  height: 788
  width: 1400
thumb:
  path: /assets/img/traefik-goaccess/main-thumb.jpg
  height: 225
  width: 400
gist: true

---

The micro services philosophy consists on dividing applications in simple components.
This approach increases maintainability, since each application is not
coupled with others, so it can be tested, replaced and deployed independently.
This approach has become popular since the adoption of docker container technology.

A micro service project typically includes multiple docker containers, where
each container includes a separated functionality. 

These containers can communicate in a private network and map ports with
the external network in order to expose services.

However, not every service includes a security layer, so it's better to expose
a single application that serves as a router which controls every incoming requests
and send it to the right service.
This avoid exposing a service like a whole database connection.
Some applications that are able to act as a router are: Nginx, Apache server,
Caddy and Traefik.

* Apache server is the oldest one but it has been loosing followers since the
arrival of Nginx.
* Nginx is very popular and powerful web server, which can be adapted to multiple
kind of situations.
* Traefik is the new kid on the block. It has native docker
support, so it means that you don't have to define custom Nginx routing
configurations, because it can connect directly to docker socket to
automatically detect changes on containers.

In this article I will show how to setup traefik using file system
configuration and also how to implement offline metric analysis using GoAccess
tool.

## Traefik

Traefik is a reverse proxy, which routes incoming request to microservices.
It has been conceived for environments with multiple microservices, where a main
configuration is done to set-up Traefik, and then it dynamically detects 
new services comming from docker, kubernetes, rancher or a plain file system.
More information about [traefik automatic discovery is available here](https://docs.traefik.io/providers/overview/).

This automatic discovery behaviour was the main thing that attracted me to use
Traefik, unlike Nginx, which refuse to start if a declared service is not available.
Traefik on the other side, it can run even if a declared service won't run, and
if the docker starts it will be automatically detected by Traefik.

### Traefik API

Trafik has a modern web interface to graphically inspect configuration. 
It shows information about:
* the entrypoints, which are the ports that Traefik is listening ;
* the running services and
* the routing rules, which defined how to direct the incoming request.

Traefik interface can be easily enabled in the configuration file. The following
lines tell Traefik to serve the interface in the Traefik entrypoint (8080 by
default). The debug option is useful for profiling performance and debugging Traefik.

```yaml
api:
  insecure: true
  dashboard: true
  debug: true 
```

Here is a screen shot of the web interface, where one can see how one service is
configured.

<center>
<amp-img src="/assets/img/traefik-goaccess/traefik.png" width="640" height="400" layout="intrinsic" alt="goaccess"></amp-img>
<br><i>Traefik API web interface. Mopidy service is encrypted using TLS.</i>
</center>

In the following gist you can find the complete configuration file for Traefik.
The basic parameters to define are the entrypoints, where Traefik should be
listening and the encryption method. 
The providers configuration can be done in other plain file, or by adding
labels to docker, kubernetes, rancher, etc. In any case it dynamically detects 
changes on providers.

<amp-gist data-gistid="1d77f178884569da6a3b904ef867a30a"
  data-file="traefik.yml"
  layout="fixed-height"
  height="1123">
</amp-gist>

This configuration can be done in plain format if running outside a docker
container, but it can also be done by setting labels to Traefik docker
container.

### Traefik security

By default Traefik will watch for all containers running on the Docker daemon,
and attempt to automatically configure routes and services for each container.
If you'd like to have more refined control, you can pass the
`--providers.docker.exposedByDefault=false` option and selectively enable
routing for your containers by adding a `traefik.enable=true` label.

Regarding HTTPS security, SSL connections can be easily configured in Traefik,
one can use a self signed certificate or connect automatically to [Let's
Encrypt](https://letsencrypt.org/) in order to get an SSL certificate. The
renewal is also taken into account by Traefik. HTTPS redirection is also
available into Traefik parameters.

### Traefik as a service

Traefik has been conceived to run as a docker container, but since it's written
in GO, then it's possible to run the compiled version as a standalone file in
several operating systems.

In the docker version, Traefik runs automatically when the container is power
on and the logs are scoped to the standard output.
However if you run the standalone file, then you have to configure Traefik as a
system service. I used the excellent information from [this Gerald Pape
gist](https://gist.github.com/ubergesundheit/7c9d875befc2d7bfd0bf43d8b3862d85)
to configure the Traefik service.

I prefer the standalone version in development environments like the raspberry pi
or jetson nano, where building docker images can be a little long. 

## GoAccess to monitor logs

GoAccess is a simple tool to analyse logs. It provides fast and valuable HTTP
statistics for system administrators that require a visual server report on the
fly. It can generate reports in terminal format, which is nice if your are
connecting on SSH, but it can also generate CSV, JSON or HTML reports.

Alternatives for this services are Matomo, which has the advantage of being
self hostable and open source.  Then you can be sure about how your colected
data is being used and that is not being sold to 3rd parties and advertisers.
However, Matomo has an extra client side javascript library which is required
in order to parse data, which is another dependency that I don't want for
internal off-line environments.

Other popular alternative is Google Analytics, which has very powerful
reports and multiple of options that go beyond the scope of this article. The
only problem is that it's not privacy compliant.

What makes GoAccess interesting, is that it generates detailed analytics based
purely on access logs from a web server, such as Apache, Nginx or in my case
Traefik. It's written in C, and features both a terminal interface, as well as
a web interface. The way it's designed to be used is by piping the *access.log*
contents into the GoAccess binary and providing any number of switches to
customize the output. Switches such as which log format you're sending it, as
well as how to parse Geolocation from IP addresses.

In the following image you can see an example for GoAccess HTML dashboard. On
the top there is global information about the number of total requests, the
number of unique visitors, the log size, the bandwidth, etc.

<center>
<amp-img src="/assets/img/traefik-goaccess/goaccess.png" width="640" height="400" layout="intrinsic" alt="goaccess"></amp-img>
<br><i>GoAccess HTML dashboard</i>
</center>

### Real-time dashboard

GoAccess can be called using the command line, you can configure log format
using a command line parameter or using a configuration file. Default
configuration file can be found at `/etc/goaccess.conf`, but you can also pass
other configuration file using `--config-file` option.

Default output format is in the command line, but one can configure an *html*
using a specific output file. This option will create a static html report,
which can be continuously updated using the `--real-time-html` option. 

The following code shows the systemctl file that I use to configure GoAccess as
a service for real time use.

```toml
[Unit]
Description=Goaccess Web log report.
After=network.target

[Service]
Type=simple
User=root
Group=root
Restart=always
ExecStart=/usr/bin/goaccess -a -g -f /var/log/traefik/access.log -o /var/www/html/report.html --real-time-html
StandardOutput=null
StandardError=null

[Install]
WantedBy=multi-user.target
```

GoAccess doesn't include a static web server, so it can not expose the produced
*html* by himself. But one can easily configure an Nginx static server to
expose the static files, as show in the following Nginx virtual server:

```nginx
server {
    listen 8082;
    listen [::]:8082;
    server_name  locahost;

    gzip on;
    gzip_types      text/plain application/xml image/jpeg;
    gzip_proxied    no-cache no-store private expired auth;
    gzip_min_length 1000;

    root /var/www/html;

    # Add index.php to the list if you are using PHP
    index index.html index.htm index.nginx-debian.html;

    location / {
            try_files $uri $uri/ =404;
    }
}
```

## Conclusion

Traefik is a static webserver which is well adapted for dynamic configurations.
Even if still a young project and is not as performant as Nginx, it has an
interesting approach and some nice features.
For example in docker applications, it automatically knows the internal IP
address of a service to redirect the incoming request.

GoAccess is a very good tool to provide insights from logs in a close
environment where you can not share your stats with the exterior. Since it has
been written in C, the reading performances are very good, being able to parse
400 millions of hits in 1 hour and 20 minutes, according to [GoAccess
FAQ](https://goaccess.io/faq).
