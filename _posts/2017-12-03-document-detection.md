---
layout: post
title: "Document detection"
date: 2017-12-03
description: "Docuement detection using opencv"
categories: ["opencv", "python"]

---

Scan images have always undesired white space. It is tedious to crop manually when you have several images. I implemented a simple algorithm to detect the document on an image using image preprocessing functions of opencv. 

## Image preprocessing

We use an example image found on the internet that is similar to scan image with excessive white space around the document.

<amp-img src="/images/document-detection/cni.jpg" alt="Identity docuement" height="300" width="300" ></amp-img>

We use opencv **3.3** to read the image, transform it in gray level, then we
use a [bilateral
filter](http://opencvexamples.blogspot.com/2013/10/applying-bilateral-filter.html)
to remove noise and keep information of the borders, then we apply a [equalized
filter](http://opencv-python-tutroals.readthedocs.io/en/latest/py_tutorials/py_imgproc/py_histograms/py_histogram_equalization/py_histogram_equalization.html)
to increase the contrast of the image and finaly we use [canny edge
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

<amp-img src="/images/document-detection/edged.png" alt="Edge detection" height="100" width="300" layout="responsive"></amp-img>

## Contour detection

We use opencv function
[findContours](https://docs.opencv.org/3.1.0/d4/d73/tutorial_py_contours_begin.html)
to find connected pixels of the image. We use the retrival hierarchie mode to
obtain all contours in a nested hierarchie and simple contour method to obtain
simplified contours. We use a condition of the area of contours to take the
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

<amp-img src="/images/document-detection/contours.png" alt="Contours of the image" height="300" width="300" ></amp-img>

## Image crop

We use the extreme points of the contours to make the crop of the image.

<amp-img src="/images/document-detection/crop_image.png" alt="Cropped image" height="200" width="300" ></amp-img>

The complete code can be found on this [notebook](https://nbviewer.jupyter.org/url/cristianpb.github.io/document-detection/DocuementDetection.ipynb).
