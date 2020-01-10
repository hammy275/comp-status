import requests
from time import sleep

import socket
import psutil


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
                "pc-name": "BRADLEY2",
                "current_memory": current_memory, "used_memory": used_memory,
                "cpu_usage": cpu_usage, "current_turbo": current_turbo, "max_turbo": max_turbo,

            })
        except requests.exceptions.ConnectionError:
            pass
        sleep(1)




if __name__ == "__main__":
    main_loop()