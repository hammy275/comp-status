
import React from "react";
import ComputerInfo from "./pages/ComputerInfo";

import { Route, Switch } from "react-router";

import axios from "axios";
import UserManager from "./pages/UserManager";
import TokenManager from "./pages/TokenManager";

class App extends React.Component {

    constructor(props) {
        super(props);

        this.checkAuth = this.checkAuth.bind(this);
        this.postWithAuth = this.postWithAuth.bind(this);
        this.getField = this.getField.bind(this);
        this.toggleDarkMode = this.toggleDarkMode.bind(this);
        this.handleCookieChange = this.handleCookieChange.bind(this);

        let useCookiesFromCookie = this.readCookie("useCookies") === "true";
        let isDark = this.readCookie("isDark") === "true";
        let ip = this.readCookie("ipAddress") ? this.readCookie("ipAddress") : "";
        let username = this.readCookie("username") ? this.readCookie("username") : "";
        let token = this.readCookie("token") ? this.readCookie("token") : "";
        let permaToken = this.readCookie("permaToken") ? this.readCookie("permaToken") : "";

        this.state = {
            ip: ip, username: username, password: "", token: token, permaToken: permaToken,
            isDark: isDark, useCookies: useCookiesFromCookie
        };
    }

    getField(field, value) {
        // Used for setting IP, username, and password from the field
        this.setState((state) => {
            state[field] = value;
            return state;
        })
    }

