
<p align="center">
  <img width="250" src="midi-bricks-logo.png">
</p>


# Midi-Bricks

MIDI Bricks was invented for usage as interactive MIDI-Controller-Interface or even for Touch-Device purposes. We use the native MIDI API which is exposed from chrome browser. Please note, that MIDI functionality is not provided on mobile devices. In most cases our users provide them selves with some kind of extra Touch Device, which can be wired via USB to your Desktop / Laptop.

## Mono Repository
This is a mono-repository for midi-bricks, its electron app and deployment. 

## Live-Web-Demo
https://midi-bricks.timsusa.now.sh

<p align="center">
  <img width="250" src="MIDI-bricks-shortcut-d.gif">
</p>

## Official Webpage and Documentation
https://timsusa.github.io/midi-bricks-mono/

## More Help
More help can be found in each sub project folder´s README.md, 
which you can find under packages/. 
In order to get information about building an executable
for your OS please be refered to the midi-bricks-electron folder.

## Bootstrapping the Monorepo:
```
yarn && yarn bootstrap
```


# Webapp
The midi-bricks folder poses the core source, which is a standalone webapp.
Furthermore, it is deployed to the great guys from https://zeit.co/now. 

## Start Development
```
yarn dev:midi-bricks
```

## Build for Production
```
yarn build:midi-bricks
```


# Electron App
The core web app will be copied into the electron ecosystem. 
Further code for configuration, especially ```electron.js```,
can be found in its public folder. 


## Start Development
```
yarn dev:midi-bricks-electron
```

## Build for MacOSX and Win
```
yarn build:midi-bricks-electron
```


# Contributing
Please consider to create a PR with or without any issue. 
I will get back to you, asap.

# Versioning
https://github.com/conventional-changelog/standard-version

## Support on Beerpay
Hey dude! Help me out for a couple of :beers:!

[![Beerpay](https://beerpay.io/TimSusa/midi-bricks-mono/badge.svg)](https://beerpay.io/TimSusa/midi-bricks-mono)
[![Beerpay](https://beerpay.io/TimSusa/midi-bricks-mono/make-wish.svg)](https://beerpay.io/TimSusa/midi-bricks-mono)
