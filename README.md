
# comp-status

A small utility to get processor usage, RAM usage, etc. from computers.

## WARNING

Although this program does use bcrypt to store passwords, and communication is done over a dummy HTTPS certificate, I would highly recommend NOT using this program without inspecting `auth.py` and `server_manager.py` and seeing for yourself if it's secure enough. I'm just one person, and this is my first program to do any form of password storage, so I have my doubts it's done properly.

## Requirements

* Python 3.6 or later
* Pip to install the requirements.txt
* A working ability to build React projects (central-server computer only)

## Folders

`central-server`: Contains the central server program. Used to receive computer status data from other computers and distribute it to clients. Also contains `server_manager.py`, for managing users on the server and configuring the server itself.

`server`: Contains the server program used. This should be run on computers that resources should be monitored on. The IP address requested on first run should point to the computer running `central-server`.

`client`: Contains a client/clients that connect to `central-server` to retrieve information about computers. The IP address requested on first run should point to the computer running `central-server`.