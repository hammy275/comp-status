"""
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

import time
import string
from secrets import choice, token_urlsafe
import json
import sys
import bcrypt

try:
    with open("db.json") as f:
        db = json.load(f)
        users = db["users"]
except (json.decoder.JSONDecodeError, FileNotFoundError):
    print("db.json does not exist! Please run server_manager.py (and configure a user if one has not already been)!")
    sys.exit(1)

expire_time = 60*60*24  # Time in seconds until a token expires

tokens = {}


def write_db():
    """Write DB to File."""
    with open("db.json", "w") as dbf:
        json.dump(db, dbf)
    print("Database successfully written!")


def check_permission(token, permission):
    try:
        user = tokens[token]["user"]
        return permission in users[user]["permissions"]
    except Exception:
        return False


def gen_token():
    """Generate Random 64 Char Token.

    Returns:
        str: A string of Random alphanumeric characters

    """
    return token_urlsafe(64)


def get_temp_tokens():
    """Get Temp Tokens Dict.

    Returns:
        dict: The tokens dictionary.

    """
    return tokens


def get_perma_tokens():
    """Get Perma Tokens of Users.

    Returns:
        dict: The perma-tokens dictionary.

    """
    to_return = {}
    for user in users.keys():
        try:
            to_return[user] = users[user]["tokens"]
        except KeyError:
            pass
    return to_return


def delete_perma_token(token):
    """Delete Perma-Token.

    Args:
        token (str): Token to delete

    Returns:
        dict: A dict reflecting the status of the deletion.

    """
    try:
        for user in users.keys():
            if token in users[user]["tokens"]:
                new_tokens = users[user]["tokens"]
                new_tokens.remove(token)
                users[user]["tokens"] = new_tokens
                write_db()
                return {"message": "Perma-token deleted successfully!"}
        return {"message": "Specified token not found!"}
    except (ValueError, KeyError):
        return {"message": "Specified token not found!"}


def delete_temp_token(token):
    """Delete Token.

    Args:
        token (str): The token to delete

    Returns:
        dict: A dict to be parsed into JSON to return to clients

    """
    try:
        del tokens[token]
        return {"message": "Temp-token deleted successfully!"}
    except KeyError:
        return {"message": "Token does not exist!"}


def auth_token(token):
    """Check Token.

    Check whether the provided temporary token is valid for use.

    Args:
        token (str): Token to check if valid.

    Returns:
        dict: Whether the token is authorized, unauthorized, or expired.

    """
    try:
        if tokens[token]["time"] + expire_time > time.time():
            return {"message": "Authorized"}
        else:
            return {"message": "Token expired!"}
    except KeyError:
        return {"message": "Unauthorized!"} 


def get_perma_token(user, password):
    """Get Permanent Token for User.

    Generates a permanent token for a user if their username and password are valid.

    Args:
        user (str): Client supplied username
        password (str): Client supplied password

    Returns:
        dict: A generated token or unauthorized.

    """
    time.sleep(1)
    try:
        if bcrypt.checkpw(password.encode('utf-8'), users[user]["password"].encode("utf-8")):
            perma_token = gen_token()
            try:
                users[user]["tokens"].append(perma_token)
            except KeyError:
                users[user]["tokens"] = [perma_token]
            write_db()
            return {"message": "Generated perma-token!", "token": perma_token}
        else:
            return {"message": "Unauthorized!"} 
    except KeyError:
        return {"message": "Unauthorized!"}


def get_temp_token(user, perma_token):
    """Get Temporary Token for User.

    Args:
        user (str): Username of user to generate token for
        perma_token (str): A valid perma-token

    Returns:
        dict: A generated token or unauthorized

    """
    time.sleep(0.5)
    try:
        if perma_token in users[user]["tokens"]:
            token = gen_token()
            tokens[token] = {"time": time.time(), "user": user, "permissions": users[user]["permissions"]}
            return {"message": "Generated temporary-token!", "token": token, "permissions": users[user]["permissions"]}
        else:
            return {"message": "Unauthorized!"}
    except KeyError:
        return {"message": "Unauthorized!"}