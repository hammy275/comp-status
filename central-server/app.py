from flask import Flask, jsonify, request
import time

app = Flask(__name__)

db = {}

@app.errorhandler(404)
def no_page(e):
    return jsonify({"error": 404, "message": "Endpoint not found!"})


@app.route("/give_data", methods=["GET", "POST"])
def give_data():
    return jsonify({"error": 200, "message": "Data successfully received!", "data" : db})

@app.route("/ping", methods=["GET", "POST"])
def ping():
    return {"error": 200, "message": "Pong!"}


@app.route("/take_data", methods=["POST"])
def take_data():
    data = request.form.to_dict()
    pc_name = data["pc-name"]
    data.pop("pc-name")
    data["time"] = int(time.time())
    db[pc_name] = data
    return jsonify({"error": 200, "message": "Data successfully processed!"})