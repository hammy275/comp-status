#!/usr/bin/python3

"""
    comp-status: A small set of Python files to get the status of computers
    Copyright (C) 2020  hammy3502

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
"""

from flask import Flask, jsonify, request, send_from_directory
import time
import auth
import json
import os
import sys


config = auth.db

react_dir = os.path.abspath(os.path.dirname(os.path.realpath(__file__)) + "/../client/react-ui/build/")
if not os.path.isdir(react_dir):
    print("React client not built! Please run \"npm run build\" inside of client/react-ui/ !")
    sys.exit(1)

app = Flask(__name__)

db = {}

try:
    port = config["port"]
except KeyError:
    print("No port in config! Defaulting to 5000...")
    port = 5000

try:
    use_cors = config["use_cors"]
except KeyError:
    print("Whether or not to use CORS not specified! Defaulting to True...")
    use_cors = True

try:
    domain = config["domain"]
except KeyError:
    domain = None

try:
    fts_complete = config["fts_complete"]
except KeyError:
    fts_complete = False

if not fts_complete:
    port = 5000

@app.route('/')
@app.route("/fts")
@app.route("/login")
@app.route("/gui_tokens")
@app.route("/gui_users")
def index():
    return send_from_directory(react_dir, "index.html")

@app.route("/static/js/<path:filename>")
def js_files(filename):
    return send_from_directory(react_dir + "/static/js/", filename)

@app.route("/<path:filename>")
def root_files(filename):
    return send_from_directory(react_dir, filename)

@app.errorhandler(404)
def no_page(e):
    return jsonify({"message": "Endpoint not found!"}), 404

@app.errorhandler(400)
def generic_error(e):
    return jsonify({"message": "HTTP error code 400 occured!"}), 400


@app.before_request
def auth_request():
    """Authenticate User.

    Returns:
        JSON: JSON data to return to client, whether it be requested data or alerting of lack of authorization.

    """
    if request.method == "GET":
        return
    elif request.method == "OPTIONS":
        # Returns 200 so Chrome's console doesn't spam.
        return jsonify({"message": "OPTIONS requests are ignored by this server!"}), 200
    data = request.get_json()
    try:
        if data["auth"] == "password":
            return auth.get_perma_token(data["user"].lower(), data["password"])
        elif data["auth"] == "perma_token":
            return auth.get_temp_token(data["user"].lower(), data["token"])
        elif data["auth"] == "temp_token":
            r_data = auth.auth_token(data["token"])
            if r_data != {"message": "Authorized"}:
                return jsonify(r_data), 401
            else:
                return
        else:
            return {"message": "Unauthorized!"}, 401
    except KeyError:
        return {"message": "Unauthorized!"}, 401


@app.after_request
def after_request(response):
    if use_cors:
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@app.route("/api/data/get", methods=["POST"])
def send_data_to_client():
    data = request.get_json()
    if auth.check_permission(data["token"], "client_user"):
        to_del = []
        for pc in db.keys():
            if time.time() - db[pc]["time"] >= 60*60*24:  # Expire computers after 1 day
                to_del.append(pc)
        for pc in to_del:
            del db[pc]
        return jsonify({"message": "Data successfully received!", "data" : db})
    else:
        return jsonify({"message": "No permission!"}), 401


@app.route("/api/users/list", methods=["POST"])
def list_users():
    data = request.get_json()
    if auth.check_permission(data["token"], "manage_users"):
        return jsonify({"message": "Users successfully retrieved", "users": config["users"]})
    else:
        return jsonify({"message": "No permission!"}), 401


@app.route("/api/users/delete", methods=["POST"])
def delete_user():
    data = request.get_json()
    if auth.check_permission(data["token"], "manage_users"):
        return auth.delete_user(data["user_to_delete"])
    else:
        return jsonify({"message": "No permission!"}), 401


@app.route("/api/users/add", methods=["POST"])
def add_user():
    data = request.get_json()
    if auth.check_permission(data["token"], "manage_users"):
        return auth.add_user(data["user_to_add"], data["password_of_user"], data["permissions"])
    else:
        return jsonify({"message": "No permission!"}), 401


@app.route("/api/ping", methods=["POST"])
def ping():
    return jsonify({"message": "Pong!"})


@app.route("/api/data/put", methods=["POST"])
def take_data_from_client():
    data = request.get_json()
    if not auth.check_permission(data["token"], "computer_user"):
        return jsonify({"message": "No permission!"}), 401
    data = request.get_json()
    del data["auth"]
    del data["token"]
    pc_name = data["pc_name"]
    data.pop("pc_name")
    data["time"] = int(time.time())
    db[pc_name] = data
    return jsonify({"message": "Data successfully processed!"})


@app.route("/api/tokens/get", methods=["POST"])
def get_tokens():
    data = request.get_json()
    if auth.check_permission(data["token"], "revoke_tokens"):
        return jsonify({"temp_tokens": auth.get_temp_tokens(), "message": "Tokens successfully retrieved!", "perma_tokens": auth.get_perma_tokens()})
    else:
        return jsonify({"message": "No permission!"}), 401
    

@app.route("/api/tokens/delete", methods=["POST"])
def delete_token():
    data = request.get_json()
    if auth.check_permission(data["token"], "revoke_tokens"):
        try:
            if data["type"] == "perma":
                return auth.delete_perma_token(data["token_to_delete"])
            elif data["type"] == "temp":
                return auth.delete_temp_token(data["token_to_delete"])
            else:
                return jsonify({"message": "Token type to delete not specified!"}), 422
        except KeyError:
            return jsonify({"message": "Token to delete not specified!"}), 422
    else:
        return jsonify({"message": "No permission!"}), 401


@app.route("/api/fts", methods=["POST"])
def first_time_setup():
    data = request.get_json()
    if auth.check_permission(data["token"], "fts"):
        return auth.first_time_setup(data)
    else:
        return jsonify({"message": "No permission!"}), 401


def fts_prep():
    if not fts_complete:
        import string, secrets
        alphabet = string.ascii_letters + string.digits
        password = ''.join(secrets.choice(alphabet) for i in range(16))
        auth.delete_user("fts_user", return_jsonify=False)
        auth.add_user("fts_user", password, ["fts"], return_jsonify=False)
        print("{}\n{}".format("#"*60, "#"*60))
        print("Please complete first time setup using username 'fts_user' and password '{}'!".format(password))
        print("You can do so by visiting https://127.0.0.1:5000/login , logging in, then clicking 'First Time Setup' at the top-left.")
        print("You will most likely receive an SSL warning when visiting the above page. This is safe to ignore; Flask's adhoc")
        print("setting is used to ensure encryption, even if at the cost of using a self-signed certificate (which the OS")
        print("cannot verify)!")
        print("{}\n{}".format("#"*60, "#"*60))

if __name__ == "__main__":
    fts_prep()
    app.run("0.0.0.0", port, ssl_context="adhoc")