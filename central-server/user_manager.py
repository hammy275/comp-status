#!/usr/bin/python3

import json
import getpass
import sys
import bcrypt

try:
    with open("users.json") as f:
        users = json.load(f)
except (json.decoder.JSONDecodeError, FileNotFoundError):
    users = {}


def write_db():
    """Write DB to File."""
    with open("users.json", "w") as dbf:
        json.dump(users, dbf)
    print("Database successfully written!")


def get_input(question, options, default=None):
    ans = None
    while ans is None or ans not in options:
        ans = input(question)
        if default is not None and ans == "":
            ans = default
    return ans


def main():
    opt = "-1"
    while opt != "0" and opt.lower() != "e":
        opt = get_input("1 - Add User\n2 - Remove/List User(s)\n3 - Change Password of User\n0/e - Exit\n", ["1", "2", "3", "0", "e", "E"])
        if opt == "1":
            user = input("Enter Username: ")
            try:
                users[user]
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
                    users.update({user: {"password": bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode("utf-8"), "permissions": new_user_perms}})
        elif opt == "2":
            print("\n\n")
            c = 0
            for user in users.keys():
                print("{c} - {u}".format(c=c, u=user))
                c += 1
            to_del = input("E to exit, or the number to delete the specified user: ")
            if to_del.lower() != "e":
                try:
                    to_del = int(to_del)
                    del users[list(users.keys())[to_del]]
                except ValueError:
                    print("NaN!")
        elif opt == "3":
            print("\n\n")
            c = 0
            for user in users.keys():
                print("{c} - {u}".format(c=c, u=user))
                c += 1
            pass_user = input("E to exit, or the number to change that user's password: ")
            if pass_user.lower() != "e":
                try:
                    pass_user = int(pass_user)
                    pass_user = list(users.keys())[pass_user]
                    password = getpass.getpass("Enter New Password: ")
                    pass_two = getpass.getpass("Confirm New Password: ")
                    if password != pass_two:
                        print("Passwords don't match!")
                    else:
                        users[pass_user]["password"] = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode("utf-8")
                except ValueError:
                    print("NaN!")


    print("Writing DB...")
    write_db()
    sys.exit(0)

if __name__ == "__main__":
    main()