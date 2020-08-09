#!/usr/bin/python3

import json
import getpass
import sys
import bcrypt

config_version = 4

try:
    with open("db.json") as f:
        db = json.load(f)
except (json.decoder.JSONDecodeError, FileNotFoundError):
    try:
        with open("users.json") as f:
            db = json.load(f)
    except (json.decoder.JSONDecodeError, FileNotFoundError):
        db = {"version": config_version, "users": {}, "port": 5000}


def get_config(key):
    try:
        return db[key]
    except KeyError:
        if key == "port":
            return 5000
        elif key == "version":
            return config_version
        elif key == "domain":
            return example.com


def upgrade_db():
    global db
    try:
        db_version = db["version"]
    except KeyError:
        db_version = 1
    while db_version < config_version:
        if db_version == 1:
            print("Upgrading from DB version 1 to 2")
            new_db = {}
            new_db["users"] = db
            db = new_db
            db["port"] = 5000
            from os import remove
            remove("users.json")
            del remove
        elif db_version == 2:
            print("Upgrading from DB version 2 to 3")
            new_db = {"users": {}, "port": get_config("port"), "domain": get_config("domain")}
            for username in db["users"].keys():
                new_db["users"][username.lower()] = db["users"][username]
            db = new_db
        elif db_version == 3:
            print("Upgrading from DB version 3 to 4")
            for user in db["users"].keys():
                db["users"][user]["permissions"].append("computer_user")
                db["users"][user]["permissions"].append("client_user")
        db_version += 1
        db["version"] = db_version
        write_db()


def write_db():
    """Write DB to File."""
    with open("db.json", "w") as dbf:
        json.dump(db, dbf)
    print("Database successfully written!")


def get_input(question, options, default=None):
    ans = None
    while ans is None or ans not in options:
        ans = input(question)
        if default is not None and ans == "":
            ans = default
    return ans


def settings_manager():
    opt = ""
    while opt != "0" and opt.lower() != "e":
        opt = get_input("1 - Change Port (currently {})\n2 - Set Domain Name\n0/e - Exit\n".format(str(get_config("port"))), ["1", "2", "0", "e"])
        if opt == "1":
            new_port = input("Enter a new port number: ")
            try:
                new_port = int(new_port)
            except ValueError:
                print("NaN!")
                continue
            db["port"] = new_port
        elif opt == "2":
            domain_name = input("Enter a domain name to use when using \"run_server.py\": ")
            db["domain"] = domain_name

def user_manager():
    opt = ""
    while opt != "0" and opt.lower() != "e":
        opt = get_input("1 - Add User\n2 - Remove/List User(s)\n3 - Change Password of User\n0/e - Exit\n", ["1", "2", "3", "0", "e", "E"])
        if opt == "1":
            user = input("Enter Username: ")
            try:
                db["users"][user]
                print("Username is already taken!")
            except KeyError:
                password = getpass.getpass("Enter Password: ")
                pass_two = getpass.getpass("Confirm Password: ")
                if password != pass_two:
                    print("Passwords don't match!")
                else:
                    all_perms = ["revoke_tokens"]
                    new_user_perms = []
                    for perm in all_perms:
                        if get_input("Give {} the permission {}? [y/N] ".format(user, perm), ["y", "n"], "n") == "y":
                            new_user_perms.append(perm)
                    user_type = get_input("Should the user: Send computer data, View computer data, or Both? [s/v/b]", ["s", "v", "b"])
                    if user_type in ["s", "b"]:
                        new_user_perms.append("computer_user")
                    if user_type in ["v", "b"]:
                        new_user_perms.append("client_user")
                    db["users"][user.lower()] = {"password": bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode("utf-8"), "permissions": new_user_perms}
        elif opt == "2":
            print("\n\n")
            c = 0
            for user in db["users"].keys():
                print("{c} - {u}".format(c=c, u=user))
                c += 1
            to_del = input("E to exit, or the number to delete the specified user: ")
            if to_del.lower() != "e":
                try:
                    to_del = int(to_del)
                    del db["users"][list(db["users"].keys())[to_del]]
                except ValueError:
                    print("NaN!")
        elif opt == "3":
            print("\n\n")
            c = 0
            for user in db["users"].keys():
                print("{c} - {u}".format(c=c, u=user))
                c += 1
            pass_user = input("E to exit, or the number to change that user's password: ")
            if pass_user.lower() != "e":
                try:
                    pass_user = int(pass_user)
                    pass_user = list(db["users"].keys())[pass_user]
                    password = getpass.getpass("Enter New Password: ")
                    pass_two = getpass.getpass("Confirm New Password: ")
                    if password != pass_two:
                        print("Passwords don't match!")
                    else:
                        db["users"][pass_user]["password"] = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode("utf-8")
                except ValueError:
                    print("NaN!")
    return

if __name__ == "__main__":
    upgrade_db()
    o = None
    while o != "e":
        o = get_input("U - Manage users\ns - Manage settings\ne - Exit\n[U/s/e] ", ["u", "s", "e", "U", "S", "E"], "u").lower()
        if o == "u":
            user_manager()
        elif o == "s":
            settings_manager()
    print("Writing DB...")
    write_db()
    sys.exit(0)
