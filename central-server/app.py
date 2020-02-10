from flask import Flask, jsonify, request
import time

app = Flask(__name__)

db = {}
dirty_ssl = True  # Whether to run with Flask's "adhoc" SSL context

@app.errorhandler(404)
def no_page(e):
    return jsonify({"message": "Endpoint not found!"}), 404

@app.errorhandler(400)
def generic_error(e):
    return jsonify({"message": "HTTP error code 400 occured!"}), 400


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
    if dirty_ssl:
        app.run("0.0.0.0", 5000,ssl_context="adhoc")
    else:
        app.run("0.0.0.0", 5000)