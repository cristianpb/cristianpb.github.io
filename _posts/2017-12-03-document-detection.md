---
layout: post
title: "Document detection"
date: 2017-12-03
description: "Docuement detection using opencv"
categories: ["opencv", "python"]
figure: /images/document-detection/contours.png

---

Scanned images have always undesired white space. It is tedious to crop manually when you have several images. In this blog we show how to implemented a simple algorithm to detect the document of an image using image preprocessing functions of opencv. 

<br>

{:.title}
## Image preprocessing

We use an example image found on the internet that is similar to scanned image with excessive white space around the document.

<amp-img src="/images/document-detection/cni.jpg" alt="Identity docuement" height="300" width="300" ></amp-img>

We use opencv **3.3** to read the image, transform it in grey level, then we
use a [bilateral
filter](http://opencvexamples.blogspot.com/2013/10/applying-bilateral-filter.html)
to remove noise and keep information of the borders, then we apply a [equalized
filter](http://opencv-python-tutroals.readthedocs.io/en/latest/py_tutorials/py_imgproc/py_histograms/py_histogram_equalization/py_histogram_equalization.html)
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

<amp-img src="/images/document-detection/edged.png" alt="Edge detection" height="100" width="300" layout="responsive"></amp-img>

<br>

{:.title}
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

<amp-img src="/images/document-detection/contours.png" alt="Contours of the image" height="300" width="300" ></amp-img>

<br>

{:.title}
## Image crop

We use the extreme points of the contours to crop the image.

<amp-img src="/images/document-detection/crop_image.png" alt="Cropped image" height="200" width="300" ></amp-img>

<br>

{:.title}
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

<amp-img src="/images/document-detection/masked.png" alt="Masked image" 
height="100" width="300" layout="responsive"></amp-img>


The complete code can be found on this 
[notebook](https://nbviewer.jupyter.org/url/cristianpb.github.io/images/document-detection/DocuementDetection.ipynb).
