import json
import requests
import time

settings = {}

def nprint(st):
    print(st, end="")

def clear():
    for i in range(0,50):
        print()

def write_db():
    with open("settings.json", "w") as dbf:
        json.dump(settings, dbf)


def get_data():
    try:
        r = requests.get("http://" + settings["ip"] + "/give_data")
        return json.loads(r.text)
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
                last_str += """\n
{pc}
Memory: {cm} GB/{tm} GB
CPU Usage: {p}%
Turbo: {cc} GHz/{mc} GHz""".format(pc=pc,cm=d["used_memory"], tm=d["current_memory"], p=d["cpu_usage"],
                cc=d["current_turbo"], mc=d["max_turbo"])
        time.sleep(1)



if __name__ == "__main__":
    startup()
    main()