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

import json
import requests
import time
import getpass

verify_requests = False

settings = {}
token = None

if not verify_requests:
    import urllib3
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

def nprint(st):
    """Print Without Newline.

    Args:
        st (any): Thing to print without newline

    """
    print(st, end="")

def clear():
    """Clear Screen."""
    for _ in range(50):
        print()

def write_db():
    """Write DB to File."""
    with open("settings.json", "w") as dbf:
        json.dump(settings, dbf)


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
        r = requests.post(url, json=auth_data, verify=verify_requests)
        data = json.loads(r.text)
        if data["message"] == "Unauthorized!":
            return {"message": "Unauthorized!", "error": -1}
        elif data["message"] == "Generated token!":
            token = data["token"]
    inp_data.update({"token": token, "auth": "token"})
    r = requests.post(url, json=inp_data, verify=verify_requests)
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


def get_data():
    """Get PC Data.

    Returns:
        dict: A dictionary containing PC data.

    """
    try:
        data = post_with_auth("https://" + settings["ip"] + "/give_data")
        if data["message"] == "Unauthorized!":
            return {"message": "Unauthorized!", "error": -1}
        pcs = []
        for pc in data["data"]:
            pcs.append(pc)
        pcs = sorted(pcs)
        pc_dict = {}
        for pc in pcs:
            pc_dict[pc] = data["data"][pc]
        data["data"] = pc_dict
        return data
    except requests.exceptions.ConnectionError:
        return {"message": "Connection error!", "error": -1}


def ping(ip):
    """Ping IP for Pong! Message.

    Args:
        ip (str): IP and port to check

    Returns:
        str: The returned message, or "Connection Error!"

    """
    try:
        data = post_with_auth("https://" + ip + "/ping")
        return data["message"]
    except requests.exceptions.ConnectionError:
        return "Connection Error!"


def startup():
    """Run on Startup."""
    global settings
    skip_license = False
    try:
        skip_license = True
        with open("settings.json") as f:
            settings = json.load(f)
        p_result = ping(settings["ip"])
        if p_result != "Pong!":
            print(p_result)
            print("\nFailed to authenticate/connect properly!")
            print("If this is just a one time thing, feel free to CTRL+C and re-open this program.")
            print("Your old configuration will not be overwritten until you confirm a working IP, username, and password.\n")
            raise FileNotFoundError
    except (json.decoder.JSONDecodeError, FileNotFoundError):
        if not skip_license:
            print("Welcome to comp-status! By using this program, you agree to the following license: ")
            print(license)
            print("If you don't agree with the license above, please exit now.")
        while True:
            ip = input("Enter IP address of central server (including port)! ")
            user = input("Enter Username: ")
            password = getpass.getpass("Enter Password: ")
            settings["user"] = user
            settings["password"] = password
            p_result = ping(ip)
            if p_result == "Pong!":
                settings["ip"] = ip
                write_db()
                break
            elif p_result == "Unauthorized!":
                print("Invalid IP or username/password!")
            else:
                print(p_result)


def token_manager():
    """Token Manager."""
    data = post_with_auth("https://" + settings["ip"] + "/get_tokens")
    if data["message"] == "No permission!":
        print("You aren't authorized to manage tokens!")
        time.sleep(3)
        return
    elif data["message"] == "Tokens successfully retrieved!":
        c = 0
        for t in data["tokens"].keys():
            print("{c}: {t} - Generated by {u}".format(u=data["tokens"][t]["user"], t=t, c=c))
            c += 1
        ask = input("Type a number to delete that token, or anything else to exit.")
        try:
            ask = int(ask)
            post_with_auth("https://" + settings["ip"] + "/delete_token", {"token_to_delete": list(data["tokens"].keys())[ask]})
        except ValueError:
            return


def main():
    """Main Loop."""
    loop = False
    last_str = ""
    while True:
        time.sleep(1)
        clear()
        print(last_str)
        last_str = ""
        data = get_data()
        if data["message"] != "Data successfully received!" or data["error"] != 200:
            print("Error: " + data["message"])
        else:
            for pc in data["data"]:
                d = data["data"][pc]
                ct = d["cpu_temps"].split(",")
                cp = d["cpu_usages"].split(",")
                ics = "Individual CPU Temperatures: {t}°C\nIndividual CPU Usages: {c}%".format(
                    t="°C, ".join(ct), c="%, ".join(cp)
                )
                last_str += """\n
{pc} (last received status was {lasttime} second(s) ago):
Memory: {cm} GB/{tm} GB ({pm}% Usage)
CPU Stats: {p}% Usage at {cpt}°C
Turbo: {cc} GHz/{mc} GHz
{ics}""".format(pc=pc,cm=d["used_memory"], tm=d["current_memory"], p=d["cpu_usage"],
                cc=d["current_turbo"], mc=d["max_turbo"], ics=ics, cpt=d["cpu_pack_temp"],
                pm=str(round(float(d["used_memory"]) / float(d["current_memory"]) * 100, 1) ),
                lasttime=str(int(time.time() - d["time"])))
        if not loop:
            opt = input("ENTER to refresh, \"t\" to manage tokens or \"l\" to loop resource view.")
            opt = opt.lower()
            if opt == "t":
                token_manager()
            elif opt == "l":
                loop = True



if __name__ == "__main__":
    startup()
    main()