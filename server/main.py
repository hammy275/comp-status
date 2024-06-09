#!/usr/bin/python3

license = """
    comp-status: A small set of Python files to get the status of computers
    Copyright (C) 2021  hammy3502

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
import json
import signal
import getpass
import sys

import socket
import psutil

verify_requests = False

settings = {}
should_exit = False
perma_token = None
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
    global perma_token
    global token
    global settings
    if perma_token is None:
        auth_data = {"user": settings["user"], "password": settings["password"], "auth": "password"}
        r = requests.post(url, json=auth_data, verify=verify_requests)
        data = json.loads(r.text)
        if data["message"] == "Unauthorized!":
            return {"message": "Unauthorized!", "error": -1}
        elif data["message"] == "Generated perma-token!":
            perma_token = data["token"]
            settings["token"] = perma_token
            write_db()
    if token is None:
        auth_data = {"user": settings["user"], "token": perma_token, "auth": "perma_token"}
        r = requests.post(url, json=auth_data, verify=verify_requests)
        data = json.loads(r.text)
        if data["message"] == "Unauthorized!":
            return {"message": "Unauthorized!", "error": -1}
        elif data["message"] == "Generated temporary-token!":
            token = data["token"]
    inp_data.update({"token": token, "auth": "temp_token"})
    r = requests.post(url, json=inp_data, verify=verify_requests)
    data = json.loads(r.text)
    if data["message"] == "Unauthorized!":
        token = None
        return post_with_auth(url, inp_data)
    elif data["message"] == "Token expired!":
        token = None
        return post_with_auth(url, inp_data)
    elif data["message"] == "No permission!":
        del settings["token"]
        write_db()
        print("The specified account does not have permission to act as a computer! Please re-configure!")
        sys.exit(1)
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
    data = post_with_auth(ip + "/api/ping")
    return data["message"]


def startup():
    """Startup."""
    global settings
    global perma_token
    try:
        with open("settings.json") as f:
            settings = json.load(f)
        if "user" not in settings or ("password" not in settings and "token" not in settings) or "ip" not in settings:
            raise KeyError()
        if "password" in settings:
            status = ping(settings["ip"])
            if status == "Pong!":
                del settings["password"]
                write_db()
            else:
                print(status)
                print("Failed to reach central-server.")
                sys.exit(1)
        else:
            perma_token = settings["token"]
    except (json.decoder.JSONDecodeError, FileNotFoundError, KeyError):
        print("Welcome to comp-status! By using this program, you agree to the following license: ")
        print(license)
        print("If you don't agree with the license above, please cease using this program.")
        file_data = {
            "ip": "URL_TO_YOUR_SERVER_HERE",
            "user": "YOUR_USERNAME_HERE",
            "password": "YOUR_PASSWORD_HERE_THAT_WILL_BE_REMOVED_AFTER_SUCCESSFUL_AUTHENTICATION"
        }
        with open("settings.json", "w") as f:
            json.dump(file_data, f)
        print("Wrote settings file to settings.json. If you're running inside a Docker container, you should "
              "point a settings.json file to /app/settings.json if you haven't already, then run this script again.")
        sys.exit(1)


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

        cpu_usages_floats = psutil.cpu_percent(interval=2, percpu=True)
        cpu_usage = psutil.cpu_percent(interval=2)
        cpu_usages = []
        cpus = len(cpu_usages_floats)
        for c in cpu_usages_floats:
            cpu_usages.append(str(c))
        cpu_usages = ",".join(cpu_usages)
        current_turbo = int(psutil.cpu_freq()[0])
        max_turbo = int(psutil.cpu_freq()[2])
        if sys.platform == "win32":
            current_turbo = None
            max_turbo = None  # Don't send turbo info if we're on Windows (turbo info broken there)
        cpu_temps = []
        try:
            for i in psutil.sensors_temperatures()["coretemp"]:
                cpu_temps.append(str(i[1]))
        except (AttributeError, KeyError):
            pass
        if cpu_temps:
            temps = len(cpu_temps)
            cpu_pack_temp = cpu_temps[0]
            cpu_temps = ",".join(cpu_temps[1:])
        else:
            temps = cpus / 2
            cpu_pack_temp = ""
            cpu_temps = [""]

        try:
            post_with_auth("{}/api/data/put".format(settings["ip"]), {
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
