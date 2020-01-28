import requests
from time import sleep
import json
import signal

import socket
import psutil

settings = {}
should_exit = False

def write_db():
    with open("settings.json", "w") as dbf:
        json.dump(settings, dbf)


def ping(ip):
    try:
        r = requests.post("http://" + ip + "/ping")
        return json.loads(r.text)["message"] == "Pong!"
    except requests.exceptions.ConnectionError:
        return False


def startup():
    global settings
    try:
        with open("settings.json") as f:
            settings = json.load(f)
    except (json.decoder.JSONDecodeError, FileNotFoundError):
        while True:
            ip = input("Enter IP address of central server (including port)! ")
            if ping(ip):
                settings["ip"] = ip
                write_db()
                break
            else:
                print("Invalid IP/connection error!")


def set_exit(sig, frame):
    global should_exit
    print("\nExiting...")
    should_exit = True


def main_loop():
    while not should_exit:
        pc_name = socket.gethostname()

        current_memory = round(psutil.virtual_memory()[0] / 1000000000, 2)
        used_memory = round(current_memory - (psutil.virtual_memory()[1] / 1000000000), 2)

        cpu_usages_floats = psutil.cpu_percent(interval=1, percpu=True)
        cpu_usage = psutil.cpu_percent(interval=1)
        cpu_usages = []
        cpus = len(cpu_usages_floats)
        for c in cpu_usages_floats:
            cpu_usages.append(str(c))
        cpu_usages = ",".join(cpu_usages)
        current_turbo = int(psutil.cpu_freq()[0])
        max_turbo = int(psutil.cpu_freq()[2])
        cpu_temps = []
        for i in psutil.sensors_temperatures()["coretemp"]:
            cpu_temps.append(str(i[1]))
        temps = len(cpu_temps)
        cpu_pack_temp = cpu_temps[0]
        cpu_temps = ",".join(cpu_temps[1:])

        try:
            r = requests.post("http://localhost:5000/take_data", {
                "pc_name": pc_name,
                "current_memory": current_memory, "used_memory": used_memory,
                "cpu_usage": cpu_usage, "current_turbo": current_turbo, "max_turbo": max_turbo,
                "cpu_temps": cpu_temps, "cpu_pack_temp": cpu_pack_temp, "cpu_usages": cpu_usages,
                "multi": temps * 2 == cpus

            })
            if r.status_code != 200:
                print("Error code: {}".format(str(r.status_code)))
        except requests.exceptions.ConnectionError:
            print("Failed to send request!")
    exit(0)


if __name__ == "__main__":
    signal.signal(signal.SIGINT, set_exit)
    startup()
    main_loop()