---
layout: post
title: "Image rotation using OpenCV"
date: 2017-05-13
description: "This post shows how to recalculate bounding box coordinates when the image rotate. An example using OpenCV in python is provided."
categories:
  - data science
tags: ["opencv", "python"]
mathjax: false
mathml: true
image:
  path: /assets/img/image-rotation-opencv/main-16x9.jpg
  height: 788
  width: 1400
thumb:
  path: /assets/img/image-rotation-opencv/main-thumb.jpg
  height: 200
  width: 300

---


## Summary of the problem

- We have an image
- We draw some rectangles over as object detection.
- We rotate the image by given angle.
- We need to calculate the new coordinates for each rectangle after the image rotation.

This calculation of the coordinates can be made using an **affine transformation**.

## Affine transformation

The image transformation can be expressed in the form of a matrix
multiplication using an [affine
transformation](https://en.wikipedia.org/wiki/Affine_transformation).  This
matrix can be used to express a rotation, translation and scale operations.
The usual way to represent a affine transformation is using a `2 x 3` matrix.

<amp-mathml layout="container" data-formula="\[M= \left[ {\begin{array}{cc} a_{00} & a_{01} & b_{00}\\ a_{10} & a_{11} & b_{10}\\ \end{array} } \right] \]">
</amp-mathml>


Considering that we want to transform a 2D vector 
<amp-mathml layout="container" data-formula="\[X= \left[ {\begin{array}{cc} x \\ y\\ \end{array} } \right] \]"> </amp-mathml>

The transformed vector can be obtained by 

<amp-mathml layout="container" data-formula="\[T = M \cdot [x, y, 1]^{T}\]"> </amp-mathml>

<amp-mathml layout="container" data-formula="\[ T = \begin{bmatrix} a_{00}x + a_{01}y + b_{00} \\ a_{10}x + a_{11}y + b_{10} \end{bmatrix} \]"> </amp-mathml>

## Transformation matrix

The transformation matrix can be obtained using the rotation angle and the centre coordinates. It can be expressed also as the following structure:

<amp-mathml layout="container" data-formula="\[ \begin{bmatrix} \alpha & \beta & (1- \alpha ) \cdot \texttt{centre.x} - \beta
\cdot \texttt{centre.y} \\ - \beta & \alpha & \beta \cdot \texttt{centre.x} +
(1- \alpha ) \cdot \texttt{centre.y} \end{bmatrix} \]"> </amp-mathml>

Where:

* <amp-mathml layout="container" inline data-formula="\[ \alpha = scale * \cos \theta \]"></amp-mathml>
* <amp-mathml layout="container" inline data-formula="\[ \beta = scale * \sin \theta \]"></amp-mathml>
* and <amp-mathml layout="container" inline data-formula="\[ \theta \]"> </amp-mathml> is the rotation angle.

For this case, we use <amp-mathml layout="container" inline data-formula="\[ scale = 1. \]">

### Adjust coordinates to the new reference point

For this case of rotation image, where the image size changes after rotation
and also the reference point, the transformation matrix has to be modified.
The figure represents how the new dimension is calculated:

<center>
<amp-img src="/assets/img/image-rotation-opencv/dessin.svg" alt="Image rotation schema" height="480" width="640"  layout="responsive"></amp-img>
<br><i>Image rotation schema</i>
</center>

Where the new with and height can be calculated using the following relations:
<amp-mathml layout="container" data-formula="\[ \texttt{new.width} = h*\sin(\theta) + w*\cos(\theta) \]"> </amp-mathml>
<amp-mathml layout="container" data-formula="\[ \texttt{new.height} = h*\cos(\theta) + w*\sin(\theta) \]"> </amp-mathml>

Since the image size changes, the coordinates of the rotation point (centre of the image) change too. Then it has to be taken into account in the transformation matrix.
This is added to the last column of the transformation matrix as follows:

