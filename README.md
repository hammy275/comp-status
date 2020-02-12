
# comp-status

A small utility to get processor usage, RAM usage, etc. from computers.

## WARNING

I don't entirely know what I'm doing, and this program has a form of authentication with __no__ encryption outside of using HTTPS to communicate. I have no idea if I'll even be adding encryption or not, because it's really beyond my scope of knowledge. Either way, __DO NOT USE THIS SOFTWARE IN ANY REMOTELY IMPORTANT ENVIRONMENT__ (unless you're willing to take the risk and/or know what you're doing).

## Requirements

* Python 3
* Pip to install the requirements.txt

## Folders

`central-server`: Contains the central server program. Used to receive computer status data from other computers and distribute it to clients. Also contains `user_manager.py`, for managing users on the server.

`server`: Contains the server program used. This should be run on computers that resources should be monitored on. The IP address requested on first run should point to the computer running `central-server`.

`client`: Contains a client/clients that connect to `central-server` to retrieve information about computers. The IP address requested on first run should point to the computer running `central-server`.