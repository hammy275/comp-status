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
from random import choice

expire_time = 60*60*24  # Time in seconds until a token expires

users = {
    "TestUser": {"password": "abc123"}
}  # Will be stored in a file (hopefully encrypted) at some point. Using a test user for now.

tokens = {}
nums = []
for i in range(0,10):
    nums.append(str(i))
chars = list(string.ascii_lowercase) + nums

def gen_token():
    """Generate Random 32 Char Token.

    Returns:
        str: 32 random alphanumeric characters

    """
    token = ""
    for i in range(32):
        if choice([True, False]):
            token += choice(chars).upper()
        else:
            token += choice(chars)
    return token


def auth_token(token):
    """Check Token.

    Check whether the provided token is valid for use.

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


def get_token(user, password):
    """Get Token for User.

    Generates a token for a user if their username and password are valid.

    Args:
        user (str): Client supplied username
        password (str): Client supplied password

    Returns:
        dict: A generated token or unauthorized.

    """
    time.sleep(1)
    try:
        if users[user]["password"] == password:
            token = gen_token()
            tokens[token] = {"time": time.time()}
            return {"message": "Generated token!", "token": token}
        else:
            return {"message": "Unauthorized!"} 
    except KeyError:
        return {"message": "Unauthorized!"}