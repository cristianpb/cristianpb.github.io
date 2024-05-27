---
layout: post
title: "Magic wand gesture recognition using Tensorflow and SensiML"
date: 2021-06-04
description: This article aims to demystify the implementation of machine learning algorithms into microcontrollers. It uses runs a TensorflowLite model for gesture recognition in a QuickFeather microcontroller.
categories:
  - data science
  - programming
tags: 
 - fpga
 - python 
 - sensiml 
 - quickfeather
image:
  path: /assets/img/magic-wand/main-16x9.jpg
  height: 788
  width: 1400
thumb:
  path: /assets/img/magic-wand/main-thumb.jpg
  height: 225
  width: 400
video: true

---

During the last decade, IoT devices have become very popular. 
Their small factor size made they optimal for all kind of applications. 
Their technology has also improve in the last decade and now a days they are
are able to do machine learning in the edge.

I recently received a QuickFeather microcontroller from a
[Hackster.IO](https://www.hackster.io/contests/quickfeather) contest. One of
the main features of this device is its built-in eFPGA, which can optimize
parallel computations on the edge.

This post will explore the capabilities of this little beast and show how to
run a machine learning model that was trained using Tensorflow.
The use case will be focused for gesture recognition, so the device will be
able to detect if the movement correspond to one alphabet letter.

## QuickFeather

The QuickFeather is a very powerful device with a small form factor (58mm
x 22mm). It's the first FPGA-enabled microcontroller to be fully supported with
Zephyr RTOS. Additionally it includes a MC3635 accelerometer, a pressure, a
microphone and an integrated Li-Po battery charger.

Unlike other development kits which are based on proprietary hardware and
software tools, QuickFeather is based on open source hardware and is built
around 100% open source software. QuickLogic provides [a nice
SDK](https://github.com/QuickLogic-Corp/qorc-sdk) to flash some FreeRTOS
software and get started. There is a bunch of documentation and examples in
their github repository.

Since the QuickFeather is optimized for battery saving use cases, it doesn't
include neither Wi-Fi nor Bluetooth connectivity. Therefore, the data can be
only transferred using UART serial connection. 

## Capture data

The on-board accelerometer is the main sensor for this use case. I use a
USB-serial converter in order to read data directly from the accelerometer and
transfer it to another host that is connected to the other end of the usb
cable.

Data is captured and analysed using another machine. I personally connected a
raspberry pi, which has also a small form factor, in order to have flexibility
when performing the different gestures.

SensiML provides a [web application](https://github.com/sensiml/open-gateway) to visualize and save data.
This application is a python application that runs a flask webserver and
provides nice functionalities such as capturing video at the save time in order
to correlate to saved data.
The code is available on github, so one can see how the code works and even
[propose some modifications](https://github.com/sensiml/open-gateway/pull/29), like I did.

I captured data from *O*, *W* and *Z* gestures as you can see in the following picture:

<center>
<amp-img src="/assets/img/magic-wand/data-capture.gif" width="640" height="360" layout="intrinsic" alt="data capture using open-gateway application"></amp-img>
<br><i>Data capture using open-gateway application</i>
</center>


## Label data with Label Studio

Once data is collected one need to label it so that one can teach a machine
learning model how to associate a certain movement with a gesture. 
I used [Label Studio](https://labelstud.io/), which is a open source data
labelling tool. It can be used to label different kind of data such as image,
audio, text, time series and a combination of all the precedent.

It can be deployed on-premise using a docker image, which is very handy if you
want to go fast.

### Setup

Once Label Studio stars, it has to be configured for a label task. For this case, the
label task corresponds to a time series data. One can chose a graphical
configuration using preconfigured templates or you can customized your self
with some kind of html code. Here is the code I use to configure the data
coming from *X*, *Y* and *Z* accelerometers.

```html
<View>
  <!-- Control tag for labels -->
  <TimeSeriesLabels name="label" toName="ts">
    <Label value="O" background="red"/>
    <Label value="Z" background="green"/>
    <Label value="W" background="blue"/>
  </TimeSeriesLabels>
  <!-- Object tag for time series data source -->
  <TimeSeries name="ts" valueType="url" value="$timeseriesUrl" sep="," >
    <Channel column="AccelerometerX" strokeColor="#1f77b4" legend="AccelerometerX"/>
    <Channel column="AccelerometerY" strokeColor="#ff7f0e" legend="AccelerometerY"/>
    <Channel column="AccelerometerZ"  strokeColor="#111111" legend="AccelerometerZ"/>
  </TimeSeries>
</View>
```

Label Studio has a nice preview feature, which shows how the labelling task will look with
the supplied configuration. The following screenshot shows how the interface
looks like for the setup process.

<center>
<amp-img src="/assets/img/magic-wand/label-studio1.png" width="901" height="450" layout="intrinsic" alt="label studio setup configuration"></amp-img>
<br><i>Label Studio setup configuration</i>
</center>

### Labelling

One of the nicest things from Label Studio is the fact that one can go really
fast using the keyboard shortcuts. It also provides some machine learning
plugins which make predictions with the partial labelled data.
The following screenshot shows the interface for some labelled data.

<center>
<amp-img src="/assets/img/magic-wand/label-studio2.png" width="901" height="450" layout="intrinsic" alt="label studio data labelled"></amp-img>
<br><i>Data labelled using Label Studio</i>
</center>

From a machine learning perspective, the exported data should be a csv file with four different columns. Even is Label Studio is able to export in csv, it didn't have the right format for me, instead it looks like the following:

```
timeseriesUrl,id,label,annotator,annotation_id
/data/upload/W.csv,3,"[{""start"": 156, ""end"": 422, ""instant"": false, ""timeserieslabels"": [""W""]}, ... ]",admin@admin.com,3
/data/upload/Z.csv,2,"[{""start"": 141, ""end"": 419, ""instant"": false, ""timeserieslabels"": [""Z""]}, ...]",admin@admin.com,2
/data/upload/O.csv,1,"[{""start"": 77, ""end"": 389, ""instant"": false, ""timeserieslabels"": [""O""]}, ...]",admin@admin.com,1
```

So I decided to export labels in json format and then build a python script to
transform and combine them all.  The following script transforms three json files
from *Label Studio* into a single file with 4 columns *AccelerometerX*,
*AccelerometerY*, *AccelerometerZ* and *Label*. 

```python
import numpy as np
import pandas as pd

df_all = pd.DataFrame()
LABELS = ['W', 'Z', 'O']
sensor_columns = ['AccelerometerX','AccelerometerY', 'AccelerometerZ', 'Label']

for ind, label in enumerate(LABELS):
    df = pd.read_csv(f'{label}/{label}.csv')
    events = pd.DataFrame(pd.read_json('WOZ.json')['label'][ind])

    df['Label'] = 0
    for k,v in events.iterrows():
        for i in range(v['start'], v['end']):
            df['Label'].loc[i] = v['timeserieslabels'][0]
    df['LabelNumerical'] = pd.Categorical(df.Label)

    df[sensor_columns].to_csv(f'{label}/{label}_label.csv', index=False)
    df_all = pd.concat([df_all, df], sort=False)

df_all[sensor_columns].to_csv(f'WOZ_label.csv', index=False)
```

The resulting data can be directly used as a time series data and a machine
learning model can be trained in order to recognise the patterns automatically.
The following picture shows data for W, O and Z patterns.

<center>
<amp-img src="/assets/img/magic-wand/matplotlib-data.png" width="1200" height="350" layout="intrinsic" alt="labelled data plotted using matplotlib"></amp-img>
<br><i>Labelled data for W, O and Z gestures</i>
</center>

## Training a model using SensiML

SensiML provides a python package to build a data pipeline which can be used to
train a machine learning model. One need to create a free account in order to
use it. There is a lot of [documentation and examples](https://sensiml.com/tensorflow-lite/)
available online.

### Pipeline

Pipelines are a key component of the SensiML workflow. Pipelines store the
preprocessing, feature extraction, and model building steps. 

Model training can be done using either SensiML cloud or using Tensorflow to
train the model locally and the uploading it to SensiML in order to obtain the
firmware code to run on the embedded device.

In order to train the model locally, one needs to build a data pipeline to process data and calculate the feature vector.
This is done using the following pipeline:
* The **Input Query** function which specifies what data is being fed into the model
* The **Segmentation** which specifies how the data should be feed to the classifier.
* **Windowing** segmented which captures data depending on gesture expected length.
* The **Feature Generator** which specify which features should be extracted from the raw time-series data
* The **Feature Selector** which selects the best features. In this case, we are using the custom feature selector to downsample the data.
* The **Feature Transform** which specifies how to transform the features after extraction. In this case, it is to scale them to 1 byte each

Here is the python code for the pipeline

```python
dsk.pipeline.reset()
dsk.pipeline.set_input_data('wand_10_movements.csv', group_columns=['Label'], label_column='Label', data_columns=sensor_columns)

dsk.pipeline.add_segmenter("Windowing", params={"window_size": 350, "delta": 25, "train_delta": 25, "return_segment_index": False})

dsk.pipeline.add_feature_generator(
    [
        {'subtype_call': 'Statistical'},
        {'subtype_call': 'Shape'},
        {'subtype_call': 'Column Fusion'},
        {'subtype_call': 'Area'},
        {'subtype_call': 'Rate of Change'},
    ],
    function_defaults={'columns': sensor_columns},
)

dsk.pipeline.add_feature_selector([{'name':'Tree-based Selection', 'params':{"number_of_features":12}},])

dsk.pipeline.add_transform("Min Max Scale") # Scale the features to 1-byte
```

### TensorFlow model

I use the TensorFlow Keras API to create a neural network. This model is very simplified because not all Tensorflow functions and layers are available in the microcontroller version.  I use a fully connected network to efficiently classify the gestures. It takes in input the features vectors created previously with the pipeline (12).

```python
from tensorflow.keras import layers
import tensorflow as tf

tf_model = tf.keras.Sequential()

tf_model.add(layers.Dense(12, activation='relu',kernel_regularizer='l1', input_shape=(x_train.shape[1],)))
tf_model.add(layers.Dropout(0.1))
tf_model.add(layers.Dense(8, activation='relu', input_shape=(x_train.shape[1],)))
tf_model.add(layers.Dropout(0.1))
tf_model.add(layers.Dense(y_train.shape[1], activation='softmax'))

# Compile the model using a standard optimizer and loss function for regression
tf_model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
```
 
### Training 
 
The training is performed by feeding the neural network with the dataset by
batches of data. For each batch of data a loss function is computed and the
weights of the network are adjusted.  Each time it loops through the entire training set, then is
called an epoch. In the following picture:
* at the top left we can see the evolution of the loss function, it decreased, meaning that it converges to a optimal solution.
* at the bottom left we can see the evolution of the accuracy of the model, it increases!
* at the right we have the confusion matrix for the validation and train set.

<center>
<amp-img src="/assets/img/magic-wand/train-loss.png" width="1200" height="450" layout="intrinsic" alt="Model training performance"></amp-img>
<br><i>Model training performance</i>
</center>
 
The confusion matrix provides information not only about the accuracy but also
about the kind of errors of the model. It's often the best way to understand
which classes are difficult to distinguish.

Once you are satisfied with the model results, it can be optimized using
Tensorflow quantize function. The quantization reduces the model size by
converting the network weights from 4-byte floating point values to 1-byte
unsigned int8. Tensorflow provides the following built-in tool:

```python
# Quantized Model
converter = tf.lite.TFLiteConverter.from_keras_model(tf_model)
converter.optimizations = [tf.lite.Optimize.OPTIMIZE_FOR_SIZE]
converter.representative_dataset = representative_dataset_generator
tflite_model_quant = converter.convert()
```

There are more benefits by quantizing the model for Cortex-M processors like
the Quickfeather, which uses some instructions that gives a boost in performance.

The quantized model can be uploaded to SensiML in order to obtain a firmware to
flash to the QuickFeather.  One can download the model using the jupyter
notebook widget or in [sensiml cloud application](https://app.sensiml.cloud/).
There are two available formats:
  * **binary**: this can be flashed directly to the QuickFeather. The results
    are transferred using serial output.
  * **library**: this is a *knowledgepack* form, which can be used in *Qorc SDK*
    to compile. There is more flexibility for this option, because one can
    modify source code before compiling.


## Export model to Quickfeather

The knowledgepack can be customized in order to light the QuickFeather led with
a different colour depending on the prediction made.
This can be done by adding the following function to the *src/sml_output.c* file.

```c++
// src/sml_output.c
static intptr_t last_output;

uint32_t sml_output_results(uint16_t model, uint16_t classification)
{

    //kb_get_feature_vector(model, recent_fv_result.feature_vector, &recent_fv_result.fv_len);

    /* LIMIT output to 100hz */

    if( last_output == 0 ){
        last_output = ql_lw_timer_start();
    }

    if( ql_lw_timer_is_expired( last_output, 10 ) ){
        last_output = ql_lw_timer_start();

        if ((int)classification == 1) {
            HAL_GPIO_Write(4, 1);
        } else {
            HAL_GPIO_Write(4, 0);
        }

        if ((int)classification == 2) {
            HAL_GPIO_Write(5, 1);
        } else {
            HAL_GPIO_Write(5, 0);
        }

        if ((int)classification == 3) {
            HAL_GPIO_Write(6, 1);
        } else {
            HAL_GPIO_Write(6, 0);
        }
    	sml_output_serial(model, classification);
    }
    return 0;
}
```

Finally the model can be compiled using *Qorc SDK* and flashed again to the QuickFeather.

## Test model using Quickfeather

One can use a Li-Po battery with the battery connector of the QuickFeather in order to have complete autonomy.
Then using a nice spoon like the following one can improvise a magic wand 🪄:

<center>
<amp-img src="/assets/img/magic-wand/magic-wand.jpg" width="337" height="600" layout="intrinsic" alt="quickfeather as a magic wand"></amp-img>
<br><i>QuickFeather as a magic wand</i>
</center>

The following video shows the recognition system in action, the colours mean he following:
* **red** for O gesture
* **green** for W gesture
* **blue** for Z gesture
 
<center>
<amp-video width="360"
  height="640"
  src="/assets/img/magic-wand/magic-wand.mp4"
  poster="/assets/img/magic-wand/magic-wand.jpg"
  layout="intrinsic"
  controls
  loop
  autoplay>
  <div fallback>
    <p>Your browser doesn't support HTML5 video.</p>
  </div>
</amp-video>
</center>


## Conclusions

QuickFeather is a device completely adapted for tiny machine learning models.
This use case provides a simple example to demystify the whole workflow for
implementing machine learning algorithms to microcontrollers, but it can be
extended for more complex use cases, like the one provided in the [Hackster.io
Climate Change
Challenge](https://www.hackster.io/climate-change-challengers/hydroponic-agriculture-learning-with-sensiml-ai-framework-5289ea).

SensiML provides provides nice tools to simplify machine learning
implementation for microcontrollers. They provide software like [Data Capture
Lab](https://sensiml.com/services/toolkit/open-gateway/), which capture data and
also provides a labelling module. However, for this case I prefer to use Label
Studio, which is more generic tool, that works for most use cases.

The notebook with the complete details about the model training can be found in [this gist](https://gist.github.com/cristianpb/4b86c5176d9d305aaa2974ce9c3c83f8).
