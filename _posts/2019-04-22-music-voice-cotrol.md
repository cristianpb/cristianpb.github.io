---
layout: post
title: "Control music using voice"
date: 2019-04-22
description: I'm tired to search for my phone to put/change/stop music. Instead I use snips technology to control music using voice (radio, podcast, files)
categories: snips raspberrypi nodejs
image: /assets/img/music-voice-control/main-crop.jpg
ligthbox: true

---

I use a Raspberry Pi to control music in my house but the problem is that I'm
tired of looking for my phone to change the music, or change the volume or
search for a specific song. Instead I want to control my music using my voice
and I have the following concerns:

1. **I want to use Snips assistant for voice recognition**. It allows to have an
   offline voice recognition system and it has several available languages. I'm
   using an Spanish assistant, but Snips versatility allows to change the
   language assistant easily so my code can be used for different language
   assistants.

2. **Use a Bluetooth speaker**. I use a snips starter kit which includes a
   passive speaker, but sometimes I like to hear loud music but since the
   microphone is near the speaker I prefer to use a Bluetooth speaker to avoid
   interference.

3. **I want to be able to control all sources of music**. I follow podcasts but
   I also like to hear radio stations and stream music from online services
   like Soundcloud.

4. **Using javascript language for easy asynchronous code executing**. Instead
   of using python and specially python2 to control snips.

## My solution

<amp-video width="432"
  height="535"
  src="/assets/img/music-voice-control/radio.webm"
  poster="/assets/img/music-voice-control/main.jpg"
  layout="responsive"
  controls
  loop
  autoplay>
  <div fallback>
    <p>Your browser doesn't support HTML5 video.</p>
  </div>
</amp-video>

I will show I solve my problems:

* My code uses only javascript. I got some inspiration from the [snips
  documentation](https://docs.snips.ai/articles/console/actions/actions/code-your-action/listening-to-intents-over-mqtt-using-javascript).
  So 4 point is checked.
* To connect to Bluetooth I just paired my Raspberry Pi with a Bluetooth
  speaker using [bluetoothctl](https://wiki.archlinux.org/index.php/Bluetooth#Pairing). Whenever you have a problem pairing a bluetooth
  speaker, there are several resources available online. I personally found
  [this one](https://www.sigmdel.ca/michel/ha/rpi/bluetooth_01_en.html) very useful. Then I used npm bluetoothctl library to ensure to
  connect to my devices every time they are available I use the following code
  to do it: 

```js
const blue = require("bluetoothctl");
  
/* Automatic Bluetooth connection */
blue.Bluetooth()
blue.on(blue.bluetoothEvents.Device, function (devices) {
  const hasBluetooth=blue.checkBluetoothController();
  if(hasBluetooth) {
    devices.forEach((device) => {
      blue.connect(device.mac)
    })
  }
})
```

<amp-image-lightbox id="lightbox1"
  layout="nodisplay"></amp-image-lightbox>
<amp-img on="tap:lightbox1"
  role="button"
  tabindex="0"
  aria-describedby="imageDescription2"
  alt="Picture of a dog"
  title="Picture of a dog, view in lightbox"
  src="/assets/img/music-voice-control/parlante.jpg"
  layout="intrinsic"
  width="432"
  height="575"></amp-img>
<div id="imageDescription2">
  A bluetooth speaker
</div>

* I use mopidy to control music on the raspberry pi. As said in [mopidy page](https://www.mopidy.com/):

>Mopidy plays music from local disk, Spotify, SoundCloud, Google Play Music, and more. You edit the playlist from any phone, tablet, or computer using a range of MPD and web clients. 

I use [mopidy.js](https://docs.mopidy.com/en/latest/api/js/) to control mopidy
within my javascript code. I create some functions to add a song to the queue
and play them, change the volume, search for tracks and change the song in the
queue.

```javascript
// set music
function connectMopidyRadio(radio) {
 const mopidy = new Mopidy({
   webSocketUrl: `ws://${hostname}:6680/mopidy/ws/`,
 });
 mopidy.on("state", async () => {
   await setRadio(mopidy, radio);
 });
 mopidy.on("event", console.log);
}
  
async function setRadio (mopidy, radio) {
 await mopidy.tracklist.clear()
 await mopidy.playback.pause()
 await mopidy.tracklist.add({uris: radio})
 tracks = await mopidy.tracklist.getTlTracks();
 await mopidy.playback.play({tlid: tracks[0].tlid});
 mopidy.off();
}
  
function searchArtist (rawValue) {
 const mopidy = new Mopidy({
   webSocketUrl: `ws://${hostname}:6680/mopidy/ws/`,
 });
 mopidy.on("state", async () => {
   console.log(`Searching for ${rawValue}`)
   say.speak(`Searching for ${rawValue}`)
   let result = await mopidy.library.search({'any': rawValue, 'uris': ['soundcloud:']})
   await setRadio(mopidy, result[0]['tracks'].map(item => item.uri));
 });
}
function nextSong () {
 const mopidy = new Mopidy({
   webSocketUrl: `ws://${hostname}:6680/mopidy/ws/`,
 });
 mopidy.on("state", async () => {
   console.log('Next');
   say.speak(`Next`)
   await mopidy.playback.next();
 });
}
  
function volumeDown () {
 const mopidy = new Mopidy({
   webSocketUrl: `ws://${hostname}:6680/mopidy/ws/`,
 });
 mopidy.on("state", async () => {
   console.log('Volume down');
   say.speak(`Volume down`)
   await mopidy.mixer.setVolume([5])
   mopidy.off();
 });
}
```

* I also created a function to download the episodes from my favorite podcast
  whenever I'm connected to the internet.

```
async function downloadPostcast(url) {
  let feed = await parser.parseURL(url);
  console.log("RSS: ", feed.title);
  // Get existing local files
  const dir = '/var/lib/mopidy/media' 
  const files = fs.readdirSync(dir)
    .map((fileName) => {
      return {
        name: fileName,
        time: fs.statSync(dir + '/' + fileName).mtime.getTime()
      };
    })
    .sort((a, b) => b.time - a.time) // Sort decending order
    .map((v) => v.name);
  // If there are new episodes, download them
  feed.items.slice(0,5).forEach(async (item) => {
    let pieces = item.guid.split('/')
    console.log(`Checking : ${pieces[pieces.length-1]}`);
    if (files.indexOf(pieces[pieces.length-1]) === -1) {
      console.log(`Downloading ${item.title}:${item.guid}`)
      let { guid } = item; 
      await downloadFile(guid, pieces)
    }
  });
  // Delete old files
  if (files.length > 5) {
    files.slice(6, files.length).forEach((item) => {
      console.log(`Removing ${item}`)
      let path = Path.resolve(dir, item)
      fs.unlinkSync(path);
    })
  }
}
```

## Outcome

I'm very happy with the results. I'm able to control my music with my voice and
I don't even have to be near my phone. I uploaded a video that illustrates my
results, my code is available on [github](https://github.com/cristianpb/snipshandler).

<amp-image-lightbox id="lightbox1"
  layout="nodisplay"></amp-image-lightbox>
<amp-img on="tap:lightbox1"
  role="button"
  tabindex="0"
  aria-describedby="imageDescription2"
  alt="Picture of a dog"
  title="Picture of a dog, view in lightbox"
  src="/assets/img/music-voice-control/main.jpg"
  layout="intrinsic"
  width="432"
  height="575"></amp-img>
<div id="imageDescription2">
  My snips handler
</div>
