---
layout: post
title: "Document detection"
date: 2017-12-03
description: "This post shows how to implemented a simple algorithm to detect a document inside and scanned image using python and the image processing library opencv"
categories:
  - data science
tags: ["opencv", "python"]
image:
  path: /assets/img/document-detection/main-16x9.jpg
  height: 788
  width: 1400
thumb:
  path: /assets/img/document-detection/main-thumb.jpg
  height: 200
  width: 300

---

Scanned images have always undesired white space. It is tedious to crop manually when you have several images. In this blog we show how to implemented a simple algorithm to detect the document of an image using image preprocessing functions of opencv. 

## Image preprocessing

We use an example image found on the internet that is similar to scanned image with excessive white space around the document.

<amp-img src="/assets/img/document-detection/cni.jpg" alt="Identity docuement" height="300" width="300" layout='intrinsic'></amp-img>

We use opencv **3.3** to read the image, transform it in grey level, then we
use a [bilateral
filter](https://opencvexamples.blogspot.com/2013/10/applying-bilateral-filter.html)
to remove noise and keep information of the borders, then we apply a equalized
filter
to increase the contrast of the image and finally we use [canny edge
detection](https://docs.opencv.org/3.1.0/da/d22/tutorial_py_canny.html)
algorithm to detect edges of the image.

```python
img = cv2.imread('cni.jpg')
img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
bilateral = cv2.bilateralFilter(gray, 5, 5,5)
eq = cv2.equalizeHist(bilateral)
edged = cv2.Canny(eq, 0, 150)
```

<amp-img src="/assets/img/document-detection/edged.png" alt="Edge detection" height="100" width="300" layout="responsive"></amp-img>

## Contour detection

We use Opencv function
[findContours](https://docs.opencv.org/3.1.0/d4/d73/tutorial_py_contours_begin.html)
to find connected pixels of the image. We use the retrieval hierarchy _mode_ to
obtain all contours in a nested hierarchy and simple contour _method_ to obtain
simplified contours. We set a condition of the area of contours to take the
biggest contours in the image.

```python
_, contours, hierarchy = cv2.findContours(edged, cv2.RETR_TREE,  cv2.CHAIN_APPROX_SIMPLE)
h, w = img.shape[:2]
thresh_area = 0.001
list_contours = list()
for c in contours:
    area = cv2.contourArea(c)

    if (area > thresh_area*h*w): 
        rect_page = cv2.minAreaRect(c)
        box_page = np.int0(cv2.boxPoints(rect_page))
        list_contours.append(box_page)
```

The result are the biggest contours in the image. Then we can use the biggest one to crop our image.

<amp-img src="/assets/img/document-detection/contours.png" alt="Contours of the image" height="300" width="300" layout='intrinsic'></amp-img>

## Image crop

We use the extreme points of the contours to crop the image.

<amp-img src="/assets/img/document-detection/crop_image.png" alt="Cropped image" height="200" width="300" layout='intrinsic'></amp-img>

## Background color substitution

The biggest contour can be found using the `max` python function, ordering by 
contour area with the function `cv2.contourArea`. Other contour properties can 
be found at [Opencv 
Contours](https://docs.opencv.org/3.1.0/d1/d32/tutorial_py_contour_properties.html).
This biggest contour is filled with the function `cv2.fillPoly` to create the 
mask to select the important information of the image.

```python
c = max(list_contours, key=cv2.contourArea)
mask = np.zeros(img.shape, dtype=np.uint8)
mask = cv2.fillPoly(img=img.copy(), pts=c.reshape(1, -2, 2), color=(0,0,0))
masked_image = cv2.bitwise_and(img, ~mask)
```

This mask is used again to initializate the background of the image and then 
add it to the masked image from the previous step.

```python
background = np.zeros(img.shape, dtype=np.uint8)
background[:,:,:] = 128
masked_bg = cv2.bitwise_and(background, mask)
```

<amp-img src="/assets/img/document-detection/masked.png" alt="Masked image" height="100" width="300" layout="responsive"></amp-img>


The complete code can be found on this 
[notebook](https://gist.github.com/cristianpb/4ed3b3a692e0059c4d0c7361653f0cbb).
