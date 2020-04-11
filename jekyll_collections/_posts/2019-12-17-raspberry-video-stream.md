---
layout: post
title: "SSD object detection for video streaming using a Raspberry Pi"
date: 2019-12-17
description: This post shows how to combine resources from a Raspberry pi with object detection algorithms in video streaming application. 
categories:
  - programming
tags: python angular nginx raspberrypi
image:
  path: /assets/img/raspberry-video-stream/main-16x9.jpg
  height: 788
  width: 1400
thumb:
  path: /assets/img/raspberry-video-stream/main-thumb.jpg
  height: 200
  width: 300
video: true

---

The Raspberry Pi is a very popular and versatile device.
One can easily plug a camera and start doing some image
analysis. I have developed a module to [use state of the art object detection
models in the captured images](/blog/ssd-yolo) and also [take photos at regular intervals](/blog/motion-monitor-opencv). In
this article I take my project to another level by implementing this image
processing to streaming videos.

<center>
<amp-img src="/assets/img/raspberry-video-stream/main.jpg" width="338" height="506" layout="intrinsic"></amp-img>
<br><i>Frontend interface of the image analysis module</i>
</center>

## Stream video as a Rest API

My project is composed in two components:
* a [Backend](#backend-code) that will do image processing.
* a [Frontend](#frontend-code) which is a web client that interacts with the backend component.

### Backend code

The backend api will:
* capture image from the camera ;
* do image processing ;
* send process image.

In order to capture the image, I started by using a method from [Miguel Grimberg](https://blog.miguelgrinberg.com/post/flask-video-streaming-revisited) which sends images as a continuous stream of data in a Multipart Response. This method is adapted for cases when there is no image processing to be done or when you have a device more powerful than the Raspberry Pi.

I prefer to reduce the number of send images and send single image image is each http request. This allows me to configure the number of required frames per second in the frontend application and also to turn on and off the object detection module when streaming images.

This can be implemented as a flask route like the following code:

```python
@app.route('/api/single_image')
def single_image():
    detection = bool(request.args.get('detection', False))
    frame = Camera().get_frame()
    if detection:
        frame = Camera().prediction(frame)
    return json.dumps(dict(img=Camera().img_to_base64(frame),
                      width=WIDTH,
                      height=HEIGHT))
```

### Frontend code

The frontend component will fetch the image from the backend route and will
render it in the web application. I used the framework Angular to build a robust typescript application. This framework allows me to have an structured developing environment with the components logic and also it has compilation capabilities to compress and optimize the javascript and css code. The resulting html code is served by the backend application.

The html code fragment to render the image is the following:

{% raw %}
```js
<img [src]="singleImage.img | imageDecode" width="{{ singleImage.width }}" height="{{ singleImage.height }}">
```
{% endraw %}

Note that the imageDecode pipe will transform the image so that it can be read by the browser. The [complete frontend code can be found here](https://github.com/cristianpb/object-detection-frontend).

I customized the frontend application using the [Angular Material Desing](). This allows to have some predefined css styles and also some javascript animations such as [hammer.js](https://hammerjs.github.io/) for gesture recognition.

The frontend application has the following inputs related to object detection:
* a **Cam** button to switch on and off the camera streaming ;
* a **Detection** button to switch on and off the object detection algorithm in the video streaming ;
* a field to set the **Frames per second**.

You can see an utilization example of the application in the following video:

<amp-video width="1280"
  height="720"
  src="/assets/img/raspberry-video-stream/video.webm"
  poster="/assets/img/raspberry-video-stream/main.jpg"
  layout="responsive"
  controls
  loop
  autoplay>
  <div fallback>
    <p>Your browser doesn't support HTML5 video.</p>
  </div>
</amp-video>

## Configure a reverse proxy using NGINX 

A reverse proxy is a component that retrieve resources to a client from other one or more servers. The advantage of using a reverse proxy are:
* only exposing one port of the server to the output
* a compression of static resources such as images
* acting as a load balancer when there is high client demand.

In addition to the backend application, I also use the celery monitoring tool [called Flower](/blog/motion-monitor-opencv#regular-surveillance-using-celery). This monitoring tool comes with a [Flower API](https://flower.readthedocs.io/en/latest/api.html) that can be used to retrieve information about celery tasks.

I use the popular nginx webserver as a reverse proxy to serve my backend and Flower application. The configuration of the virtual server can be found below:

```nginx
# /etc/nginx/conf.d/backend.conf

upstream backend {
  server 127.0.0.1:5000;
}

upstream flower {
  server 127.0.0.1:5555;
}

server {
  listen 80;
  listen [::]:80;
  server_name  raspicam raspicam.local 192.168.0.1;

  gzip on;
  gzip_types      text/plain application/xml image/jpeg;
  gzip_proxied    no-cache no-store private expired auth;
  gzip_min_length 1000;

  location /flower/ {
    rewrite ^/flower/(.*)$ /$1 break;
    proxy_pass http://flower;
    proxy_set_header Host $host;
  }

  location / {
    proxy_pass http://backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
  }

}
```

Flower request have a `/flower/` prefix and will be redirected to the flower
application running at the port 5555, the rest of the request will be directed
to the backend application.

## Conclusions

This application shows how to combine resources from a Raspberry pi with object detection algorithms in video streaming application. 

The most popular use case for this application is a surveillance system, where the device regularly analyse the image and also which can be monitored in more details by streaming the video. 

In the near future I plan to add more analysis capabilities to the frontend application so that one can easily explore the metadata of the collected images.

I have been working in this project since some months as you can see in the related articles. My 
[application code is published in github](https://github.com/cristianpb/object-detection) and it's my most popular repository with more than 15 ⭐. You can add your own if you like.
