#!/usr/bin/python3

license = """
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

import requests
from time import sleep
import json
import signal
import getpass

import socket
import psutil

verify_requests = False

settings = {}
should_exit = False
token = None

if not verify_requests:
    import urllib3
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

def post_with_auth(url, inp_data={}):
    """Post Request with Authorization.

    Send a POST request while trying to authenticate with the central server

    Args:
        url (str): URL to send POST request to
        inp_data (dict, optional): Data to POST. Defaults to {}.

    Returns:
        dict: The data returned from the POST request

    """
    global token
    if token is None:
        auth_data = {"user": settings["user"], "password": settings["password"], "auth": "password"}
        r = requests.post(url, data=auth_data, verify=verify_requests)
        data = json.loads(r.text)
        if data["message"] == "Unauthorized!":
            return {"message": "Unauthorized!", "error": -1}
        elif data["message"] == "Generated token!":
            token = data["token"]
    inp_data.update({"token": token, "auth": "token"})
    r = requests.post(url, data=inp_data, verify=verify_requests)
    data = json.loads(r.text)
    if data["message"] == "Unauthorized!":
        token = None
        return post_with_auth(url, inp_data)
    elif data["message"] == "Token expired!":
        token = None
        return post_with_auth(url, inp_data)
    else:
        data["error"] = r.status_code
        return data


def write_db():
    """Write DB to File."""
    with open("settings.json", "w") as dbf:
        json.dump(settings, dbf)


def ping(ip):
    """Ping.

    Ping IP/address for {"message": "Pong!"}

    Args:
        ip (str): An IP address or website without the https://. ex. example.com or 127.0.0.1

    Returns:
        bool: Whether the requested JSON at thes URL has the key "message" that equals "Pong!"

    """
    data = post_with_auth("https://" + ip + "/ping")
    return data["message"] == "Pong!"


def startup():
    """Startup."""
    global settings
    try:
        with open("settings.json") as f:
            settings = json.load(f)
    except (json.decoder.JSONDecodeError, FileNotFoundError):
        print("Welcome to comp-status! By using this program, you agree to the following license: ")
        print(license)
        print("If you don't agree with the license above, please exit now.")
        while True:
            ip = input("Enter IP address of central server (including port)! ")
            user = input("Enter Username: ")
            password = getpass.getpass("Enter Password: ")
            settings["user"] = user
            settings["password"] = password
            if ping(ip):
                settings["ip"] = ip
                write_db()
                break
            else:
                print("Invalid IP/connection error!")


def set_exit(sig, frame):
    """Exit on CTRL+C."""
    global should_exit
    print("\nExiting...")
    should_exit = True


def main_loop():
    """Main Program Loop."""
    print("Running server loop...")
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
            post_with_auth("https://localhost:5000/take_data", {
                "pc_name": pc_name,
                "current_memory": current_memory, "used_memory": used_memory,
                "cpu_usage": cpu_usage, "current_turbo": current_turbo, "max_turbo": max_turbo,
                "cpu_temps": cpu_temps, "cpu_pack_temp": cpu_pack_temp, "cpu_usages": cpu_usages,
                "multi": temps * 2 == cpus

            })
        except requests.exceptions.ConnectionError:
            print("Failed to send request!")
    exit(0)


if __name__ == "__main__":
    startup()
    signal.signal(signal.SIGINT, set_exit)
    main_loop()