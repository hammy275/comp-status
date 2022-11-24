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
from secrets import token_urlsafe
import json
import sys
import bcrypt
from flask import jsonify

try:
    with open("db.json") as f:
        db = json.load(f)
        users = db["users"]
except (json.decoder.JSONDecodeError, FileNotFoundError):
    db = {"fts_complete": False, "users": {}}  # The bare minimum db for first time setup
    users = db["users"]

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
        json, int: JSON reflecting the status of the deletion and an associated HTTP error code.

    """
    try:
        for user in users.keys():
            if token in users[user]["tokens"]:
                new_tokens = users[user]["tokens"]
                new_tokens.remove(token)
                users[user]["tokens"] = new_tokens
                write_db()
                return jsonify({"message": "Perma-token deleted successfully!"}), 200
        return jsonify({"message": "Specified token not found!"}), 400
    except (ValueError, KeyError):
        return jsonify({"message": "Specified token not found!"}), 400


def delete_temp_token(token):
    """Delete Token.

    Args:
        token (str): The token to delete

    Returns:
        json, int: JSON and a HTTP return code to be returned to clients.

    """
    try:
        del tokens[token]
        return jsonify({"message": "Temp-token deleted successfully!"}), 200
    except KeyError:
        return jsonify({"message": "Token does not exist!"}), 400


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
    Will return the perma-token if it's already generated.

    Args:
        user (str): Client supplied username
        password (str): Client supplied password

    Returns:
        json, int: A message parameter in json and an int representing a HTTP status code.

    """
    time.sleep(1)
    try:
        if bcrypt.checkpw(password.encode('utf-8'), users[user]["password"].encode("utf-8")):
            try:
                return jsonify({"message": "Generated perma-token!", "token": users[user]["tokens"][0]}), 200
            except (IndexError, KeyError):
                perma_token = gen_token()
                users[user]["tokens"] = [perma_token]
                write_db()
                return jsonify({"message": "Generated perma-token!", "token": perma_token}), 200
        else:
            return jsonify({"message": "Unauthorized!"}), 401
    except KeyError:
        return jsonify({"message": "Unauthorized!"}), 401


def get_temp_token(user, perma_token):
    """Get Temporary Token for User.

    Args:
        user (str): Username of user to generate token for
        perma_token (str): A valid perma-token

    Returns:
        JSON, int: A JSON message, followed by an int representing an HTTP status code

    """
    time.sleep(0.5)
    try:
        if perma_token in users[user]["tokens"]:
            token = gen_token()
            tokens[token] = {"time": time.time(), "user": user, "permissions": users[user]["permissions"]}
            return jsonify({"message": "Generated temporary-token!", "token": token, "permissions": users[user]["permissions"]}), 200
        else:
            return jsonify({"message": "Unauthorized!"}), 401
    except KeyError:
        return jsonify({"message": "Unauthorized!"}), 401


def delete_user(user, return_jsonify=True):
    try:
        del db["users"][user]
    except KeyError:
        if return_jsonify:
            return jsonify({"message": "User does not exist!"}), 400
        else:
            return 400
    write_db()
    if return_jsonify:
        return jsonify({"message": "Successfully deleted user!"}), 200
    else:
        return 200


def add_user(user, password, permissions, return_jsonify=True):
    if user.lower() in db["users"]:
        if return_jsonify:
            return jsonify({"message": "User already exists!"}), 400
        else:
            return 400
    db["users"][user.lower()] = {"password": bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode("utf-8"), "permissions": permissions}
    write_db()
    if return_jsonify:
        return jsonify({"message": "User successfully added!"}), 200
    else:
        return 200


def first_time_setup(data):
    """Do First time setup.

    The new user created here should receive every permission except computer_user and fts, effectively making
    it an "admin".

    Data Arguments:
        new_username (str): The username to create for usage
        new_password (str): THe password for the new user
        port (int): The port to host the server on
        domain (str): The domain for the server (such as "example.com")

    Args:
        data (dict): Dictionary containing the data found above

    Returns:
        JSON, int: JSON and a HTTP code to send to the client

    """
    if "fts_complete" in db and db["fts_complete"]:
        return jsonify({"message": "First time setup already completed!"}), 409
    else:
        if not isinstance(data["port"], int):
            try:
                data["port"] = int(data["port"])
            except ValueError:
                return jsonify({"message": "'port' must be an int!"}), 400
        data["new_username"] = str(data["new_username"])
        data["new_password"] = str(data["new_password"])
        if data["domain"]:
            data["domain"] = str(data["domain"])
        else:
            data["domain"] = None
        delete_user("fts_user")
        add_user(data["new_username"], data["new_password"], ["client_user", "revoke_tokens", "manage_users"])
        db["port"] = data["port"]
        db["domain"] = data["domain"]
        db["fts_complete"] = True
        db["use_cors"] = True
        write_db()
        return jsonify({"message": "Successfully completed first time setup!"}), 200
