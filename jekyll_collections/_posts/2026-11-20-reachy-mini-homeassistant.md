---
layout: post
title: 'Reachy Mini Meets Home Assistant: From Conversation to Automation'
date: 2026-11-20
description: An open-source Reachy Mini setup connects conversational AI with Home Assistant automations, letting the robot wake, respond to questions, and return to sleep based on motion and speech.
categories:
  - programming
tags: 
 - python
 - llm
image:
  path: /assets/img/reachy-mini-homeassistant/main-16x9.jpg
  height: 788
  width: 1400
thumb:
  path: /assets/img/reachy-mini-homeassistant/main-thumb.jpg
  height: 225
  width: 400
video: true
ligthbox: true

---


## Reachy Mini’s Capabilities

Reachy Mini is an expressive desktop robot designed for human interaction, creative coding, and AI experimentation. Its camera provides visual input, while four microphones and a speaker enable it to listen and respond verbally. It can also move its head and antennas to express itself during interactions. As an open-source robot, its wireless version runs on a Raspberry Pi CM4 with Linux, allowing everything to run directly on the device and giving you precise control over its functions. Its app ecosystem is built around Hugging Face, where you can explore community-created apps or build your own.

## Apps for Reachy Mini

Hugging Face’s marketplace for Reachy Mini is a community app library hosted on the Hugging Face Hub. It lets people discover, try, install, and build on apps that give the desktop robot new behaviors—from conversation and hand tracking to games, music, and motion control.

<center>
<amp-img src="/assets/img/reachy-mini-homeassistant/huggingface-marketplace.jpg" alt="Hugging Face Apps Marketplace for Reachy mini" height="747" width="1200" layout="responsive"></amp-img>
<br><i>Hugging Face Apps Marketplace for reachy mini</i>
</center>

The [Clock app](https://huggingface.co/spaces/pollen-robotics/reachy_mini_clock) turns Reachy Mini’s two antennas into a simple physical clock. Instead of showing digits on a screen, it uses the antennas’ positions to indicate the time—giving the robot a small, expressive movement that makes the time visible at a glance.

<center>
<amp-img src="/assets/img/reachy-mini-homeassistant/reachy-clock.jpg" alt="Reachy mini using the Clock app giving the time" height="746" width="901" layout="responsive"></amp-img>
<br><i>Reachy mini using the Clock App</i>
</center>

The Conversation app is Pollen Robotics’ most developed app for talking with Reachy Mini. It supports live, back-and-forth voice conversations: the robot listens, responds aloud, and moves as it speaks. It can also use its camera during interactions, perform expressive actions, and support different personalities. 

<center>
<amp-img src="/assets/img/reachy-mini-homeassistant/conversation.gif" alt="Reachy mini talking during the conversation app" height="405" width="720" layout="responsive"></amp-img>
<br><i>Reachy mini talking with the conversation app running</i>
</center>


The Home Assistant app can connect Reachy Mini as an ESPHome satellite, allowing Home Assistant to control its movements and display what it’s saying. However, the Conversation and Home Assistant apps from the Hugging Face Marketplace can’t run at the same time. When using the Home Assistant app, the conversation logic has to run in Home Assistant rather than Reachy Mini’s Conversation app, which limits Reachy Mini’s conversational capabilities.

## Connecting Reachy Mini to Home Assistant

One way around this limitation is to install the [Reachy Mini Home Assistant integration](https://github.com/pollen-robotics/reachy_mini_homeassistant/) through HACS. Unlike the ESPHome device integration, which connects Reachy Mini as a voice-assistant satellite for audio input and output, the HACS integration communicates directly with the robot’s daemon over the local network. It adds Reachy Mini controls and status information to Home Assistant—such as movement modes, emotions, dances, volume, camera view, and app controls. 

I added functionality that lets Home Assistant launch the Conversation app and create conversation sessions in response to other inputs, such as movement detectors. This makes it possible to combine Reachy Mini’s conversational features with Home Assistant automations.


<center>
<amp-img src="/assets/img/reachy-mini-homeassistant/reachy-mini-automation.jpg" alt="Reachy mini automation" height="1186" width="814" layout="responsive"></amp-img>
<br><i>Reachy mini start conversation action in Home Assistant</i>
</center>


## A Motion-Triggered Conversation

With this setup, when I move in front of a motion sensor, Reachy Mini wakes up and starts the Conversation app. I can then send it a query without having to speak—for example, asking about the weather or something interesting happening that day. From there, I can continue the interaction by talking to Reachy. If no more speech is detected and there is no longer anyone present, the automation can stop the Conversation app and, if desired, put Reachy Mini back to sleep.

<center>
<amp-img src="/assets/img/reachy-mini-homeassistant/main.jpg" alt="Reachy mini beignt used by Home Assistant" height="896" width="1195" layout="responsive"></amp-img>
<br><i>Reachy Mini is triggered by a motion interaction through Home Assistant</i>
</center>


## What’s Next

Connecting Reachy Mini with Home Assistant turns it from a standalone conversational robot into a more flexible part of a smart home. Motion sensors can start interactions, and other Home Assistant events could trigger different responses or behaviors. There is plenty of room to build on this setup: the next step is to explore more automations and find useful, fun ways for Reachy Mini to respond to what is happening around the home.


<amp-video width="1280"
  height="720"
  src="/assets/img/reachy-mini-homeassistant/output.webm"
  poster="/assets/img/reachy-mini-homeassistant/main.jpg"
  layout="responsive"
  controls
  loop
  autoplay>
  <div fallback>
    <p>Your browser doesn't support HTML5 video.</p>
  </div>
</amp-video>
