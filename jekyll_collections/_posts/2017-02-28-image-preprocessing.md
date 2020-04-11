---
layout: post
title: "Image preprocessing"
date:   2017-02-28 21:01:25 +0200
categories: 
  - data science
tags: ["opencv", "python"]
description: A presentation slide for how to use reveal.js in Jekyll
image:
  path: /assets/img/image-preprocessing/main-16x9.jpg
  height: 788
  width: 1400
thumb:
  path: /assets/img/image-preprocessing/main-thumb.jpg
  height: 200
  width: 300

---

Revealjs presentation available in [GitPitch](https://gitpitch.com/cristianpb/PresentationTechnique/master?grs=github&t=black)

## Image preprocessing

- Many traditional computer vision image classification algorithms follow this pipeline
- Deep Learning based algorithms bypass the feature extraction step completely

## Preprocessing 

### Deskew

Align an image to a reference assits the classification algorithm 
[1](http://docs.opencv.org/trunk/dd/d3b/tutorial_py_svm_opencv.html),
[2](https://www.learnopencv.com/handwritten-digits-classification-an-opencv-c-python-tutorial/).

<amp-img src="/assets/img/image-preprocessing/deskew1.jpg" alt="Deskew" height="200" width="100" ></amp-img>

Deskewing simple grayscale images can be achieved using image moments (distance and intensity of pixels). 

```python
def deskew(img):
    m = cv2.moments(img)
    if abs(m['mu02']) < 1e-2:
        # no deskewing needed. 
        return img.copy()
    # Calculate skew based on central momemts. 
    skew = m['mu11']/m['mu02']
    # Calculate affine transform to correct skewness. 
    M = np.float32([[1, skew, -0.5*SZ*skew], [0, 1, 0]])
    # Apply affine transform
    img = cv2.warpAffine(img, M, (SZ, SZ), flags=cv2.WARP_INVERSE_MAP | cv2.INTER_LINEAR)
    return img
```

This deskewing of simple grayscale images can be achieved using image moments.
OpenCV has an implementation of moments and it comes in handy while calculating
useful information like centroid, area, skewness of simple images with black
backgrounds.

It turns out that a measure of the skewness is the given by the ratio of the
two central moments ( mu11 / mu02 ). The skewness thus calculated can be used
in calculating an affine transform that deskews the image.

### Histogram equalization

Increase image contrast using the image's histogram.

<amp-img src="/assets/img/image-preprocessing/histogram_equalization.png" alt="histogram equalization" height="100" width="300" ></amp-img>

## Conclusions

- Image preprocessing can significantly increase the performance of a
  classification algorithm.
- A feature descriptor represents a simplified version of an image by
  extracting useful information and throwing away extraneous information.
- Using feature description increases training speed compared with raw images.
