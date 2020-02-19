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

from flask import Flask, jsonify, request
import time
import auth

app = Flask(__name__)

db = {}

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
    elif request.method != "POST":
        return {"message": "Server exists!"}
    data = request.get_json()
    try:
        if data["auth"] == "password":
            return auth.get_token(data["user"], data["password"])
        elif data["auth"] == "token":
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


@app.route("/", methods=["GET"])
def index():
    return "There's no webpage here, yet!"


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
        return jsonify({"tokens": auth.get_tokens(), "message": "Tokens successfully retrieved!"})
    else:
        return jsonify({"message": "No permission!"}), 401
    

@app.route("/delete_token", methods=["POST"])
def delete_token():
    data = request.get_json()
    if auth.check_permission(data["token"], "revoke_tokens"):
        try:
            return jsonify(auth.delete_token(data["token_to_delete"]))
        except KeyError:
            return jsonify({"message": "Token to delete not specified!"})
    else:
        return jsonify({"message": "No permission!"}), 401


if __name__ == "__main__":
    app.run("0.0.0.0", 5000,ssl_context="adhoc")