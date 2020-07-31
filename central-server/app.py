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


with open("db.json") as f:  # Error handling for this is done in "auth"
    config = json.load(f)

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
    domain = config["domain"]
except KeyError:
    domain = None

@app.route('/')
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
    if request.method == "OPTIONS":
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
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@app.route("/give_data", methods=["POST"])
def give_data():
    return jsonify({"message": "Data successfully received!", "data" : db})


@app.route("/ping", methods=["POST"])
def ping():
    return jsonify({"message": "Pong!"})


@app.route("/take_data", methods=["POST"])
def take_data():
    data = request.get_json()
    del data["auth"]
    del data["token"]
    pc_name = data["pc_name"]
    data.pop("pc_name")
    data["time"] = int(time.time())
    db[pc_name] = data
    return jsonify({"message": "Data successfully processed!"})


@app.route("/get_tokens", methods=["POST"])
def get_tokens():
    data = request.get_json()
    if auth.check_permission(data["token"], "revoke_tokens"):
        return jsonify({"temp_tokens": auth.get_temp_tokens(), "message": "Tokens successfully retrieved!", "perma_tokens": auth.get_perma_tokens()})
    else:
        return jsonify({"message": "No permission!"}), 401
    

@app.route("/delete_token", methods=["POST"])
def delete_token():
    data = request.get_json()
    if auth.check_permission(data["token"], "revoke_tokens"):
        try:
            if data["type"] == "perma":
                return jsonify(auth.delete_perma_token(data["token_to_delete"]))
            elif data["type"] == "temp":
                return jsonify(auth.delete_temp_token(data["token_to_delete"]))
            else:
                return jsonify({"message": "Token type to delete not specified!"}), 422
        except KeyError:
            return jsonify({"message": "Token to delete not specified!"}), 422
    else:
        return jsonify({"message": "No permission!"}), 401


if __name__ == "__main__":
    app.run("0.0.0.0", port, ssl_context="adhoc")