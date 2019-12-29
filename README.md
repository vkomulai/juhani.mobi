[![Build Status](https://travis-ci.org/vkomulai/juhani.mobi.svg?branch=master)](https://travis-ci.org/vkomulai/juhani.mobi) [![codecov](https://codecov.io/gh/vkomulai/juhani.mobi/branch/master/graph/badge.svg)](https://codecov.io/gh/vkomulai/juhani.mobi)

# Juhani.mobi - A voice driven shopping list

![juhani icon](public/icons/android/android-launchericon-192-192.png?raw=true)

- Juhani is my little voice driven helper for creating a shopping list
- This is an experiment on how browser's `webkitSpeechRecognition` can be used as speech recognition API
- This used to be a my personal learning project back in the days and to familiarize myself with PWA's and browser's Web Speech API
- Intent is to optimize my personal grocery shopping experience

## Story of Juhani

- My family consists of four people and a cat. That means quite a lot of effort goes into managing groceries. With a voice driven app I can create a grocery list in a matter of seconds. Initially this was supposed to be a math game, but the idea pivoted quite early.
- Name of the app is Juhani, because that happens to be the name of my kind-of brother-in-law who is very helpful. Thanks Juhani, again

## Tricks Juhani can do (on Android phones)

- Detect Finnish words and place them to list
- Detect combinations of quantitative words, adjectives and nouns into one item on list. For example, "5 litraa maitoa" or "puoli kiloa mansikoita"
- Re-ordering of items using Drag and Drop
- Push collected items to the end of the list

![juhani preview](video-preview.gif?raw=true)

## Future ideas

- Magic words for a group if things. "Hedelmät" would automatically translate into "Omena, Banaani, Mandariini" or "Perussetti" would create basic list of grociers as a template.
- Gamification mode: When in grocery store, have a timer to clock the collecting round. Animations on completion, etc.
- Keep track of the usual order items in the list and automatically sort the items accorning to most usual visit. Might need some kind of preset / setting for the store.
- Collecting (checking) of items using voice as well
- Support Apple devices as well, requires a bit more work...

## Limitations

- On Mobile devices, `webkitSpeechRecognition` is only available on Android Chrome -browsers. If you use Apple mobile devices, then this is not for you
- Juhani is configured to detect Finnish language
- Shopping list is stored in local storage for simplicity

## Run and develop locally

- Run Locally

```bash
npm install
npm start
open localhost:3000
```

- Running tests `npm test` (watch-mode) and `test-ci` for non-interactive
- Eslint `npm run eslint` and `npm run eslint-fix` to autofix
- Csslint `npm run csslint` and `npm run csslint-fix` to autofix

## CI and Deployment (AWS S3 + Cloudfront)

- Travis-CI [https://travis-ci.org/vkomulai/juhani.mobi](https://travis-ci.org/vkomulai/juhani.mobi)
- Deployment on master branch changes
- Deploy locally using `./deploy-to-s3.sh`

## Changelog

### 1.1.0 / 27.01.2019

- Added suport for sorting list automatically according to market configuration

### 1.0.1 / 13.01.2019

- Added suport for sharing the list using Web Share API: https://developers.google.com/web/updates/2016/09/navigator-share
