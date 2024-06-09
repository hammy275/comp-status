#!/usr/bin/python3

from gevent.pywsgi import WSGIServer
from app import app, fts_complete, port, domain, fts_prep
from os.path import exists
from os import environ

no_https = "COMP_STATUS_NO_HTTPS" in environ
if not fts_complete:
    print("Running server with Flask (not production ready!) for first-time setup!")
    fts_prep()
    app.run("0.0.0.0", port, ssl_context=None if no_https else "adhoc")
elif domain is None and not no_https:
    print("Domain not set! Please run server_manager.py and set a domain name!")
    print("Launching using Flask (not production ready!) adhoc certificate instead...")
    app.run("0.0.0.0", port, ssl_context="adhoc")
elif not exists("/etc/letsencrypt/live/{}/fullchain.pem".format(domain)) and not no_https:
    print("/etc/letsencrypt/live/{}/fullchain.pem doesn't exist!".format(domain))
    print("\nYou aren't running as root, or you don't have a cert from Let's Encrypt!")
    print("If you don't have Let's Encrypt setup, take a look here:")
    print("https://certbot.eff.org/instructions")
    import sys
    sys.exit(1)
elif not exists("/etc/letsencrypt/live/{}/privkey.pem".format(domain)) and not no_https:
    print("/etc/letsencrypt/live/{}/fullchain.pem doesn't exist!".format(domain))
    import sys
    sys.exit(1)
else:
    if no_https:
        http_server = WSGIServer(("", port), app)
    else:
        http_server = WSGIServer(("", port), app,
            certfile="/etc/letsencrypt/live/{}/fullchain.pem".format(domain),
            keyfile="/etc/letsencrypt/live/{}/privkey.pem".format(domain)
        )
    http_server.serve_forever()