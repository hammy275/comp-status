import React from "react";

import Button from "../components/Button";
import CheckboxLabel from "../components/CheckboxLabel";
import InputField from "../components/InputField";

class Login extends React.Component {
    /**
     * Props:
     *  ip: IP address
     *  username: Username
     *  password: Password (from state)
     *  backgroundColor: Background color
     *  textColor: Text color
     *  buttonTextColor: Text color for buttons
     *  useCookies: If saving cookies or not
     *  useIP: If using a custom IP or not
     *  loggedIn: If logged in or not
     *  
     *  getField: Function for getting data from a field
     *  toggleCookies: Toggle cookies function
     *  toggleDarkMode: Toggle dark mode function
     *  toggleUseIP: Toggle using custom IP
     *  handleLogin: Handle login function
     *  handleLogout: Handle logout function
     */

    constructor(props) {
        super(props);
        this.getIPBox = this.getIPBox.bind(this);
        this.getCustomIPCheck = this.getCustomIPCheck.bind(this);
        this.getLoggedOut = this.getLoggedOut.bind(this);
        this.getLoggedIn = this.getLoggedIn.bind(this);
    }
    
    getIPBox() {
        if (this.props.useIP) {
            return <InputField value={this.props.ip} bgColor={this.props.backgroundColor} textColor={this.props.textColor} handleChange={(event) => this.props.getField("ip", event.target.value)} inputText="IP Address: " type="text"/>
        }
    }

    getCustomIPCheck() {
        if (!this.props.loggedIn) {
            return <CheckboxLabel label="Use Custom IP " textColor={this.props.textColor} handleChange={this.props.toggleUseIP} checked={this.props.useIP}/>;
        }
    }

    getLoggedOut() {
        return (
            <>
                {this.getIPBox()}
                <InputField value={this.props.username} bgColor={this.props.backgroundColor} textColor={this.props.textColor} handleChange={(event) => this.props.getField("username", event.target.value)} inputText="Username: " type="text"/>
                <InputField value={this.props.password} bgColor={this.props.backgroundColor} textColor={this.props.textColor} handleChange={(event) => this.props.getField("password", event.target.value)} inputText="Password: " type="password"/>
                <Button buttonType="is-info" textColor={this.props.buttonTextColor} handleClick={this.props.handleLogin} value="Login"/>
            </>
        );    
    }

    getLoggedIn() {
        return (
            <>
                <Button buttonType="is-info" textColor={this.props.buttonTextColor} handleClick={this.props.handleLogout} value="Logout"/>
            </>
        );
    }


    render() {
        return (
            <div className="columns">
                    <div className="column is-one-fourth">
                        {this.props.loggedIn ? this.getLoggedIn() : this.getLoggedOut()}
                    </div>
                    <div className="column is-one-fourth">
                        <Button textColor={this.props.buttonTextColor} handleClick={this.props.toggleCookies} value="Save Information in Cookies" buttonType={this.props.useCookies ? "is-success" : "is-danger"}/>
                        <br/>
                        <br/>
                        <Button textColor={this.props.buttonTextColor} handleClick={this.props.toggleDarkMode} value="Toggle Dark Mode" buttonType="is-info"/>
                        <br/>
                        <br/>
                        {this.getCustomIPCheck()}
                    </div>
            </div>
        );
    }
}


export default Login;