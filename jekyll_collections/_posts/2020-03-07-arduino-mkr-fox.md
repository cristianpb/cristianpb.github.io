---
layout: post
title: "Arduino MKR FOX 1200 for IoT and a serverless architecture using Sigfox API"
date: 2020-03-08
description: Microcontrollers are adapted for simple task which don't need a lot of battery power. This post shows how to put in actions the Arduino MKR Fox for capturing temperature measurements, send them to Sigfox Cloud and expose the results in a serverless dashboard.
categories:
  - programming
tags: arduino nodejs serverless chartjs
image:
  path: /assets/img/arduino-sigfox-mkr1200/main-16x9.jpg
  height: 788
  width: 1400
thumb:
  path: /assets/img/arduino-sigfox-mkr1200/main-thumb.jpg
  height: 200
  width: 300


---

Internet of thing (IoT) systems involves multiple devices that are connected to
the cloud. These devices are not always near a power station, so their battery
need to last for long periods of time. Microcontrollers are adapted for simple
tasks like taking a measurement or activating a signal and since they have
simple architectures, they need low power to run.

Arduino is a big player in the IoT field, their open source platform allows
writing software for microcontrollers. These devices can communicate using
standard protocols like WiFi, Bluetooth or Low Power Wide Area (LPWA) networks.
LPWA protocol is adapted for applications that need to communicate in remote
places where there is no WiFi available. Sigfox is a great player in this
field.

Sigfox partnered with Arduino to produce the Arduino MKR FOX 1200, which can
connect easily with Sigfox network.  The Arduino MKR FOX 1200 is a designed to
run Arduino code, use Sigfox network to communicate and have a battery which
run for long periods of time.

In this article I will show how to set up the device, send messages to the
Sigfox network and create a serverless architecture to display the collected
messages.

## Arduino MKR FOX 1200

Arduino MKRFOX1200 has been designed to offer a practical and cost effective
solution for makers seeking to add SigFox connectivity to their projects with
minimal previous experience in networking.

Its USB port can be used to supply power (5V) to the board. It has a screw
connector where to attach a 3V battery pack. The board consumes so little that
it runs on two 1,5V batteries type AA or AAA for a really long time.

