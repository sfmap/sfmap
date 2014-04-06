import json
import redis

from crossdomain import crossdomain
from flask import Flask, jsonify

MAX_HASH_LEVEL = 2
REDIS_KEY = 'sfmap:%s'

app = Flask(__name__)

def gen_hash_key(s):
  return filter(str.isalnum, str(s)).lower()

@app.route('/')
def hello():
  return 'Hello Uber!'

@app.route("/ta/<prefix>")
@crossdomain(origin='*')
def typeahead(prefix):
  my_redis = redis.StrictRedis(host='localhost', port=6379, db=0)
  prefix = gen_hash_key(prefix)
  key = REDIS_KEY % ('typeahead:%s' % prefix[0:MAX_HASH_LEVEL])
  if my_redis.exists(key):
    obj = json.loads(my_redis.get(key))
    if len(prefix) > MAX_HASH_LEVEL:
      obj = filter(lambda x: x['key'].startswith(prefix), obj)
  else:
    obj = {}

  return jsonify(pkg=obj)

if __name__ == "__main__":
  app.run(debug=True)
