---
layout: post
title: "Using an Arduino MKR FOX for IoT applications to run for months"
date: 2020-03-08
description: Microcontrollers are adapted for simple task which don't need a lot of battery power. This post shows how to put in actions the Arduino MKR Fox for capturing temperature measurements and send them to Sigfox Cloud.
categories:
  - programming
tags: arduino nodejs serverless chartjs
image:
  path: /assets/img/arduino-sigfox-mkr1200/main-crop.jpg
  height: 200
  width: 300

---

IoT devices need to run during long periods of time. Microcontrollers are
adapted for simple tasks like taking a measurement or activating a signal.

Arduino open source platform allows to write software for microcontrollers.

Sigfox allows IoT devices to communicate with the cloud in remote places.
Battery is a concern for IoT because devices should run for long periods of
time.

The Arduino MKR FOX 1200 is a designed to run Arduino code, use Sigfox network
to communicate and have a battery which run for long periods of time.


## Arduino MKR FOX 1200

This device has the following specifications:
* 8 I/O pins, which allows to connect a multiple devices ;
* 5 volt power supply, which can be supplied by USB connection or VIN pin ;
* 256 KB of flash memory

One advantage is the possibility of connecting 2 AA batteries easily to the device.

The device is supplied with a antenna connected directly to the board.

## Program the device with Arduino

The board can be programmed using *C* or *C++*.
Arduino provide it's own IDE to write the software, compile it and send it to
the device.

For command line lovers there are other options like platformio.io or ino
package, but it involves dealing with complex Makefiles, so I still use Arduino
IDE for matter of simplicity.

### Setup the device

The first part is to get the device ID and PAC number. Sigfox provide an
[Arduino sketch file](https://github.com/sigfox/mkrfox-init), which connects to
the board and shows the ID and PAC number in the serial console.

This information is need in the [sigfox backend](https://backend.sigfox.com) to
configure the device and receive the messages. Sigfox has a very well
documentation to register their devices.

**For development environment**, I connected the device from the micro usb input to my
laptop usb port. This allows me to power the device and use the serial
communication at the same time.

<center>
<amp-img src="/assets/img/arduino-sigfox-mkr1200/usbconnection.jpg" width="750" height="546" layout="intrinsic"></amp-img>
<br><i>Development environment connected to PC</i>
</center>

**For production environment**, I power the device using the battery connection with
2 AA batteries. The constructor announces at least 6 months of power, which I
think might be possible using the low power mode between sending messages.

<center>
<amp-img src="/assets/img/arduino-sigfox-mkr1200/main.jpg" width="800" height="600" layout="intrinsic"></amp-img>
<br><i>Production environment using 2 AA batteries</i>
</center>


### Send information to the Cloud using Sigfox

I used the [sample code from Antoine de
Chassey](https://github.com/AntoinedeChassey/MKRFOX1200_weather_station) to get
information from the DHT22 and send it to sigfox cloud.

Sigfox allows to send up to 140 messages per day, each message can have a
maximum length of 12 bytes. This is enough for cases when you need to send only
small amount of information, like data from measurements.

As a reminder, **1 byte == 8 bits**. So if we want to sent 1 unsigned byte, it
can be from 0 to 255. If we need to add a sign, it can be form 0 to 127.
For **2 bytes**: the range is 0-65535 for unsigned and the half for signed values.

In Antoine de Chassey's code, the message contains:
* The module temperature in int16 (integer of 16 bits, which represent 2 bytes) ;
* The temperature from the DHT22 sensors in int16 (integer of 16 bits, which is 2 bytes) ;
* The humidity from the DHT22 sensor in uint16 (unsigned integer of 16 bits, which is 2 bytes) ;
* The status of the last send message in uint8 (unsigned integer of 8 bits, which is 1 byte).

Finally, we only used 7 bytes in each message. Smaller message reduces transmission times, and increases battery.

## Use Sigfox API V2 to build a serverless dashboard

It should be decoded from the cloud
I use sigfox-parser package to convert payload

```
var format = 'moduleTemp::int:16:little-endian dhtTemp::int:16:little-endian dhtHum::uint:16:little-endian lastMsg::uint:8';
```

## Conclusion

This device allows to easily connect IoT with Sigfox network and that way to the cloud.
The battery input allows to power the device for long peeriods of time. The
constructor announced at least 6 months, which I'm currently testing right now.

Thanks to Sigfox team for organizing the Hacksters Sigfox Universities
Challenge 2019, where I got the top 10 price and obtained an Arduino MKR FOX
1200.
