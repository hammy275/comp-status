
# comp-status

A small utility to get processor usage, RAM usage, etc. from computers. **This utility should NOT be used in any remotely-important environment due to an absolute lack of authentication.**

## WARNING

This program currently has __no__ form of authentication, and as such, should only be used in a testing environment.

## Requirements

* Python 3
* Pip to install the requirements.txt

## Folders

`central-server`: Contains the central server program. Used to receive computer status data from other computers and distribute it to clients.

`server`: Contains the server program used. This should be run on computers that resources should be monitored on. The IP address requested on first run should point to the computer running `central-server`.

`client`: Contains a client/clients that connect to `central-server` to retrieve information about computers. The IP address requested on first run should point to the computer running `central-server`.