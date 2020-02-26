#!/usr/bin/python3

from gevent.pywsgi import WSGIServer
from app import app, port

http_server = WSGIServer(("", port), app)
http_server.serve_forever()