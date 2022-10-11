
import React from "react";
import ComputerInfo from "./pages/ComputerInfo";

import { Route, Routes } from "react-router";

import axios from "axios";
import UserManager from "./pages/UserManager";
import TokenManager from "./pages/TokenManager";
import NavBar from "./components/NavBar";
import Login from "./pages/Login";
import SmallHero from "./components/SmallHero";
import FirstTimeSetup from "./pages/FirstTimeSetup";

class App extends React.Component {

    constructor(props) {
        super(props);

        this.checkAuth = this.checkAuth.bind(this);
        this.postWithAuth = this.postWithAuth.bind(this);
        this.getField = this.getField.bind(this);
        this.toggleDarkMode = this.toggleDarkMode.bind(this);
        this.handleCookieChange = this.handleCookieChange.bind(this);
        this.toggleUseIP = this.toggleUseIP.bind(this);
        this.attemptLogin = this.attemptLogin.bind(this);
        this.logout = this.logout.bind(this);

        let useCookiesFromCookie = this.readCookie("useCookies") === "true";
        let isDark = this.readCookie("isDark") === "true";
        let ip = this.readCookie("ipAddress") ? this.readCookie("ipAddress") : "";
        let username = this.readCookie("username") ? this.readCookie("username") : "";
        let token = this.readCookie("token") ? this.readCookie("token") : "";
        let permaToken = this.readCookie("permaToken") ? this.readCookie("permaToken") : "";
        let permissions = this.readCookie("permissions") ? this.readCookie("permissions").split(",") : "";

        let useCustomIP = ip !== "";
        let loggedIn = token !== "";
        let statusInfo = loggedIn ? "Logged in!" : "Waiting for login"
        let statusHeroType = loggedIn ? "is-success" : "is-info";

        this.state = {
            ip: ip, username: username, password: "", token: token, permaToken: permaToken,
            isDark: isDark, useCookies: useCookiesFromCookie, statusInfo: statusInfo, statusHeroType: statusHeroType,
            useCustomIP: useCustomIP, loggedIn: loggedIn, permissions: permissions
        };
    }

