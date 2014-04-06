#!/usr/bin/env python

import csv
import json
import redis
import requests

FILE_NAME = 'Film_Locations_in_San_Francisco.csv'
GOOGLE_SERVICE_KEY = 'AIzaSyAYhW-b9TJ1bSOVnVuFA8IOPwQZ7hcU02o'
GOOGLE_SERVICE_URL = 'https://maps.googleapis.com/maps/api/geocode/json?address={address}&sensor={sensor}&key={key}'
REDIS_KEY = 'sfmap:%s'
MAX_HASH_LEVEL = 2
BAY_AREA_BOUND = {
  'lat': (36.8941549, 38.8642448),
  'lng': (-123.632497, -121.208178),
}

def save_film_to_redis(r, key, film):
  address = '%s, San Francisco, CA' % film['Locations']
  url = GOOGLE_SERVICE_URL.format(address=address, sensor='false', key=GOOGLE_SERVICE_KEY)
  print url

  resp = requests.get(url)
  if resp.status_code == 200:
    formatted_result = resp.json()
    if formatted_result['status'] == 'OK' and len(formatted_result['results']) > 0:
      film['Google Geocode'] = formatted_result['results'][0]
    else:
      print formatted_result
    r.set(key, json.dumps(film))
  return film

def gen_hash_key(s):
  return filter(str.isalnum, str(s)).lower()

def is_address_in_sf(json):
  location = json['geometry']['location']
  if BAY_AREA_BOUND['lat'][0] < location['lat'] < BAY_AREA_BOUND['lat'][1] and \
     BAY_AREA_BOUND['lng'][0] < location['lng'] < BAY_AREA_BOUND['lng'][1]:
    return True
  return False

def clean_typeahead(my_redis):
  for key in my_redis.keys('sfmap:typeahead:*'):
    my_redis.delete(key)

def load_typeahead(my_redis, hashes):
  typeahead_dict = {}
  typeahead_keys = sorted(hashes.keys())
  for key in typeahead_keys:
    for i in xrange(MAX_HASH_LEVEL):
      typeahead_key = key[:i+1]
      if not typeahead_key in typeahead_dict:
        typeahead_dict[typeahead_key] = []
      typeahead_dict[typeahead_key].append({
        'key': key,
        'value': hashes[key]
      })
  for key, value in typeahead_dict.iteritems():
    redis_key = REDIS_KEY % ('typeahead:%s' % key)
    redis_object = json.dumps(value)
    my_redis.set(redis_key, redis_object)


def load_data():
  with open(FILE_NAME, 'rb') as f:
    keys = []
    hashes = {}
    is_first_row = True
    my_redis = redis.StrictRedis(host='localhost', port=6379, db=0)
    index = 0

    for row in csv.reader(f, delimiter=',', quotechar='"'):
      if is_first_row:
        keys = row
        is_first_row = False
      else:
        film = dict(zip(keys, row))
        if film['Locations']:
          redis_key = REDIS_KEY % ("%s:%s" % (film['Title'], film['Locations']))

          # Save google_geocoding results to redis because API usage limit
          if my_redis.exists(redis_key):
            film = json.loads(my_redis.get(redis_key))
          else:
            film = save_film_to_redis(my_redis, redis_key, film)

          if 'Google Geocode' in film and is_address_in_sf(film['Google Geocode']):
            clean_title = gen_hash_key(film['Title'])
            if not clean_title in hashes:
              hashes[clean_title] = {
                'title': film['Title'],
                'year': film['Release Year'],
                'locations': [],
                'director': film['Director'],
              }
            hashes[clean_title]['locations'].append({
              'name': film['Locations'],
              'address': film['Google Geocode']['formatted_address'],
              'geo_lat': film['Google Geocode']['geometry']['location']['lat'],
              'geo_lng': film['Google Geocode']['geometry']['location']['lng'],
            })
            print "%s - %s" % (film['Title'], film['Google Geocode']['formatted_address'])

    clean_typeahead(my_redis)
    load_typeahead(my_redis, hashes)



if __name__ == '__main__':
  load_data()