<amp-mathml layout="container" data-formula="\[ \begin{bmatrix} \alpha & \beta & (1- \alpha ) \cdot \texttt{centre.x} - \beta
\cdot \texttt{centre.y} + (\texttt{new.width}/2 - \texttt{centre.x}) \\ - \beta & \alpha & \beta \cdot \texttt{centre.x} +
(1- \alpha ) \cdot \texttt{centre.y} + (\texttt{new.height}/2 - \texttt{centre.y}) \end{bmatrix} \]"> </amp-mathml>

## Implementation using OpenCV

I have implemented the solution in python, using OpenCV.
I use a sample image of a 🐈, because everybody loves cats.
I create the bounding box of the face and the eyes using [Sloth](https://github.com/cvhciKIT/sloth).
The result is a `json` like this:

```json
[
    {
        "annotations": [
            {
                "class": "polygon",
                "xn": "776.9486798180992;881.0203274611703;884.6090049661037;780.5373573230327",
                "yn": "383.9884930278827;380.39981552294927;498.8261731857542;498.8261731857542"
            },
            {
                "class": "polygon",
                "xn": "897.1693762333709;999.4466851239752;1003.0353626289086;900.7580537383044",
                "yn": "534.712948235089;538.3016257400226;653.139305897894;653.139305897894"
            },
            {
                "class": "polygon",
                "xn": "1279.3635305087869;1293.718240528521;624.4298858584261;628.0185633633596",
                "yn": "111.24900265293799;805.6580998575671;787.7147123328997;113.04334140540473"
            }
        ],
        "class": "image",
        "filename": "cat.jpg"
    }
]
```

I load the image `original_image.jpg` and rotate it using a function detailled in `http://www.pyimagesearch.com/2017/01/02/rotate-images-correctly-with-opencv-and-python/`. It is faster than [scipy fonctions](http://www.scipy-lectures.org/advanced/image_processing/#id5).

```python
# Original image
img_orig = cv2.imread('images/original_image.jpg')
# Rotated image
rotated_img = rotate_bound(img_orig, theta)
```

I use a `for` loop to transform each _(x,y)_ coordinates.

```python
new_bb = {}
for i in bb:
    new_bb[i] = rotate_box(bb[i], cx, cy, heigth, width)

```

I create the transformation matrix and modify the third column to take into 
account the new image size.

```python
def rotate_box(bb, cx, cy, h, w):
    new_bb = list(bb)
    for i,coord in enumerate(bb):
        # opencv calculates standard transformation matrix
        M = cv2.getRotationMatrix2D((cx, cy), theta, 1.0)
        # Grab  the rotation components of the matrix)
        cos = np.abs(M[0, 0])
        sin = np.abs(M[0, 1])
        # compute the new bounding dimensions of the image
        nW = int((h * sin) + (w * cos))
        nH = int((h * cos) + (w * sin))
        # adjust the rotation matrix to take into account translation
        M[0, 2] += (nW / 2) - cx
        M[1, 2] += (nH / 2) - cy
        # Prepare the vector to be transformed
        v = [coord[0],coord[1],1]
        # Perform the actual rotation and return the image
        calculated = np.dot(M,v)
        new_bb[i] = (calculated[0],calculated[1])
    return new_bb
```

- The image centre before rotation is:
(2880, 1920)

- The image centre after rotation is:
(2907, 1961)

## Results

<amp-img src="/assets/img/image-rotation-opencv/cat.jpg" alt="image rotation results" height="900" width="600"  layout="responsive"></amp-img>

## Code

```python
import matplotlib as mpl
mpl.use('Agg')
import matplotlib.pyplot as plt
import cv2
import matplotlib.patches as mpatches
import numpy as np
import json

theta = 45

with open('images/example1_labels.json') as json_data:
    d = json.load(json_data)
    print(d)

bb1 = {}
for i,j in enumerate(d[0]['annotations']):
    xs = j['xn'].split(';')
    ys = j['yn'].split(';')
    bb1[i] = [(float(xs[0]),float(ys[0])), (float(xs[1]),float(ys[1])),(float(xs[2]),float(ys[2])),(float(xs[3]),float(ys[3]))]

print(bb1)

def rotate_box(bb, cx, cy, h, w):
    new_bb = list(bb)
    for i,coord in enumerate(bb):
        # opencv calculates standard transformation matrix
        M = cv2.getRotationMatrix2D((cx, cy), theta, 1.0)
        # Grab  the rotation components of the matrix)
        cos = np.abs(M[0, 0])
        sin = np.abs(M[0, 1])
        # compute the new bounding dimensions of the image
        nW = int((h * sin) + (w * cos))
        nH = int((h * cos) + (w * sin))
        # adjust the rotation matrix to take into account translation
        M[0, 2] += (nW / 2) - cx
        M[1, 2] += (nH / 2) - cy
        # Prepare the vector to be transformed
        v = [coord[0],coord[1],1]
        # Perform the actual rotation and return the image
        calculated = np.dot(M,v)
        new_bb[i] = (calculated[0],calculated[1])
    return new_bb

def rotate_bound(image, angle):
    # grab the dimensions of the image and then determine the
    # centre
    (h, w) = image.shape[:2]
    (cX, cY) = (w // 2, h // 2)

    # grab the rotation matrix (applying the negative of the
    # angle to rotate clockwise), then grab the sine and cosine
    # (i.e., the rotation components of the matrix)
    M = cv2.getRotationMatrix2D((cX, cY), angle, 1.0)
    cos = np.abs(M[0, 0])
    sin = np.abs(M[0, 1])

    # compute the new bounding dimensions of the image
    nW = int((h * sin) + (w * cos))
    nH = int((h * cos) + (w * sin))

    # adjust the rotation matrix to take into account translation
    M[0, 2] += (nW / 2) - cX
    M[1, 2] += (nH / 2) - cY

    # perform the actual rotation and return the image
    return cv2.warpAffine(image, M, (nW, nH))

# Original image
img_orig = cv2.imread('images/cat.jpg')
# Rotated image
rotated_img = rotate_bound(img_orig, theta)

# Plot original image with bounding boxes
fig, [ax1, ax2] = plt.subplots(nrows=2,ncols=1,figsize=(12, 18))
plt.tight_layout()
ax1.imshow(img_orig[...,::-1], aspect='auto')
ax1.axis('off')
ax1.add_patch(mpatches.Polygon(bb1[0], lw=3.0, fill=False, color='red'))
ax1.add_patch(mpatches.Polygon(bb1[1], lw=3.0, fill=False, color='red'))
ax1.add_patch(mpatches.Polygon(bb1[2], lw=3.0, fill=False, color='green'))

# Calculate the shape of rotated images
(heigth, width) = img_orig.shape[:2]
(cx, cy) = (width // 2, heigth // 2)
(new_height, new_width) = rotated_img.shape[:2]
(new_cx, new_cy) = (new_width // 2, new_height // 2)
print(cx,cy,new_cx,new_cy)

## Calculate the new bounding box coordinates
new_bb = {}
for i in bb1:
    new_bb[i] = rotate_box(bb1[i], cx, cy, heigth, width)

## Plot rotated image and bounding boxes
ax2.imshow(rotated_img[...,::-1], aspect='auto')
ax2.axis('off')
ax2.add_patch(mpatches.Polygon(new_bb[0],lw=3.0, fill=False, color='red'))
ax2.add_patch(mpatches.Polygon(new_bb[1],lw=3.0, fill=False, color='red'))
ax2.add_patch(mpatches.Polygon(new_bb[2],lw=3.0, fill=False, color='green'))
ax2.text(0.,0.,'Rotation by: ' + str(theta), transform=ax1.transAxes,
           horizontalalignment='left', verticalalignment='bottom', fontsize=30)
name='Output.png'
plt.savefig(name)
plt.cla()
``` 