    getField(field, value) {
        // Used for setting IP, username, and password from the field
        this.setState((state) => {
            state[field] = value;

            if (field === "username") {
                this.setCookie("username", value, 1000 * 60 * 60 * 24 * 365);
            } else if (field === "ip" && state.useCustomIP) {
                this.setCookie("ipAddress", state.ip, 1000 * 60 * 60 * 24 * 365);
            }

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
    
    checkAuth(returned, status) {
        if (status !== 200) {
            if (returned.message === undefined) {

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
                this.setState({statusInfo: "User account does not have permission to perform the requested action!", statusHeroType: "is-danger"});
                return "fail";
            } else if (returned["message"] === "Token expired!") {
                this.setState({token: null});
                this.delCookie("token");
                return "retry";
            } else if (returned["message"] && status === 200) {
                return "success";
            }
            this.setState({haveGoodData: false, statusHeroType: "is-danger", token: null,
            statusInfo: "Error while contacting provided address! Maybe the server is down, or your browser doesn't trust the cert!"
        });
            return "fail";
        } else if (returned["message"] === "Generated perma-token!") {
            this.setState({permaToken: returned["token"], statusHeroType: "is-info", statusInfo: "Authenticating..."});
            if (this.state.useCookies) {
                this.setCookie("permaToken", this.state.permaToken, 1000*60*60*24*36500);
                this.setCookie("ipAddress", this.state.ip, 1000*60*60*24*36500);
                this.setCookie("username", this.state.username, 1000*60*60*24*36500);
            }
            return "retry";
        } else if (returned["message"] === "Generated temporary-token!") {
            this.setState({token: returned["token"], permissions: returned["permissions"], statusHeroType: "is-success", statusInfo: "Logged in!"});
            if (this.state.useCookies) {
                this.setCookie("token", this.state.token);
                this.setCookie("permissions", this.state.permissions.join(","));
            }
            return "retry";
        } else if (returned["message"].includes("uccess")) {
            this.setState({haveGoodData: true, statusHeroType: "is-success", statusInfo: returned["message"], failCount: 0});
            return "success";
        } else if (returned["message"] === "Pong!") {
            return "success";
        }
    }
    
    async postWithAuth(url, data, handlingLogin) {
        if (!this.state.loggedIn && !handlingLogin) {
            return null;
        }
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
        try {
            resp = await axios.post(url, toSend);
            status = this.checkAuth(resp.data, resp.status);
        } catch (error) {
            if (error.response) {
                status = this.checkAuth(error.response.data);
            } else {
                return handlingLogin ? "fail" : null;
            }
            
        }
        if (handlingLogin) {
            return status;
        }
        if (status === "success") return resp.data;
        return null;
    }

    toggleUseIP() {
        this.setState((state) => {
            state.useCustomIP = !state.useCustomIP;
            if (state.useCustomIP) {
                this.setCookie("ipAddress", state.ip, 1000 * 60 * 60 * 24 * 365);
            } else {
                this.setCookie("ip", "", 1000 * 60 * 60 * 24 * 365);
            }
            return state;
        });
    }

    async attemptLogin() {
        let ip = this.state.ip;
        this.setState({statusHeroType: "is-info", statusInfo: "Logging in..."})
        if (!this.state.useCustomIP) {
            ip = "";
        } else {
            ip = "https://" + ip;
        }
        let res = "retry";
        while (res === "retry") {
            res = await this.postWithAuth(ip + "/api/ping", {}, true);
        }
        this.setState({loggedIn: res === "success"});
    }

    logout() {
        this.setState({loggedIn: false, permaToken: "", token: "", statusHeroType: "is-info", statusInfo: "Logged out!", permissions: []});
        this.delCookie("token");
        this.delCookie("permaToken");
    }

    render() {
        let textColor;
        let backgroundColor;
        let backgroundStyle;
        let buttonTextColor;
        let ip = this.state.ip;
        if (!this.state.useCustomIP) {
            ip = "";
        } else {
            ip = "https://" + ip;
        }
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
            <>
            <NavBar textColor={textColor} backgroundColor={backgroundColor} permissions={this.state.permissions}/>
            <Routes>
                <Route path="/gui_users" element={
                    <UserManager buttonTextColor={buttonTextColor} textColor={textColor} backgroundColor={backgroundColor}
                    removeFromArray={this.removeFromArray} postWithAuth={this.postWithAuth} ip={ip}/>}
                />
                <Route path="/gui_tokens" element={
                    <TokenManager buttonTextColor={buttonTextColor} textColor={textColor} backgroundColor={backgroundColor}
                    removeFromArray={this.removeFromArray} removeFromArrayPartialMatch={this.removeFromArrayPartialMatch}
                    postWithAuth={this.postWithAuth} ip={ip}/>}
                />
                <Route path="/" element={
                    <ComputerInfo removeFromArray={this.removeFromArray} removeFromArrayPartialMatch={this.removeFromArrayPartialMatch}
                    postWithAuth={this.postWithAuth} ip={ip} isDark={this.state.isDark}
                    textColor={textColor} backgroundColor={backgroundColor} backgroundStyle={backgroundStyle} buttonTextColor={buttonTextColor}/>}
                />
                <Route path="/login" element={
                    <Login ip={this.state.ip} username={this.state.username} password={this.state.password} backgroundColor={backgroundColor}
                    textColor={textColor} buttonTextColor={buttonTextColor} getField={this.getField} toggleCookies={this.handleCookieChange}
                    toggleDarkMode={this.toggleDarkMode} useCookies={this.state.useCookies} toggleUseIP={this.toggleUseIP}
                    useIP={this.state.useCustomIP} loggedIn={this.state.loggedIn} handleLogin={this.attemptLogin}
                    handleLogout={this.logout}/>
                }/>
                <Route path="/fts" element={
                    <FirstTimeSetup textColor={textColor} buttonTextColor={buttonTextColor} backgroundColor={backgroundColor}
                    ip={ip} postWithAuth={this.postWithAuth}/>
                }/>
            </Routes>
            <br/>
            <br/>
            <br/>
            <div className="columns">
                <div className="column is-one-third">
                    <SmallHero isVisible={true} heroType={this.state.statusHeroType} textColor={buttonTextColor} text={this.state.statusInfo}/>
                </div>
            </div>
            
        </>);
    }
}

export default App;