It has 8 I/O pins allows for different applications. For more information
about the board, you can see [Arduino's
page](https://www.arduino.cc/en/Main.ArduinoBoardMKRFox1200).


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
<br><i>Production environment using 2 AA batteries. The orange lights means that a message is being transmitted.</i>
</center>

The following image shows a Fritzing schema, which shows clearly how to connect
each wire. This is very useful when you want to recreate the project.

<center>
<amp-img src="/assets/img/arduino-sigfox-mkr1200/fritzing.png" width="900" height="756" layout="intrinsic"></amp-img>
<br><i>Detailled pin connection schema.</i>
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

In Antoine de Chassey's code, this message is passed using the following *C++* structure:

```cpp
typedef struct __attribute__ ((packed)) sigfox_message {
    int16_t moduleTemperature;
    int16_t dhtTemperature;
    uint16_t dhtHumidity;
    uint8_t lastMessageStatus;
} SigfoxMessage;
```

This message contains the following elements:
* The module temperature in int16 (integer of 16 bits, which represent 2 bytes) ;
* The temperature from the DHT22 sensors in int16 (integer of 16 bits, which is 2 bytes) ;
* The humidity from the DHT22 sensor in uint16 (unsigned integer of 16 bits, which is 2 bytes) ;
* The status of the last send message in uint8 (unsigned integer of 8 bits, which is 1 byte).

Finally, we only used 7 bytes in each message. Smaller message reduces transmission times, and increases battery.

## Use Sigfox API V2 to build a serverless dashboard

Sigfox API allows to obtain messages from all of the registered devices within
a maximum date history of 3 days and a maximum of 100 messages.  The endpoint
correspond to the route `/devices/${DEVICE_ID}/messages`, where `DEVICE_ID` is
the id of the device. More information about can be found at the [Sigfox endpoint
documentation](https://support.sigfox.com/apidocs#operation/getDeviceMessagesListForDevice).
I used the library Axios in Javascript to do a get request to the API:

```js
const params = {}
if (limit) {
  params.limit = limit
}
if (start) {
  params.since = start
}
if (end) {
  params.before = end
}
const myurl = `https://api.sigfox.com/v2/devices/${DEVICE_ID}/messages`;
const resulting = await axios.get(myurl, {
    params: params,
    auth: {
    username: UNAME,
    password: UPASS
  }
});
```

The variables *UNAME* and *UPASS* correspond to authentication credentials,
which can be obtained in your Sigfox account page as you can see in the [Sigfox
API documentation](https://support.sigfox.com/docs/api-credential-creation).
The parameters *limit*, *since* and *before* allows to control the time range
of the response.

The result of from the API seems like *7707d713649c000078c40000*, which
corresponds to the message in bytes encoded in a hexadecimal string. I used the
[npm sigfox-parser package](https://www.npmjs.com/package/sigfox-parser) to parse this output.

```js
var parser = require('sigfox-parser')

function convertPayload(payload) {
  var parsed = parser(payload, format);

  var moduleTemp = (parsed.moduleTemp / INT16_t_MAX * 120).toFixed(2);
  var dhtTemp = (parsed.dhtTemp / INT16_t_MAX * 120).toFixed(2);
  var dhtHum = (parsed.dhtHum / UINT16_t_MAX * 110).toFixed(2);
  var heatIndex = computeHeatIndex(dhtTemp, dhtHum, false).toFixed(2);

  var result = {
    moduleTemp: moduleTemp,
    dhtTemp: dhtTemp,
    dhtHum: dhtHum,
    heatIndex: heatIndex
  }
  return result
}
```

The `parser` function takes two inputs:
* **the message raw payload**, encoded in a hexadecimal string ;
* **the message format**, which following the Arduino function previously mentioned, has the following form:
  ```js
  var format = 'moduleTemp::int:16:little-endian dhtTemp::int:16:little-endian dhtHum::uint:16:little-endian lastMsg::uint:8';
  ```

Once the result has been parsed, it can be used as a Javascript object. I used
ChartJS library to plot the result as you can see in the [demo page](https://temp-sigfox.herokuapp.com/) powered
by a free heroku instance. The server keep the token save from the web client.

<center>
<amp-img src="/assets/img/arduino-sigfox-mkr1200/dashboard.png" width="677" height="392" layout="intrinsic"></amp-img>
<br><i>Screenshot from the dashboard. <a href="https://temp-sigfox.herokuapp.com/">Here is the live dashboard</a></i>
</center>

One of the biggest advantage of this serverless architecture is the fact that
it doesn't involve a database, which reduces the complexity of the web
application. The [code source of the application can be found on this github
page](https://github.com/cristianpb/temp-sigfox).

## Conclusions

The Arduino MKR FOX 1200 allows to easily connect IoT with Sigfox network and
that way to the cloud.  The device consumes so little that it runs on two 1,5V
batteries type AA or AAA for a really long time. The constructor announced at
least 6 months, which I'm currently testing right now.  This kind of device is
completely adapted for outdoor applications that don't have WiFi connectivity
or electrical power.

Sigfox proposes an API which allows to get the device messages and simplifies a
dashboard architecture.

I would like to thank Sigfox's team for organizing the Hackster.io Sigfox
Universities Challenge 2019, where I got the top 10 price and obtained an
Arduino MKR FOX 1200.


---

## Update 2021

I tried the device on prudction environment and having the debug mode on (which
means that the led light is turned every time that there is a message
transmission) and the battery lasted 3 months.
I guess that the led lights reduce the expected life of 6 months.

Having the debug mode off (no led light) the device battery should last more
than 4 months, I didn't get to know how much more it lasted because my Sigfox
subscription year ended, so I could use the network any more.

When debug mode was off, I had some issues to wake up the device after entering to the power saving
issue. Hopefully, I found this useful [post in the Arduino forum](https://forum.arduino.cc/index.php?topic=629227.0) which solved
the problem.
