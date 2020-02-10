#!/usr/bin/python3

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
    print(st, end="")

def clear():
    for i in range(50):
        print()

def write_db():
    with open("settings.json", "w") as dbf:
        json.dump(settings, dbf)


def post_with_auth(url, inp_data={}):
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
        return {"message": "Unauthorized!", "error": -1}
    elif data["message"] == "Token expired!":
        token = None
        return post_with_auth(url)
    else:
        data["error"] = r.status_code
        return data




def get_data():
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


def startup():
    global settings
    try:
        with open("settings.json") as f:
            settings = json.load(f)
    except (json.decoder.JSONDecodeError, FileNotFoundError):
        while True:
            ip = input("Enter IP address of central server (including port)! ")
            user = input("Enter Username: ")
            password = getpass.getpass("Enter Password: ")
            settings["user"] = user
            settings["password"] = password
            try:
                data = post_with_auth("https://" + ip + "/ping")
                if data["message"] == "Pong!":
                    settings["ip"] = ip
                    write_db()
                    break
                else:
                    print("Invalid IP or username/password!")
            except requests.exceptions.ConnectionError:
                print("Connection error/invalid IP address!")


def main():
    last_str = ""
    while True:
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
{pc}:
Memory: {cm} GB/{tm} GB ({pm}% Usage)
CPU Stats: {p}% Usage at {cpt}°C
Turbo: {cc} GHz/{mc} GHz
{ics}""".format(pc=pc,cm=d["used_memory"], tm=d["current_memory"], p=d["cpu_usage"],
                cc=d["current_turbo"], mc=d["max_turbo"], ics=ics, cpt=d["cpu_pack_temp"],
                pm=str(round(float(d["used_memory"]) / float(d["current_memory"]) * 100, 1) ))
        time.sleep(1)



if __name__ == "__main__":
    startup()
    main()