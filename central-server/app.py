#!/usr/bin/python3

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
    data = request.form.to_dict()
    try:
        if data["auth"] == "password":
            return auth.get_token(data["user"], data["password"])
        elif data["auth"] == "token":
            r_data = auth.auth_token(data["token"])
            if r_data != {"message": "Authorized"}:
                return r_data
            else:
                return
        else:
            return {"message": "Unauthorized!"}
    except KeyError:
        print(data)
        return {"message": "Unauthorized!"}


@app.route("/give_data", methods=["GET", "POST"])
def give_data():
    return jsonify({"message": "Data successfully received!", "data" : db})

@app.route("/ping", methods=["GET", "POST"])
def ping():
    return jsonify({"message": "Pong!"})


@app.route("/take_data", methods=["POST"])
def take_data():
    data = request.form.to_dict()
    pc_name = data["pc_name"]
    data.pop("pc_name")
    data["time"] = int(time.time())
    db[pc_name] = data
    return jsonify({"message": "Data successfully processed!"})

if __name__ == "__main__":
    app.run("0.0.0.0", 5000,ssl_context="adhoc")