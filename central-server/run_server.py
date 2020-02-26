#!/usr/bin/python3

from gevent.pywsgi import WSGIServer
from app import app, port, domain
from os.path import exists

if domain is None:
    print("Domain not set! Please run server_manager.py and set a domain name!")
    import sys
    sys.exit(1)

if not exists("/etc/letsencrypt/live/{}/fullchain.pem".format(domain)):
    print("/etc/letsencrypt/live/{}/fullchain.pem doesn't exist!".format(domain))
    print("\nYou aren't running as root, or you don't have a cert from Let's Encrypt!")
    print("If you don't have Let's Encrypt setup, take a look here:")
    print("https://certbot.eff.org/instructions")
    import sys
    sys.exit(1)
elif not exists("/etc/letsencrypt/live/{}/privkey.pem".format(domain)):
    print("/etc/letsencrypt/live/{}/fullchain.pem doesn't exist!".format(domain))
    import sys
    sys.exit(1)

http_server = WSGIServer(("", port), app,
certfile="/etc/letsencrypt/live/{}/fullchain.pem".format(domain),
keyfile="/etc/letsencrypt/live/{}/privkey.pem".format(domain)
)
http_server.serve_forever()