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

## Techonolgy Stack

* A python script is written to process the [CSV file](https://data.sfgov.org/Arts-Culture-and-Recreation-/Film-Locations-in-San-Francisco/yitu-d5am) to load location data to [Redis](http://redis.io/) memory.
* [Google Maps Geocoding API](https://developers.google.com/maps/documentation/geocoding/) is used here to get latitude/longtitude of address.
* A [Flask server](http://flask.pocoo.org/) is setup to respond the autocomplete GET request.
* The front-end single page application is built based on [AngularJS](http://angularjs.org/) with the help of opensource [ng-boilerplate](http://joshdmiller.github.io/ng-boilerplate/#/home) project.
* [Bootstrap](http://getbootstrap.com/2.3.2/) is used here to display the basic UI, and responsive layout.

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