    setCookie(name, value, expires, bypassNoCookie) {
        let d = new Date();
        if (expires) {
            d.setTime(d.getTime() + expires);
        } else {
            d.setTime(d.getTime() + (1000 * 60 * 60 * 24));
        }
        document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/;SameSite=Strict`;
    }
    
    removeFromArray(array, item) {
        for (let i = 0; i < array.length; i++) {
            if (array[i] === item) {
                array.splice(i, 1);
            }
        }
        return array;
    }

    toggleDarkMode() {
        this.setCookie("isDark", (!this.state.isDark).toString(), 1000 * 60 * 60 * 24 * 36500, true);
        this.setState(function(state) {
            return {isDark: !state.isDark}
        });
    }
    
    removeFromArrayPartialMatch(array, item) {
        for (let i = 0; i < array.length; i++) {
            if (array[i].includes(item)) {
                array.splice(i, 1);
            }
        }
        return array;
    }
    
    delCookie(name) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }
    
    readCookie(name, def_value) {
        let cookieList = document.cookie.split(";");
        for (let i = 0; i < cookieList.length; i++) {
            if (cookieList[i].startsWith(`${name}=`)) {
                let toStart = `${name}=`.length;
                return cookieList[i].substring(toStart, cookieList[i].length);
            } else if (cookieList[i].startsWith(` ${name}=`)) {
                let toStart = ` ${name}=`.length;
                return cookieList[i].substring(toStart, cookieList[i].length);
            }
        }
        return def_value
    }

    handleCookieChange() {
        this.setState(function(state) {
            return {useCookies: !state.useCookies}
        });
        this.setCookie("useCookies", (!this.state.useCookies).toString(), 1000*60*60*24*36500);
        if (this.state.useCookies) {
            this.delCookie("ipAddress");
            this.delCookie("username");
            this.delCookie("token");
            this.delCookie("permaToken");
        }
    }
    
    checkAuth(returned) {
        if (returned["message"] === "Generated perma-token!") {
            this.setState({permaToken: returned["token"], statusHeroType: "is-info", statusInfo: "Authenticating..."});
            if (this.state.useCookies) {
                this.setCookie("permaToken", this.state.permaToken, 1000*60*60*24*36500);
                this.setCookie("ipAddress", this.state.ip, 1000*60*60*24*36500);
                this.setCookie("username", this.state.username, 1000*60*60*24*36500);
            }
            return "retry";
        } else if (returned["message"] === "Generated temporary-token!") {
            this.setState({token: returned["token"], permissions: returned["permissions"], statusHeroType: "is-info", statusInfo: "Fetching Data..."});
            if (this.state.useCookies) {
                this.setCookie("token", this.state.token);
                this.setCookie("canToken", this.state.permissions.includes("revoke_tokens").toString());
                this.setCookie("canManageUsers", this.state.permissions.includes("manage_users").toString());
            }
            return "retry";
        } else if (returned["message"].includes("uccess")) {
            this.setState({haveGoodData: true, statusHeroType: "is-success", statusInfo: returned["message"], failCount: 0});
            return "success";
        } else if (returned["message"].includes("Unauthorized")) {
            this.setState({token: null, haveGoodData: false});
            this.setState((state, props) => ({failCount: state.failCount + 1}));
            this.delCookie("token");
            this.setState({haveGoodData: false, statusHeroType: "is-danger",
            statusInfo: "Invalid username/password!"});
            if (this.state.failCount >= 3) {
                this.setState({permaToken: null, failCount: 0});
            }
            return "fail";
        } else if (returned["message"] === "No permission!") {
            this.setState({token: null, permaToken: null, statusInfo: "User account does not have permission to perform the requested action!", statusHeroType: "is-danger"});
            this.delCookie("token");
            this.delCookie("permaToken");
            return "fail";
        } else if (returned["error"] !== 200) {
            this.setState({haveGoodData: false, statusHeroType: "is-danger", token: null,
            statusInfo: "Error while contacting provided address! Maybe the server is down, or your browser doesn't trust the cert!"
        });
            return "fail";
        } else if (returned["message"] === "Token expired!") {
            this.setState({token: null});
            this.delCookie("token");
            return "retry";
        } else if (returned["message"] && returned["error"] === 200) {
            return "success";
        }
        return "fail";
    }
    
    async postWithAuth(url, data) {
        let authData;
        if (!this.state.permaToken) {
            authData = {"user": this.state.username, "password": this.state.password, "auth": "password"};
        } else if (!this.state.token) {
            authData = {"user": this.state.username, "token": this.state.permaToken, "auth": "perma_token"};
        }
        else {
            authData = {"token": this.state.token, "auth": "temp_token"};
        }
        let resp, status;
        let toSend = Object.assign({}, authData, data);
        while (!status || status === "retry") {
            try {
                resp = await axios.post(url, toSend);
                status = this.checkAuth(resp.data);
            } catch (error) {
                if (error.response) {
                    status = this.checkAuth(error.response.data);
                } else {
                    return null;
                }
                
            }
        }
        if (status === "success") return resp.data;
        return null;
    }

    render() {
        let textColor;
        let backgroundColor;
        let backgroundStyle;
        let buttonTextColor;
        if (this.state.isDark) {
            textColor = "#7f7f7f";
            backgroundColor = "#363636";
            backgroundStyle = "has-background-dark";
            buttonTextColor = backgroundColor;
        } else {
            textColor = "#000000";
            backgroundColor = "#ffffff";
            backgroundStyle = "has-background-white";
            buttonTextColor = backgroundColor;
        }
        document.body.style.className = backgroundStyle;
        document.getElementById("html").setAttribute("class", backgroundStyle);

        return(
        <Switch>
            <Route path="/gui_users">
                <UserManager buttonTextColor={buttonTextColor} textColor={textColor} backgroundColor={backgroundColor}
                removeFromArray={this.removeFromArray} postWithAuth={this.postWithAuth} ip={this.state.ip}/>
            </Route>
            <Route path="/gui_tokens">
                <TokenManager buttonTextColor={buttonTextColor} textColor={textColor} backgroundColor={backgroundColor}
                removeFromArray={this.removeFromArray} removeFromArrayPartialMatch={this.removeFromArrayPartialMatch}
                postWithAuth={this.postWithAuth} ip={this.state.ip}/>
            </Route>
            <Route path="/">
                <ComputerInfo delCookie={this.delCookie} removeFromArray={this.removeFromArray} removeFromArrayPartialMatch={this.removeFromArrayPartialMatch}
                readCookie={this.readCookie} setCookie={this.setCookie} postWithAuth={this.postWithAuth} getField={this.getField}
                ip={this.state.ip} username={this.state.username} password={this.state.password}
                isDark={this.state.isDark} toggleDarkMode={this.toggleDarkMode} useCookies={this.state.useCookies} toggleCookies={this.handleCookieChange}
                textColor={textColor} backgroundColor={backgroundColor} backgroundStyle={backgroundStyle} buttonTextColor={buttonTextColor}/>;
            </Route>
        </Switch>);
    }
}

export default App;