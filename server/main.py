import requests
from time import sleep
import json

import socket
import psutil

settings = {}

def write_db():
    with open("settings.json", "w") as dbf:
        json.dump(settings, dbf)

def startup():
    global settings
    try:
        with open("settings.json") as f:
            settings = json.load(f)
    except (json.decoder.JSONDecodeError, FileNotFoundError):
        while True:
            ip = input("Enter IP address of central server (including port)! ")
            try:
                r = requests.post("http://" + ip + "/ping")
                if json.loads(r.text)["message"] == "Pong!":
                    settings["ip"] = ip
                    write_db()
                    break
                else:
                    print("Invalid IP!")
            except requests.exceptions.ConnectionError:
                print("Connection error/invalid IP address!")


def main_loop():
    while True:
        pc_name = socket.gethostname()

        current_memory = psutil.virtual_memory()[0] / 1000000000
        used_memory = current_memory - (psutil.virtual_memory()[1] / 1000000000)

        cpu_usage = psutil.cpu_percent(interval=1)
        current_turbo = int(psutil.cpu_freq()[0])
        max_turbo = int(psutil.cpu_freq()[2])

        try:
            r = requests.post("http://localhost:5000/take_data", {
                "pc-name": pc_name,
                "current_memory": current_memory, "used_memory": used_memory,
                "cpu_usage": cpu_usage, "current_turbo": current_turbo, "max_turbo": max_turbo,

            })
        except requests.exceptions.ConnectionError:
            print("Failed to send request!")
        sleep(1)


if __name__ == "__main__":
    startup()
    main_loop()