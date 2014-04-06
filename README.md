sfmap
=====

San Francisco Movie Map - Uber Test

## Introduction

sfmap is a single webpage application that shows on a map where movies have been filmed in San Francisco. An example of the running site is hosted at [http://inch.im](http://inch.im/).

The features include:

* The user should be able to filter a movie using autocomplete search.
* Clicking the icon on the map will display the name of the location.
* Hovering on the name of the location will highlight the location on the map automatically.
* The site is responsive! The site has been tested on Chrome, Firefox, Safari, Opera, Nexus 7, iPad nad iPhone.

## Build Instructions

#### Setup Backend Server

Install [virtualenv](http://www.virtualenv.org/en/latest/virtualenv.html#installation), [pip](http://pip.readthedocs.org/en/latest/installing.html), [Redis](http://redis.io/download) and then

```sh
$ virtualenv env
$ source env/bin/activate
$ pip install -r requirements.txt
$ cd script/
$ python load_film_locations_to_redis.py
$ cd ../flask/
$ python sfmap.py
```

Finally, open `http://localhost:5000/ta/v` in your browser to test autocomplete API.

#### Setup ng-boilerplate JavaScript app

Install Node.js and then:

```sh
$ cd angular/
$ sudo npm -g install grunt-cli bower
$ npm install
$ bower install
$ grunt build
$ open build/index.html
```

The website should be opened by your default browser.
