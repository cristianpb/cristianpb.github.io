---
layout: post
title: "Apollo: Mopidy web client with Snapcast support"
date: 2020-04-26
description: Services like Mopidy and Snapcast are ideal to create a multiroom streaming audio player using devices like the RaspberryPi or android telephones. This posts presents a web interface that uses the state of the art web technologies and integrates nicely with Mopidy and Snapcast.
categories:
  - programming
tags: mopidy svelte sapper bulma github-actions
video: true
image:
  path: /assets/img/mopidy-apollo/main-16x9.jpg
  height: 788
  width: 1400
thumb:
  path: /assets/img/mopidy-apollo/main-thumb.jpg
  height: 200
  width: 300

---

Mopidy is a versatile music server that can play music from different sources
(TuneIn, SomaFM, Soundcloud, Youtube, Spotify, between others).
It can be connected with [Snapcast](https://github.com/badaix/snapcast) to
provide a multiroom streaming service.
It has a main core API and several extensions that can be added optionally by
the user.
Between there extension there are frontend web applications that can be
connected to the core API and control Mopidy.

The historical web interface of Mopidy is
[MusicBox](https://github.com/pimusicbox/mopidy-musicbox-webclient), which
started being developed in 2013. It has the basic functionalities of Mopidy and
it's compatible with several web browsers but the problem is that it doesn't
include support to control Snapcast sources.

There are more recent web interfaces like Iris, with a gorgeous design and
support for Snapcast control, but it [collects utilization
analytics](https://github.com/jaedb/Iris/issues/317) for each client, which I
prefer to avoid.

Then, I decided to develop my own web interface using the state of the art web
technologies which are described in this post.

<center>
<amp-img src="/assets/img/mopidy-apollo/main-16x9.jpg" width="901" height="450" layout="intrinsic" alt="mopidy apollo home page"></amp-img>
<br><i>Apollo webclient homepage</i>
</center>

## Web developpemnt technologies

I choose the Svelte framework as the core of the web interface. This
framework is very light and I like the syntax because I feel that I'm only
writing html, css and js but behind the scenes the code is completely
optimized at build time.

I also chose Sapper (short for **S**velte **app** mak**er**) to be the glue
between the different Svelte components. In the following section I'm
explaining how I used those Sapper and Svelte together.

### Svelte

Svelte framework is relatively new (released in 2016) but it's becoming very
popular because it's very light and fast. This is mainly due to the fact
that it optimizes the code to manipulate the DOM directly using vanilla
JavaScript, which is different from traditional frameworks like React or Vue,
which need a framework in the browser to manipulate the DOM.

One of the advantage of Svelte is the *reactivity* system. This system is
inspired in the philosophy of Excel cells, that are linked one to the other
using formulas. When a value in a parent cell changes, all the linked cells are
updated automatically. The same happens with reactive variables in Svelte, the
variables are updated depending of a relation dependency graph.

I use reactive variables for saving information about the current track that
it's playing, the songs that are present in the tracklist, the songs that are
present in a playlists and the results of a search action.

Another advantage of Svelte, is the fact that animation can be easily adapted
to components. I add some drag and drop events to order the tracks playlists as
you can see in the following video:

<amp-video width="1024"
  height="610"
  src="/assets/img/mopidy-apollo/drag-drop.mp4"
  poster="/assets/img/mopidy-apollo/main.png"
  layout="responsive"
  controls
  loop
  autoplay>
  <div fallback>
    <p>Your browser doesn't support HTML5 video.</p>
  </div>
</amp-video>

The order of the items in the tracklists is synchronized with the values in the
backend, so when the next song button is pressed, the song that has been
dragged is played.

#### REPL

Svelte has a Read–Eval–Print Loop (REPL) page, where people can share their
snippets. I think it's a great way to test small things and share them with
everybody. For instance, here is a [REPL page for the algorithm that moves the
items in
theplaylists](https://svelte.dev/repl/3bf15c868aa94743b5f1487369378cf3?version=3.21.0).

#### CSS framework

I used the Bulma CSS framework because of it's simplicity. I added the *SCSS*
version as a global variable using some components. Once the design is 
stabilized, I can use local CSS in each component to optimize the
application.

### Sapper

Sapper has been developed by the Svelte team, so it follows the same
principles and simplicity of the Svelte family.
However, this framework is not still as popular as Svelte and also not as
mature.

I use Sapper as a routing application for the different pages:

* The homepage that shows the actual playing tracklist ;
* The search page to explore tracks ;
* The playlists page with the possibility of creating, deleting, playing and
  modifying the every playlist ;
* A template for every playlist.

Sapper is also in charge of preparing the server side rendering mode, where
part of the JavaScript code is executed on the server side, so that the browser
can load faster the webpage.

### Development environment

Mopidy core API runs on a backend which recently has reached version 3.0. This
means that it needs to run on python 3.7, which is not installed by default
in all desktop environments. To avoid version compatibility and break internal
dependencies I also created a `Dockerfile` with support of Mopidy 3.0, which
helps a lot for local development.

A Makefile is used to inject envrionement variables, like the location of the
music and playlist folder. These can be easily tunned depending on the running
environment.

## Snapcast support

Snapcast is a multiroom client-server audio player, where all clients are time
synchronized with the server to play perfectly synced audio. It's not a
standalone player, but an extension that turns your existing audio player into
a Sonos-like multi room solution. 

I have been using it in three Raspberry Pi, to have the same music in different
house environments. I works well with Mopidy and initial configuration is very
minimalistic. There is one master with the Mopidy instance and Snapcast server
and there is a Snapcast client in every other.

Sanpcast also provides a JSON/RPC control API to communicate with the server using
websockets. This protocol provides a continuous link between the client and the
server. Messages are send when there are changes or events, which allows the
client to have a notification when there are change in the server.

I implemented this communication in Apollo, so that one can control the volume
of the Snapcast clients. The following image shows the Snapcast control panel
and the sound from three devices: *raspi*, *raspimov* and *raspicam*.

<center>
<amp-img src="/assets/img/mopidy-apollo/snapcast.png" width="300" height="651" layout="intrinsic" alt="snapcast controls in Apollo"></amp-img>
<br><i>Snapcasts controls in Apollo</i>
</center>

## Github Actions CI/CD worflow

There are two main components of Apollo web client:

* The html produced by Sapper
* The python package that connects the web interface with Mopidy.

The final destination of the python extension is the [PyPi
repository](https://pypi.org/project/Mopidy-Apollo/), where
python users can download and install Apollo. The publishing action can be
made manually using python wrappers like
[twine](https://github.com/pypa/twine). However, there is always the risk of
making a human mistake, like publishing the wrong version. This is why I prefer
to delegate this action to Github.

Here is a description of the deploying pipeline of the Apollo package using
Github Actions:

* At every push to the github repository a build of the html and the python
  package is made in order to check for errors.
* At every push to master branch there is a publication of the html to github
  pages in order to validate the test the actual version in different devices
  using [this url of the github pages](https://cristianpb.github.io/apollo/).
* The git tags control the version of the package, so when a tag is pushed, the
  following actions are run:
  * The package version is upgraded in `setup.cfg` and `package.json`
  * The python package is published to PyPi.org
  * A github release is published
  * The zip of the package is added to the release assets

## Conclusions

There is still plenty of room for improvement for Apollo. I would like to add
features like integrating third party services like Discogs or Genius,
improving user experience or improving the design. If you think about other
nice features to add, you can open an issue on [the github page of the
project](https://github.com/cristianpb/apollo/issues).

I'm also satisfied of having an automatic deploying workflow. I used different
github actions developed by others and also contributed to [improve one of
them](https://github.com/stefanzweifel/git-auto-commit-action/pull/65).

The code of Apollo is available at [this github
repository](https://github.com/cristianpb/apollo/) and the python [package is
available at PyPi](https://pypi.org/project/Mopidy-Apollo/), you can install it
with `sudo python -m pip install Mopidy-Apollo`, use it without restriction.
