import React from "react";

import Button from "../components/Button";
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
     *  
     *  getField: Function for getting data from a field
     *  toggleCookies: Toggle cookies function
     *  toggleDarkMode: Toggle dark mode function
     */


    render() {
        return (
            <div className="columns">
                    <div className="column is-one-third">
                        <InputField value={this.props.ip} bgColor={this.props.backgroundColor} textColor={this.props.textColor} handleChange={(event) => this.props.getField("ip", event.target.value)} inputText="IP Address: " type="text"/>
                        <InputField value={this.props.username} bgColor={this.props.backgroundColor} textColor={this.props.textColor} handleChange={(event) => this.props.getField("username", event.target.value)} inputText="Username: " type="text"/>
                        <InputField value={this.props.password} bgColor={this.props.backgroundColor} textColor={this.props.textColor} handleChange={(event) => this.props.getField("password", event.target.value)} inputText="Password: " type="password"/>
                        <br/>
                        <br/>
                        <Button textColor={this.props.buttonTextColor} handleClick={this.props.toggleCookies} value="Save Information in Cookies" buttonType={this.props.useCookies ? "is-success" : "is-danger"}/>
                        <br/>
                        <br/>
                        <Button textColor={this.props.buttonTextColor} handleClick={this.props.toggleDarkMode} value="Toggle Dark Mode" buttonType="is-info"/>
                    </div>
            </div>
        );
    }
}


export default Login;