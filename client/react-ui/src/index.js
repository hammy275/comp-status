import React from 'react'
import ReactDOM from 'react-dom'

function removeFromArray(array, item) {
    for (let i = 0; i < array.length; i++) {
        if (array[i] === item) {
            array.splice(i, 1);
        }
    }
    return array;
}

function removeFromArrayPartialMatch(array, item) {
    for (let i = 0; i < array.length; i++) {
        if (array[i].includes(item)) {
            array.splice(i, 1);
        }
    }
    return array;
}

function setCookie(name, value, expires, bypassNoCookie) {
    let d = new Date();
    if (expires) {
        d.setTime(d.getTime() + expires);
    } else {
        d.setTime(d.getTime() + (1000 * 60 * 60 * 24));
    }
    document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/;SameSite=Strict`;
}

function delCookie(name) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

function readCookie(name, def_value) {
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

class Button extends React.Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }
    handleClick(event) {
        this.props.handleClick();
    }
    render() {
        return (
            <button style={{color: this.props.textColor}} onClick={this.handleClick} className={"button " + this.props.buttonType}>{this.props.value}</button>
        );
    }
}

class InputField extends React.Component {
    /** 
     * Params:
     *  handleChange - Function to run on text change.
     *  value (optional) - Text to put in field
     *  textColor - Text color
     *  bgColor - Background color
     *  inputText - Label for text box
     *  type - Type of input ("text", "password", etc.)
    */
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
    }
    handleChange(event) {
        this.props.handleChange(event.target.value);
    }
    render() {
        let value = "";
        if (this.props.value) {
            value = this.props.value;
        }
        return (
            <form onSubmit={(event) => event.preventDefault()}>
                <label className="label" style={{color: this.props.textColor}}>
                    {this.props.inputText}
                    <input value={value} style={{backgroundColor: this.props.bgColor, color: this.props.textColor}} className="input" type={this.props.type} onChange={this.handleChange} />
                </label>
            </form>
        )
    }
}

class Dropdown extends React.Component {
    render() {
        let items = this.props.items;
        return (
            <span className="select">
                <select onChange={this.props.handleChange} className="select">
                {items.map((item) =>
                <option key={item}>{item}</option>
                )}
            </select>
            </span>
        );
    }
}

class SmallHero extends React.Component {
    render() {
        if (!this.props.isVisible) {
            return null;
        }
        return (
            <section className={"hero is-small " + this.props.heroType}>
                <div className="hero-body">
                    <p className="title" style={{color: this.props.textColor}}>
                        {this.props.text}
                    </p>
                </div>
            </section>
        );
    }
}


class SettingManager extends React.Component {
    /**
     * Props:
     *  showManager - Whether or not to show
     *  hasPermission - Whether or not user has permission for this setting
     *  textColor - Color for text
     *  bgColor - Background color
     *  buttonTextColor - Color for button text
     *  elemType - String of the type of thing being managed; "Token", "User", etc.
     *  refreshFunction - Function used to refresh lists 
     *  elems - Elements to have inside the manager
     */
    render() {
        if (!this.props.showManager) {
            return null;
        } else if (!this.props.hasPermission) {
            return (
                <SmallHero isVisible="true" heroType="is-danger" textColor={this.props.textColor} text="Your user account does not have permission to adjust this setting!"/>
            );
        } else {
            let elems = [
                <Button textColor={this.props.buttonTextColor} handleClick={this.props.refreshFunction} value={"Refresh " + this.props.elemType + " List"} buttonType="is-success"/>,
                <br/>
            ]
            let all_elems = elems.concat(this.props.elems)
           return (all_elems);
        }
    }
}

class DropdownButton extends React.Component {
    /**
     * Props:
     *  handleChange - Function called when dropdown is changed
     *  items - List of items for dropdown
     *  textColor - Text color
     *  bgColor - Background color
     *  buttonTextColor - Color for button text
     *  handleClick - Function to call when button is clicked
     *  buttonLabel - Label for button next to dropdown
     */
    render() {
        let elems = [];
        elems.push(<Dropdown handleChange={this.props.handleChange} items={this.props.items} textColor={this.props.textColor} bgColor={this.props.bgColor}/>)
        elems.push(<Button textColor={this.props.buttonTextColor} handleClick={this.props.handleClick} value={this.props.buttonLabel} buttonType="is-danger"/>)
        return(elems);
    }
}

class InputButton extends React.Component {
    /**
     * Props:
     *  textColor - Text color
     *  bgColor - Background color
     *  buttonTextColor - Color for button text
     *  label - Label for text box
     *  buttonLabel - Label for button
     *  handleClick - Function to handle button click. Must accept a string, which contains the value in the textbox
     *  type - Text type
     */
    constructor(props) {
        super(props);
        this.state = {value: ""};
    }
    render() {
        let elems = [];
        elems.push(<InputField value={this.state["value"]} textColor={this.props.textColor} bgColor={this.props.bgColor} inputText={this.props.label} type={this.props.type} handleChange={(value) => this.setState({value: value})}/>);
        elems.push(<Button textColor={this.props.buttonTextColor} handleClick={() => this.props.handleClick(this.state["value"])} value={this.props.buttonLabel} buttonType="is-success"/>);
        return(elems);
    }
}

class Checkbox extends React.Component {
    render() {
        return (
            <input type="checkbox" onChange={(event) => this.props.handleChange(event.target.checked)}/>
        );
    }
}

class CheckboxLabel extends React.Component {
    render() {
        return (
            <label className="label" style={{color: this.props.textColor}}>
                {this.props.label}
                <Checkbox handleChange={this.props.handleChange}/>
            </label>
        );
    }
}


class ComputerInfo extends React.Component {
    constructor(props) {
        super(props);
        let useCookiesFromCookie = readCookie("useCookies") === "true";
        let isDark = readCookie("isDark") === "true";
        let ip = readCookie("ipAddress") ? readCookie("ipAddress") : "";
        let username = readCookie("username") ? readCookie("username") : "";
        let token = readCookie("token") ? readCookie("token") : "";
        let permaToken = readCookie("permaToken") ? readCookie("permaToken") : "";
        this.state = {ip: ip, username: username, password: "", isDark: isDark, useCookies: useCookiesFromCookie, token: token,
        permaToken: permaToken, computerData: {}, haveGoodData: false, selectedComputer: null, statusInfo: "Waiting for data...",
        statusHeroType: "is-info", showTokenManager: false, selectedPermaToken: null, selectedTempToken: null, permissions: [],
        tempTokens: [], permaTokens: [], failCount: 0, showUserManager: false, userList: [], selectedUser: null, newUserPermissions: [],
        newUserPassword: ""};

        this.getIP = this.getIP.bind(this);
        this.getUsername = this.getUsername.bind(this);
        this.getPassword = this.getPassword.bind(this);
        this.handleCookieChange = this.handleCookieChange.bind(this);
        this.toggleDarkMode = this.toggleDarkMode.bind(this);
        this.confirmAuth = this.confirmAuth.bind(this);
        this.postWithAuth = this.postWithAuth.bind(this);
        this.endGetComputerData = this.endGetComputerData.bind(this);
        this.setComputer = this.setComputer.bind(this);
        this.tempTokenHandle = this.tempTokenHandle.bind(this);
        this.permaTokenHandle = this.permaTokenHandle.bind(this);
        this.handleTokenRequest = this.handleTokenRequest.bind(this);
        this.refreshTokens = this.refreshTokens.bind(this);
        this.deletePermaToken = this.deletePermaToken.bind(this);
        this.deleteTempToken = this.deleteTempToken.bind(this);
        this.afterTokenDelete = this.afterTokenDelete.bind(this);
        this.handleUserList = this.handleUserList.bind(this);
        this.refreshUsers = this.refreshUsers.bind(this);
        this.userHandle = this.userHandle.bind(this);
        this.deleteUser = this.deleteUser.bind(this);
        this.afterUserDelete = this.afterUserDelete.bind(this);
        this.handleNewUserP = this.handleNewUserP.bind(this);
        this.addUser = this.addUser.bind(this);
        this.handleAddUser = this.handleAddUser.bind(this);

        this.postWithAuth("https://" + this.state.ip + "/give_data", {}, this.endGetComputerData);
    }

    componentDidMount() {
        setInterval(() => this.postWithAuth("https://" + this.state.ip + "/give_data", {}, this.endGetComputerData), 5000);
    }

    // BEGIN BACKEND LOGIC

    httpPost(url, data) {
        // Get ready to send HTTP POST request, and define a function to run when sent.
        return new Promise(function (resolve) {
            let xhr = new XMLHttpRequest();
            xhr.open("POST", url, true);
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.onreadystatechange = function () { // Call a function when the state changes.
                if (this.readyState === XMLHttpRequest.DONE ) {
                    if (this.status === 200 || this.status === 401) {
                        let returned = JSON.parse(xhr.response);
                        returned["error"] = this.status;
                        resolve(returned);
                    } else {
                        resolve({"error": this.status, "message": "Error while contacting provided address! " +
                                "Maybe the server is down, or your browser doesn't trust the cert!"})
                    }
                }
            };
            xhr.send(JSON.stringify(data));
        })
    }

    confirmAuth(returned, url, data, endFunction) {
        if (returned["message"] === "Generated perma-token!") {
            this.setState({permaToken: returned["token"]});
            if (this.state.useCookies) {
                setCookie("permaToken", this.state.permaToken, 1000*60*60*24*36500);
                setCookie("ipAddress", this.state.ip, 1000*60*60*24*36500);
                setCookie("username", this.state.username, 1000*60*60*24*36500);
            }
            this.postWithAuth(url, data, endFunction);
        } else if (returned["message"] === "Generated temporary-token!") {
            this.setState({token: returned["token"], permissions: returned["permissions"]});
            if (this.state.useCookies) {
                setCookie("token", this.state.token);
                setCookie("canToken", this.state.permissions.includes("revoke_tokens").toString());
                setCookie("canManageUsers", this.state.permissions.includes("manage_users").toString());
            }
            this.postWithAuth(url, data, endFunction)
        } else if (returned["message"].includes("uccess")) {
            this.setState({haveGoodData: true, statusHeroType: "is-success", statusInfo: returned["message"], failCount: 0});
            endFunction(returned);
        } else if (returned["message"].includes("Unauthorized")) {
            this.setState({token: null, haveGoodData: false});
            this.setState((state, props) => ({failCount: state.failCount + 1}));
            delCookie("token");
            this.setState({haveGoodData: false, statusHeroType: "is-danger",
            statusInfo: "Invalid username/password!"});
            if (this.state.failCount >= 3) {
                this.setState({permaToken: null, failCount: 0});
            }
        } else if (returned["message"] === "No permission!") {
            this.setState({token: null, permaToken: null, statusInfo: "User account does not have permission to perform the requested action!", statusHeroType: "is-danger"});
            delCookie("token");
            delCookie("permaToken");
        } else if (returned["error"] !== 200) {
            this.setState({haveGoodData: false, statusHeroType: "is-danger", token: null,
            statusInfo: "Error while contacting provided address! Maybe the server is down, or your browser doesn't trust the cert!"
        });
        } else if (returned["message"] === "Token expired!") {
            this.setState({token: null});
            delCookie("token");
            this.postWithAuth(url, data, endFunction);
        } else if (returned["message"] && returned["error"] === 200) {
            endFunction(returned);
        } 
    }
    
    postWithAuth(url, data, endFunction) {
        if (!this.state.permaToken) {
            let authData = {"user": this.state.username, "password": this.state.password, "auth": "password"};
            this.httpPost(url, authData).then(
                value => {this.confirmAuth(value, url, data, endFunction)}
            );
        } else if (!this.state.token) {
            let authData = {"user": this.state.username, "token": this.state.permaToken, "auth": "perma_token"};
            this.httpPost(url, authData).then(
                value => {this.confirmAuth(value, url, data, endFunction)}
            );
        }
        else {
            let authData = {"token": this.state.token, "auth": "temp_token"};
            this.httpPost(url, Object.assign({}, authData, data)).then(
                value => {this.confirmAuth(value, url, data, endFunction)}
            );
        }
    }

    endGetComputerData(returned) {
        this.setState({computerData: returned["data"], haveGoodData: true});
    }

    // END BACKEND LOGIC
    // BEGIN FRONTEND LOGIC

    getIP(ip) {
        this.setState({ip: ip});
        if (this.state.useCookies) {
            setCookie("ipAddress", ip, 1000*60*60*24*30);
        }
    }

    getUsername(username) {
        this.setState({username: username});
        if (this.state.useCookies) {
            setCookie("username", username, 1000*60*60*24*30);
        }
    }

    getPassword(password) {
        this.setState({password: password});
    }

    handleCookieChange() {
        this.setState(function(state) {
            return {useCookies: !state.useCookies}
        });
        setCookie("useCookies", (!this.state.useCookies).toString(), 1000*60*60*24*36500);
        if (this.state.useCookies) {
            delCookie("ipAddress");
            delCookie("username");
            delCookie("token");
            delCookie("permaToken");
        }
    }

    toggleDarkMode() {
        setCookie("isDark", (!this.state.isDark).toString(), 1000 * 60 * 60 * 24 * 36500, true);
        this.setState(function(state) {
            return {isDark: !state.isDark}
        });
    }

    setComputer(event) {
        this.setState({selectedComputer: event.target.value});
    }

    tempTokenHandle(event) {
        if (event.target.value !== "Select a temporary token...") {
            this.setState({selectedTempToken: event.target.value});
        }
    }

    permaTokenHandle(event) {
        if (event.target.value !== "Selecte a permanent token...") {
            this.setState({selectedPermaToken: event.target.value.substr(event.target.value.indexOf(":") + 2)});
        }
    }

    handleTokenRequest(returned) {
        let permaTokensList = [];
        // eslint-disable-next-line
        for (const [key, value] of Object.entries(returned["perma_tokens"])) {
            for (let i = 0; i < value.length; i++) {
                permaTokensList = permaTokensList.concat(key + ": " + value[i]);
            }
        }
        this.setState({permaTokens: permaTokensList, tempTokens: Object.keys(returned["temp_tokens"])});
    }

    handleUserList(returned) {
        this.setState({userList: Object.keys(returned["users"])});
    }

    refreshTokens() {
        this.postWithAuth("https://" + this.state.ip + "/get_tokens", {}, this.handleTokenRequest);
    }

    afterTokenDelete(returned) {
        let heroType = "is-success";
        if (returned["message"] !== "Perma-token deleted successfully!" && returned["message"] !== "Temp-token deleted successfully!") {
            heroType = "is-danger";
        } else {
            if (returned["message"] === "Perma-token deleted successfully!") {
                this.setState({permaTokens: removeFromArrayPartialMatch(this.state.permaTokens, this.state.selectedPermaToken)});
            } else {
                this.setState({tempTokens: removeFromArray(this.state.tempTokens, this.state.selectedTempToken)});
            }
        }
        this.setState({statusInfo: returned["message"], statusHeroType: heroType});
    }

    afterUserDelete(returned) {
        this.setState({statusHeroType: "is-success", statusInfo: returned["message"], selectedUser: null, userList: removeFromArray(this.state.userList, this.state.selectedUser)});
    }

    deleteTempToken() {
        this.postWithAuth("https://" + this.state.ip + "/delete_token", {"type": "temp", "token_to_delete": this.state.selectedTempToken}, this.afterTokenDelete);
    }

    deletePermaToken() {
        this.postWithAuth("https://" + this.state.ip + "/delete_token", {"type": "perma", "token_to_delete": this.state.selectedPermaToken}, this.afterTokenDelete);
    }

    deleteUser() {
        if (this.state.selectedUser) {
            this.postWithAuth("https://" + this.state.ip + "/delete_user", {"user_to_delete": this.state.selectedUser}, this.afterUserDelete);
        }
    }

    refreshUsers() {
        this.postWithAuth("https://" + this.state.ip + "/list_users", {}, this.handleUserList);
    }

    userHandle(event) {
        if (event.target.value !== "Select a user...") {
            this.setState({selectedUser: event.target.value});
        }
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

    addUser(new_user) {
        this.postWithAuth("https://" + this.state.ip + "/add_user", {"user_to_add": new_user, "password_of_user": this.state["newUserPassword"], permissions: this.state["newUserPermissions"]}, this.handleAddUser);
    }

    handleAddUser(returned) {
        let heroType = "is-danger";
        if (returned["message"] === "User successfully added!") {
            heroType = "is-success"
        }
        this.setState({statusInfo: returned["message"], statusHeroType: heroType});
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

        let showStatuses = false;
        let computers = ["Select a computer..."];
        let ramInfo = "";
        let cpuInfo = "";
        let cpuTemps = "";
        let cpuUsages = "";
        let turboInfo = "";
        let pcInfo = "";
        let pcHeroType = "is-success";
        let ramHeroType = "is-success";
        let cpuHeroType = "is-success";
        let cpuTempHeroType = "is-success";
        let cpuUsageHeroType = "is-success";
        let canToken = this.state.permissions.includes("revoke_tokens") || readCookie("canToken", "false") === "true";
        let canManageUsers = this.state.permissions.includes("manage_users") || readCookie("canManageUsers", "false") === "true";
        let tempTokens = ["Select a temporary token..."];
        let permaTokens = ["Select a permanent token..."];
        let userList = ["Select a user..."]
        if (this.state.haveGoodData) {
            computers = computers.concat(Object.keys(this.state.computerData));
            if (this.state.selectedComputer && this.state.selectedComputer !== "Select a computer...") {
                let cd = this.state.computerData[this.state.selectedComputer];
                let memUsage = (cd["used_memory"] / cd["current_memory"] * 100).toFixed(1);
                if (memUsage >= 70 && memUsage < 90) {
                   ramHeroType = "is-warning";
                } else if (memUsage >= 90) {
                    ramHeroType = "is-danger";
                }
                if (cd["cpu_usage"] >= 90 || cd["cpu_pack_temp"] >= 82) {
                    cpuHeroType = "is-danger";
                } else if (cd["cpu_usage"] >= 70 || cd["cpu_pack_temp"] >= 70) {
                    cpuHeroType = "is-warning";
                }
                if (cd["cpu_pack_temp"] >= 82) {
                    cpuTempHeroType = "is-danger";
                } else if (cd["cpu_pack_temp"] >= 70) {
                    cpuTempHeroType = "is-warning";
                }
                if (cd["cpu_usage"] >= 90) {
                    cpuUsageHeroType = "is-danger";
                } else if (cd["cpu_usage"] >= 70) {
                    cpuUsageHeroType = "is-warning";
                }   
                pcInfo = this.state.selectedComputer;
                showStatuses = true;
                cpuTemps = cd["cpu_temps"].split(",").join("°C, ") + "°C";
                cpuUsages = cd["cpu_usages"].split(",").join("%, ") + "%";
                ramInfo = `Memory: ${cd["used_memory"]} GB/${cd["current_memory"]} GB (${memUsage}% usage)`;
                cpuInfo = `CPU Stats: ${cd["cpu_usage"]}% Usage at ${cd["cpu_pack_temp"]}°C`;
                turboInfo = `Turbo: ${cd["current_turbo"]} GHz/${cd["max_turbo"]} GHz`;
                cpuTemps = `Individual CPU Temperatures: ${cpuTemps}`;
                cpuUsages = `Individual CPU Usages: ${cpuUsages}`;
                let timeDiff = Math.floor(Date.now() / 1000) - cd["time"];
                if (timeDiff <= 9) {
                    pcHeroType = "is-success";
                } else {
                    pcInfo = `${this.state.selectedComputer} (No response for ${timeDiff} seconds!):`;
                    if (timeDiff <= 59) {
                        pcHeroType = "is-warning";
                    } else {
                        pcHeroType = "is-danger";
                    }
                }
            }
            if (canToken) {
                tempTokens = tempTokens.concat(this.state.tempTokens);
                permaTokens = permaTokens.concat(this.state.permaTokens);
            } if (canManageUsers) {
                userList = userList.concat(this.state.userList);
            }

        }
        return (
            <div>
                <h1 style={{color: textColor}} className="title is-1">Computer Status Information</h1>
                <br/>
                <div className="columns">
                    <div className="column is-one-quarter">
                        <InputField value={this.state.ip} bgColor={backgroundColor} textColor={textColor} handleChange={this.getIP} inputText="IP Address: " type="text"/>
                        <InputField value={this.state.username} bgColor={backgroundColor} textColor={textColor} handleChange={this.getUsername} inputText="Username: " type="text"/>
                        <InputField value={this.state.password} bgColor={backgroundColor} textColor={textColor} handleChange={this.getPassword} inputText="Password: " type="password"/>
                        <br/>
                        <br/>
                        <Button textColor={buttonTextColor} handleClick={this.handleCookieChange} value="Save Information in Cookies" buttonType={this.state.useCookies ? "is-success" : "is-danger"}/>
                        <br/>
                        <br/>
                        <Button textColor={buttonTextColor} handleClick={this.toggleDarkMode} value="Toggle Dark Mode" buttonType="is-info"/>
                        <br/>
                        <br/>
                        <Dropdown handleChange={this.setComputer} items={computers} textColor={textColor} bgColor={backgroundColor}/>
                        <br/>
                        <br/>
                        <SmallHero isVisible={true} textColor={buttonTextColor} heroType={this.state.statusHeroType} text={this.state.statusInfo}/>
                    </div>

                    <div className="column">
                        <SmallHero isVisible={showStatuses} textColor={buttonTextColor} heroType={pcHeroType} text={pcInfo}/>
                        <SmallHero isVisible={showStatuses} textColor={buttonTextColor} heroType={ramHeroType} text={ramInfo}/>
                        <SmallHero isVisible={showStatuses} textColor={buttonTextColor} heroType={cpuHeroType} text={cpuInfo}/>
                        <SmallHero isVisible={showStatuses} textColor={buttonTextColor} heroType="is-success" text={turboInfo}/>
                        <SmallHero isVisible={showStatuses} textColor={buttonTextColor} heroType={cpuTempHeroType} text={cpuTemps}/>
                        <SmallHero isVisible={showStatuses} textColor={buttonTextColor} heroType={cpuUsageHeroType} text={cpuUsages}/>
                    </div>
                </div>
                <div className="columns">
                    <div className="column is-one-third">
                        <Button textColor={buttonTextColor} handleClick={() => this.setState({showTokenManager: !this.state.showTokenManager})} value="Show Token Manager" buttonType="is-info"/>
                        <br/>
                        <br/>
                        <SettingManager 
                            showManager={this.state.showTokenManager} hasPermission={canToken} textColor={textColor} bgColor={backgroundColor} buttonTextColor={buttonTextColor}
                            elemType="Token" refreshFunction={this.refreshTokens} elems={[
                                <DropdownButton 
                                    handleChange={this.tempTokenHandle} items={tempTokens} textColor={textColor} bgColor={backgroundColor} buttonTextColor={buttonTextColor}
                                    handleClick={this.deleteTempToken} buttonLabel="Delete Selected Temporary Token"
                                />,
                                <DropdownButton 
                                    handleChange={this.permaTokenHandle} items={permaTokens} textColor={textColor} bgColor={backgroundColor} buttonTextColor={buttonTextColor}
                                    handleClick={this.deletePermaToken} buttonLabel="Delete Selected Permanent Token"
                                />
                            ]}
                        />
                    </div>
                    <div className="column is-one-third">
                        <Button textColor={buttonTextColor} handleClick={() => this.setState({showUserManager: !this.state.showUserManager})} value="Show User Manager" buttonType="is-info"/>
                        <br/>
                        <br/>
                        <SettingManager
                            showManager={this.state.showUserManager} hasPermission={canManageUsers} textColor={textColor} bgColor={backgroundColor} buttonTextColor={buttonTextColor}
                            elemType="User" refreshFunction={this.refreshUsers} elems={[
                                <DropdownButton 
                                    handleChange={this.userHandle} items={userList} textColor={textColor} bgColor={backgroundColor}
                                    buttonTextColor={buttonTextColor} handleClick={this.deleteUser} buttonLabel="Delete Selected User"
                                />,
                                <InputButton textColor={textColor} bgColor={backgroundColor} buttonTextColor={buttonTextColor} label="Username" buttonLabel="Add User" type="text"
                                handleClick={this.addUser}/>,
                                <InputField value={this.state.newUserPassword} bgColor={backgroundColor} textColor={textColor} handleChange={(val) => this.setState({newUserPassword: val})} inputText="Password: " type="password"/>,
                                <CheckboxLabel textColor={textColor} label="New User can Manage Users: " handleChange={(val) => this.handleNewUserP("manage_users")}/>,
                                <CheckboxLabel textColor={textColor} label="New User can Revoke Tokens " handleChange={(val) => this.handleNewUserP("revoke_tokens")}/>,
                                <CheckboxLabel textColor={textColor} label="New User can See Computer Info: " handleChange={(val) => this.handleNewUserP("client_user")}/>,
                                <CheckboxLabel textColor={textColor} label="New User can Send Computer Info: " handleChange={(val) => this.handleNewUserP("computer_user")}/>
                            ]}
                        />
                    </div>
                </div>
            </div>
            
        );
    }
}

ReactDOM.render(<ComputerInfo/>, document.getElementById('root'));