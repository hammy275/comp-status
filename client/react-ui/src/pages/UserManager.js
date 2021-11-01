import React from "react";

import Button from "../components/Button";
import CheckboxLabel from "../components/CheckboxLabel";
import DropdownButton from "../components/DropdownButton";
import InputButton from "../components/InputButton";
import InputField from "../components/InputField";

class UserManager extends React.Component {
    /**
     * Props:
     *  buttonTextColor: Text color for buttons
     *  textColor: Color of text
     *  backgroundColor: Background color
     *  removeFromArray: Function to remove from array
     *  postWithAuth: Function to post with authentication
     *  ip: IP address
     */
    constructor(props) {
        super(props);
        this.state = {firstRefresh: false, newUserPassword: "", newUserPermissions: [], userList: [], selectedUser: ""};

        this.handleNewUserP = this.handleNewUserP.bind(this);
        this.refreshUsers = this.refreshUsers.bind(this);
        this.addUser = this.addUser.bind(this);
        this.deleteUser = this.deleteUser.bind(this);
    }

    async refreshUsers() {
        const returned = await this.props.postWithAuth("https://" + this.props.ip + "/list_users", {});
        if (returned === null) return;
        this.setState({userList: Object.keys(returned["users"])});
    }

    handleNewUserP(permission) {
        let perms = this.state["newUserPermissions"];
        if (perms.includes(permission)) {
            perms.splice(perms.indexOf(permission), 1);
        } else {
            perms.push(permission);
        }
        this.setState({newUserPermissions: perms});
    }

    async addUser(new_user) {
        const returned = await this.props.postWithAuth("https://" + this.props.ip + "/add_user", {"user_to_add": new_user, "password_of_user": this.state["newUserPassword"], permissions: this.state["newUserPermissions"]});
        if (returned === null) return;
        let heroType = "is-danger";
        if (returned["message"] === "User successfully added!") {
            heroType = "is-success"
        }
        this.setState({statusInfo: returned["message"], statusHeroType: heroType});
    }

    async deleteUser(user) {
        if (user) {
            this.setState({selectedUser: user});
            const returned = await this.props.postWithAuth("https://" + this.props.ip + "/delete_user", {"user_to_delete": user});
            if (returned === null) return;
            this.setState({statusHeroType: "is-success", statusInfo: returned["message"], selectedUser: null, userList: this.props.removeFromArray(this.state.userList, this.state.selectedUser)});
        }
    }

    render() {
        if (!this.state.firstRefresh) {
            this.refreshUsers();
            this.setState({firstRefresh: true});
        }

        let userList = ["Select a user..."]
        userList = userList.concat(this.state.userList);

        return (
            <>
                <Button textColor={this.props.buttonTextColor} 
                handleClick={this.refreshUsers} value={"Refresh User List"} buttonType="is-success"/>
                <br/>
                <DropdownButton 
                    items={userList} textColor={this.props.textColor} bgColor={this.props.backgroundColor}
                    buttonTextColor={this.props.buttonTextColor} handleClick={this.deleteUser} buttonLabel="Delete Selected User"
                />
                <br/><br/><br/>
                <label className="label" style={{color: this.props.textColor}}>Add Users:</label>,
                <InputButton textColor={this.props.textColor} bgColor={this.props.backgroundColor} buttonTextColor={this.props.buttonTextColor} label="New User's Username: " buttonLabel="Add User" type="text"
                handleClick={this.addUser}/>,
                <InputField value={this.state.newUserPassword} bgColor={this.props.backgroundColor} textColor={this.props.textColor} handleChange={(event) => this.setState({newUserPassword: event.target.value})} inputText=" New User's Password: " type="password"/>
                <CheckboxLabel textColor={this.props.textColor} label="New User can Manage Users: " handleChange={() => this.handleNewUserP("manage_users")}/>
                <CheckboxLabel textColor={this.props.textColor} label="New User can Revoke Tokens " handleChange={() => this.handleNewUserP("revoke_tokens")}/>
                <CheckboxLabel textColor={this.props.textColor} label="New User can See Computer Info: " handleChange={() => this.handleNewUserP("client_user")}/>
                <CheckboxLabel textColor={this.props.textColor} label="New User can Send Computer Info: " handleChange={() => this.handleNewUserP("computer_user")}/>
            </>
        );
    }
}

export default UserManager;