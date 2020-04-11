---
layout: post
title: "Christmas project: Control lights with the voice and Raspberry Pi"
date: 2019-12-07
description: Imagine having interactive Christmas lights! This article will show you how to control lights with your Raspberry Pi and adding voice command superpowers.
categories:
  - programming
tags: raspberrypi nodejs snips
image:
  path: /assets/img/snips-relay-lights/main-16x9.jpg
  height: 788
  width: 1400
thumb:
  path: /assets/img/snips-relay-lights/main-thumb.jpg
  height: 200
  width: 300
video: true

---

Controlling lights are a good place to start learning electronics. It's simple and
they have a visual effect that captures people attention.
In addition, It's Christmas time!
So days are shorter and Christmas lights always give a warm sensation.

In this article I will explain how to connect lights into a Raspberry Pi and
control them with voice commands. 

<center>
<amp-img src="/assets/img/snips-relay-lights/main.jpg" width="474" height="632" layout="intrinsic"></amp-img>
<br><i>Christmas tree with lights that are controlled with the Raspberry Pi</i>
</center>


## Control lights using a relay

I already had a Snips developer kit, so I just need to add two more components:
* Christmas lights: I choose a [5 meter USB powered lights](https://www.ebay.com/itm/5M-10M-USB-LED-Copper-Wire-String-Fairy-Light-Strip-Lamp-Xmas-Party-Waterproof-/282404057310) which cost me 2.7 USD.
* [Grove relay](https://www.seeedstudio.com/Grove-Relay.html), which allows to open and close a circuit, which cost me 3 USD. It can be plugged easily to the [ReSpeaker Pi hat](https://www.seeedstudio.com/ReSpeaker-2-Mics-Pi-HAT.html).

I had to cut the lights cable and insert then into the relay so that it can be
turned on and off with the Raspberry Pi. The final assembly can be seen in the
following image.

<center>
<amp-img src="/assets/img/snips-relay-lights/relay.jpg" width="632" height="474" layout="intrinsic"></amp-img>
<br><i>Lights are powered by a USB cable and connected to the relay so that it can be controlled by the Raspberry Pi</i>
</center>

Once the lights and the relay are connected, one can can use a library like
[nodejs OnOff](https://www.npmjs.com/package/onoff) to turn on and off the
relay.
The principle is to instanciate a `Gpio` object and turn it on and off by
writing a value 1 or 0 respectively.
In addition, I used the documentation examples of the library to create a
`blinking` function to make the relay blink. Here I present you the code of
the module that I used:

```js
// relay.js

const Gpio = require('onoff').Gpio;
let LEDPin = new Gpio(12, 'out'); // declare GPIO12 an output

function blinking (blink_time = 2000) {
	startValue = LEDPin.readSync()

	// Toggle the state of the LED
	const iv = setInterval(_ => LEDPin.writeSync(LEDPin.readSync() ^ 1), 500);

	// Stop blinking the LED after blink_time
	setTimeout(_ => {
		clearInterval(iv); // Stop blinking
		if (startValue == 1) {
			console.log("Letting up", startValue)
			LEDPin.writeSync(1)
		} else {
			LEDPin.writeSync(0)
		}
	}, blink_time);
}

function changeState (arg) {
	console.log(arg)
	LEDPin.writeSync(arg)
}
```

## Turning lights periodically

I wanted to have Christmas lights blinking from time to time and wish Merry Christmas 🎄, so I added a recurrent job that every hour:
* Tell which time it is ;
* Wish merry Christmas ;
* Blink the Christmas lights.

Here you can find the function that I used but the [complete code can be found
here](https://github.com/cristianpb/snipshandler).

```js
// index.js
const relay = require('./relay');

const job = new CronJob({
  // At minute 0 past every hour from 9 through 21.”
  cronTime: '00 9-21 * * *',
  onTick: function () {
	  relay.blinking(5000);
	  let currentTime = new Date();
	  SnipsMopidy.speak(`Feliz navidad, son las ${currentTime.toTimeString().substring(0, 2).replace(/^0+/, '')}`);
  },
  timeZone: 'Europe/Paris'
});
job.start();
```

Take a look at the result, the device telling the hour and turning on the lights.

<amp-video width="432"
  height="535"
  src="/assets/img/snips-relay-lights/cron.webm"
  poster="/assets/img/snips-relay-lights/main.jpg"
  layout="responsive"
  controls
  loop
  autoplay>
  <div fallback>
    <p>Your browser doesn't support HTML5 video.</p>
  </div>
</amp-video>


## Controlling lights with snips

I wanted to be able to control lights using voice commands.
I achieved this using Snips. I created an intent `lightsOn` and `lightsOff`
with some query examples for each one. Then the voice assistant will recognize
when someone tells something like "Turn on the lights".

After that, I updated my assistant code, so that it can handle the case when each
intent is recognized. Take a look at the concerned code:

```js
  // ...
  } else if (intentName === 'cristianpb:lightsOn') {
	  relay.changeState(1);
	  SnipsMopidy.speak(`On`);
  } else if (intentName === 'cristianpb:lightsOff') {
	  relay.changeState(0);
	  SnipsMopidy.speak(`Off`);
  // ...
```

Once again, the [complete code can be found
here](https://github.com/cristianpb/snipshandler).

The results is that I can turn on and off the lights by using the voice, as you
can see in the following video.

<amp-video width="432"
  height="535"
  src="/assets/img/snips-relay-lights/snips-relay.webm"
  poster="/assets/img/snips-relay-lights/main.jpg"
  layout="responsive"
  controls
  loop
  autoplay>
  <div fallback>
    <p>Your browser doesn't support HTML5 video.</p>
  </div>
</amp-video>

## Conclusions

This is a simple way to control lights using devices like a Raspberry Pi. In
addition it's relatively cheap, I spend less than 6 USD in the lights and the relay.
It gives a nice technological addition to Christmas.

For this project I was still able to use Snips, but since they are now part of
Sonos, they are going to close their console.  Next time I will be probably
using [snowboy](https://docs.kitt.ai/snowboy/) and
[mycroft](https://mycroft.ai/).
