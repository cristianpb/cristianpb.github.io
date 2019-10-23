---
layout: post
title: "Real time motion detection in Raspberry Pi"
date: 2019-08-09
description: In this article I show how to use a Raspberry Pi with motion detection algorithms and schedule task to detect objects using SSD Mobilenet and Yolo models.
categories: opencv raspberrypi python
image:
  path: /assets/img/motion-monitor/main-crop.jpg
  height: 200
  width: 300
ligthbox: true
video: true

---

Raspberry Pi are small devices that can be combined with captors to get information from the environment such as cameras, microphones or temperature sensors. In addition they have a fair amount of computational power in order to be used for [edge computing](https://en.wikipedia.org/wiki/Edge_computing).

In this article I explore some applications using a PiCamera and computer vision library OpenCV.

## Object detection using YoloV3 and SSD Mobilenet

Deep learning algorithms are the first AI application that can be used for image analysis.
Some of the most poplars algorithms that can be used in Raspberry Pi environments are SSD Mobilenet and YoloV3 since they are light and have a good quality/price ratio.

>In a [previous article](https://cristianpb.github.io/blog/ssd-yolo) I compared these two algorithms using the deep learning module from OpenCV.

Since then I have made some progress to my implementations by cleaning the code and using more numpy matrix operations instead of *for loops* and especially thanks to an optimized version of OpenCV for the Raspberry Pi.

The traditional version of OpenCV proposed by Raspbian repositories comes from version 3.3 which is late compared to the most recent one and it's compiled using the native compiler for ARM architectures.
The version proposed by Dario Limongi is compiled using TBB, Neon and VFPV3 libraries, which raises the potential of computer vision applications for the Raspberry Pi.

Adrian Rosebrock, from [PyImageSearch](https://www.pyimagesearch.com/2017/10/09/optimizing-opencv-on-the-raspberry-pi/), states that this optimized version
gives 30% global speed increase and 48% speed for DNN OpenCV module.

I have installed this Faster OpenCV version and run the same test for detection using SSD Mobilenet and Yolo detection. The results are showed in the following table:

Device | SSD Mobilenet  | | Yolo V3 tiny |
---|---|---
| Model loading [s] | Inference [s] | Model loading [s] | Inference [s]
PC | 0.5 | 0.19 | 0.091 | 0.2
Raspberry     | 2.97 | <s>2.31</s> **1.48** | 0.6 | <s>3.0</s> **1.75**

<br>

I'm pretty happy with the results. The gain in speed is approximately of 44%.
SSD Mobilenet is still the fastest from both of them and I prefer it's detection performance.

I must say that installing this OpenCV version is also very easy since we can find the compiled `.deb` files. The complete instructions can be found at his [github page](https://github.com/dlime/Faster_OpenCV_4_Raspberry_Pi)


## Motion sensor using difference of images

Another popular application for Raspberry Pi is home surveillance. This can be achieved using motion detection algorithms. A simple implementation can be done by:

* taking a sequence of pictures,
* comparing two consecutive pictures using a subtraction of values,
* filtering the differences in order to detect movement.

This simple algorithm can be used to spot the difference for two pictures. I used [my motion detection algorithm](https://github.com/cristianpb/object-detection/blob/master/backend/motion.py) for the following Sponge Bob pictures in order to find the differences between the two pictures. It can detect the 3 differences from Sponge Bob and also the difference on the image borders (that I made when cropping the original image to obtain image 1 and 2).

<div class="columns is-mobile is-multiline is-horizontal-center">
<div class="column is-4-desktop is-6-mobile">
<amp-image-lightbox id="lightbox2"
  layout="nodisplay"></amp-image-lightbox>
<amp-img on="tap:lightbox2"
  role="button"
  tabindex="0"
  aria-describedby="SpongeBob1"
  alt="Image 1 from Sponge Bob"
  title="Image 1 from Sponge Bob"
  src="/assets/img/motion-monitor/l.jpg"
  layout="responsive"
  width="319"
  height="479"></amp-img>
<div id="SpongeBob1">
  Image 1 from Sponge Bob
</div>
</div>
<div class="column is-4-desktop is-6-mobile">
<amp-img on="tap:lightbox2"
  role="button"
  tabindex="0"
  aria-describedby="SpongeBob2"
  alt="Image 2 from Sponge Bob"
  title="Image 2 from Sponge Bob"
  src="/assets/img/motion-monitor/r.jpg"
  layout="responsive"
  width="319"
  height="479"></amp-img>
<div id="SpongeBob2">
  Image 2 from Sponge Bob
</div>
</div>
<div class="column is-4-desktop is-6-mobile">
<amp-img on="tap:lightbox2"
  role="button"
  tabindex="0"
  aria-describedby="SpongeBobDifference"
  alt="Difference from Image 1 and 2 of SpongeBob"
  title="Difference from Image 1 and 2 of SpongeBob"
  src="/assets/img/motion-monitor/outputcv.jpg"
  layout="responsive"
  width="319"
  height="479"></amp-img>
<div id="SpongeBobDifference">
  Differences from Image 1 and 2 of Sponge Bob
</div>
</div>
</div>


I organized my code in a python class that contains 3 methods:
* Prediction: 
  * Transform image to gray scale and apply a Gaussian Blur.
    ```python
      image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
      image = cv2.GaussianBlur(image, (21, 21), 0)
    ```
  * Soft first image and calculate the difference between two images 
    ```python
      if self.avg is None:
          self.avg = image.copy().astype(float)
      cv2.accumulateWeighted(image, self.avg, 0.5)
      frameDelta = cv2.absdiff(image, cv2.convertScaleAbs(self.avg))
    ```
  * Detects contours from differences
    ```python
      thresh = cv2.threshold(
              frameDelta, DELTA_THRESH, 255,
              cv2.THRESH_BINARY)[1]
      thresh = cv2.dilate(thresh, None, iterations=2)
      cnts = cv2.findContours(
              thresh.copy(), cv2.RETR_EXTERNAL,
              cv2.CHAIN_APPROX_SIMPLE)
      cnts = imutils.grab_contours(cnts)
    ```
* Filter contours: Remove small contours
* Draw boxes: Draw motion detections in image 


<div class="columns is-mobile is-multiline is-horizontal-center">
<div class="column is-4-desktop is-6-mobile">
<amp-image-lightbox id="lightbox3"
  layout="nodisplay"></amp-image-lightbox>
<amp-img on="tap:lightbox3"
  role="button"
  tabindex="0"
  aria-describedby="Soft1"
  alt="Soft image 1"
  title="Soft image 1"
  src="/assets/img/motion-monitor/soft.jpg"
  layout="responsive"
  width="319"
  height="479"></amp-img>
<div id="Soft1">
  Soft image 1
</div>
</div>
<div class="column is-4-desktop is-6-mobile">
<amp-img on="tap:lightbox3"
  role="button"
  tabindex="0"
  aria-describedby="Average1"
  alt="Average image 1"
  title="Average image 1"
  src="/assets/img/motion-monitor/avg.jpg"
  layout="responsive"
  width="319"
  height="479"></amp-img>
<div id="Average1">
  Average image 1
</div>
</div>
<div class="column is-4-desktop is-6-mobile">
<amp-img on="tap:lightbox3"
  role="button"
  tabindex="0"
  aria-describedby="FrameDelta"
  alt="Frame delta differences"
  title="Frame delta differences"
  src="/assets/img/motion-monitor/framedelta.jpg"
  layout="responsive"
  width="319"
  height="479"></amp-img>
<div id="FrameDelta">
  Delta between two images
</div>
</div>
</div>

This algorithm has very low power consumption and during my tests it was 10 times faster than SSD Mobilenet. The only disadvantage is the fact that it needs an almost static background to work well, if not it will increase false positive errors. 
Still it's very light and can run near *real time* in a Raspberry Pi as you can see in the following video:

<amp-video width="1280"
  height="720"
  src="/assets/img/motion-monitor/main.webm"
  poster="/assets/img/motion-monitor/main.jpg"
  layout="responsive"
  controls
  loop
  autoplay>
  <div fallback>
    <p>Your browser doesn't support HTML5 video.</p>
  </div>
</amp-video>


## Regular surveillance using celery

Running these algorithms in the Raspberry Pi increase the temperature easily and if you don't have the correct cooling it can damage your device. This is why I prefer to run this task at regular intervals.

There are several ways to do this:
* Running a cron job
* Using python `time.sleep()` function
* Using a task manager 

I prefer using a task manager in order to have a more detailed control of the tasks. I decided to use Celery, which is an asynchronous task runner, it allows you to turn your function into a task that will be executed in the background. It's specially adapted for long task and it can be distributed in different workers. It will nicely handle all problems with your script, it can retry a task, report problems log, etc. 

Turning the computer vision function into a Celery task is easy, I just need to create a Celery instance and decorate the task with Celery `task` decorator. The regular task can be added to the Celery instance in the`beat_schedule` parameter.

```python
celery = Celery("app")
celery.conf.update(
        broker_url='redis://localhost:6379/0',
        result_backend='redis://localhost:6379/0',
        beat_schedule={
            "photos_SO": {
                "task": "backend.camera_pi.CaptureContinous",
                "schedule": timedelta(seconds=int(str(os.environ['BEAT_INTERVAL']))),
                "args": []
                }
            }
)

@celery.task(bind=True)
def CaptureContinous(self):
    with PiCamera() as camera:
        # rest of the code
```

In order to call the Celery instance, I can use the following command:

```bash
python3 -m celery -A backend.camera_pi worker -B --loglevel=INFO;
```

* The `-A` parameter stands for the *app* to be controlled
* The `-B` parameter stands for *beat* in order to launch recurrent task
* The `--loglevel` is self explanatory.

Celery needs a database to manage tasks. Some of the most popular are redis and Rabbitmq. 

You should see in logs that Celery is up and running, scheduling task at regular intervals:


```yaml
[2019-08-11 14:35:38,480: INFO/Beat] beat: Starting...
[2019-08-11 14:35:38,579: INFO/Beat] Scheduler: Sending due task photos_SO (backend.camera_pi.CaptureContinous)
[2019-08-11 14:35:39,030: INFO/MainProcess] Connected to redis://localhost:6379/0
[2019-08-11 14:35:39,080: INFO/MainProcess] mingle: searching for neighbors
[2019-08-11 14:35:40,186: INFO/MainProcess] mingle: all alone
[2019-08-11 14:35:40,237: INFO/MainProcess] celery@raspicam ready.
[2019-08-11 14:35:40,368: INFO/MainProcess] Received task: backend.camera_pi.CaptureContinous[555ecac8-122a-4a87-8973-c3609de556aa]  
[2019-08-11 14:35:43,626: INFO/ForkPoolWorker-2] Task backend.camera_pi.CaptureContinous[555ecac8-122a-4a87-8973-c3609de556aa] succeeded in 2.253857854026137s: None
```

###  Monitor celery tasks

Celery comes with different tools to monitor tasks:
* using the CLI with commands such as `celery -A proj status`
* Using the web based administration tool [Flower](https://docs.celeryproject.org/en/latest/userguide/monitoring.html#flower-real-time-celery-web-monitor). It can monitor in real time the different tasks. It’s under active development, but is already an essential tool. Being the recommended monitor for Celery, it obsoletes the Django-Admin monitor, celerymon and the ncurses based monitor.

One can monitor tasks that runs on a remote client by specifying it's own broker IP address and port:

```bash
celery flower --broker=redis://192.168.43.1:6379/0
```

### Some results

I'm satisfied with the results. It's has been almost 5 months since I started to take some photos regularly using the SSD Mobilenet model to filter only photos that contain an object. The Raspberry Pi has been able to do that and also some other tasks. You can see some examples of the photos that I have been able to take during the days:

<amp-image-lightbox id="lightbox5"
  layout="nodisplay"></amp-image-lightbox>
<amp-img on="tap:lightbox5"
  role="button"
  tabindex="0"
  aria-describedby="SpongeBob1"
  alt="Image 1 from Sponge Bob"
  title="Image 1 from Sponge Bob"
  src="/assets/img/motion-monitor/tree_evolution.jpg"
  layout="responsive"
  width="960"
  height="480"></amp-img>
<div id="SpongeBob1">
  Tree evolution during spring transition
</div>

## Conclusions

Rapsberry Pi are very versatile units, nowadays there are some devices that are are specialized to run deep learning algorithms such as coral dev board or the jetson nano from NVIDIA. However Raspberry Pi stands as the most popular device by far and has a great community behind which makes easy when building some projects with.

Running long and recurrent task using a task manager such as Celery has the advantage of running your process in the background, so that any other tasks that runs in the same device are not directly affected. For example I also have a server app to stream video from the Pi Camera, so having Celery simplifies my code, which I will talk in the future.

As always the code is available in [github](https://github.com/cristianpb/object-detection). 
