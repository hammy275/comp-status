let token = null;
let oldComputers = null;
let computerData = null;
let useCookies = true;

function setCookie(name, value, expires, bypassNoCookie) {
    if (useCookies || bypassNoCookie) {
        let d = new Date();
        if (expires) {
            d.setTime(d.getTime() + expires);
        } else {
            d.setTime(d.getTime() + (1000 * 60 * 60 * 24));
        }
        document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/`;
    }
}

function delCookie(name) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

function readCookie(name, def_value) {
    //Probably a better way to implement this
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

function equalArrays(a, b) {
    if (a === b) {
        return true;
    }
    if (a === null || b === null || a.length !== b.length) {
        return false;
    }
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
            return false;
        }
    }
    return true;
}

function httpPost(url, data) {
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

function confirmAuth(returned, url, data, endFunction) {
    if (returned["message"] === "Generated token!") {
        token = returned["token"];
        setCookie("token", token);
        postWithAuth(url, data, endFunction);
    } else if (returned["message"] === "Data successfully received!") {
        endFunction(returned)
    } else if (returned["message"] === "Unauthorized!") {
        document.getElementById("statusMessage").innerHTML = "Invalid username/password!";
        document.getElementById("statusMessageDiv").className = "notification is-danger";
        token = null;
        delCookie("token");
    } else if (returned["error"] !== 200) {
        document.getElementById("statusMessage").innerHTML = returned["message"];
        document.getElementById("statusMessageDiv").className = "notification is-danger";
    } else if (returned["message"] === "Token expired!") {
        token = null;
        delCookie("token");
        postWithAuth(url, data, endFunction);
    }
}

function postWithAuth(url, data, endFunction, username, password) {
    if (token === null) {
        let authData = {"user": username, "password": password, "auth": "password"};
        httpPost(url, authData).then(
            value => {confirmAuth(value, url, data, endFunction)}
        );
    }
    else {
        let authData = {"token": token, "auth": "token"};
        setCookie("username", username);
        httpPost(url, Object.assign({}, authData, data)).then(
            value => {confirmAuth(value, url, data, endFunction)}
        );
    }
}

function getComputerData() {
    let ip = document.getElementById("ip").value;
    setCookie("ipAddress", ip);
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    postWithAuth("https://" + ip + "/give_data", {}, endGetComputerData, username, password);
}

function endGetComputerData(returned) {
    document.getElementById("statusMessage").innerHTML = returned["message"];
    document.getElementById("statusMessageDiv").className = "notification is-info";
    computerData = returned["data"];
    let keys = Object.keys(computerData);
    if (oldComputers === null || !equalArrays(oldComputers, keys)) {
        oldComputers = keys;
        let dropdown = document.getElementById("computerDropdown");
        for (let i = dropdown.options.length-1; i >= 0; i--) {
            dropdown.options[i] = null;
        }
        for (let i = 0; i < keys.length; i++) {
            let option = document.createElement("option");
            option.text = keys[i];
            dropdown.add(option);
        }
    }
    renderComputerInfo();
}

function renderComputerInfo() {
    let selectedItem = document.getElementById("computerDropdown");
    selectedItem = selectedItem.options[selectedItem.selectedIndex].text;
    let cd = computerData[selectedItem];
    let memUsage = (cd["used_memory"] / cd["current_memory"] * 100).toFixed(1);
    let cpuTemps = cd["cpu_temps"].split(",").join("°C, ") + "°C";
    let cpuUsages = cd["cpu_usages"].split(",").join("%, ") + "%";
    document.getElementById("pcName").innerHTML = `${selectedItem}:`;
    document.getElementById("RAMInfo").innerHTML = `Memory: ${cd["used_memory"]} GB/${cd["current_memory"]} GB (${memUsage}% usage)`;
    document.getElementById("CPUInfo").innerHTML = `CPU Stats: ${cd["cpu_usage"]}% Usage at ${cd["cpu_pack_temp"]}°C"`;
    document.getElementById("turboInfo").innerHTML = `Turbo: ${cd["current_turbo"]} GHz/${cd["max_turbo"]} GHz`;
    document.getElementById("CPUTemps").innerHTML = `Individual CPU Temperatures: ${cpuTemps}`;
    document.getElementById("CPUUsages").innerHTML = `Individual CPU Usages: ${cpuUsages}`;
    if (memUsage <= 70) {
        document.getElementById("RAMInfoSection").className = "hero is-small is-success";
    } else if (memUsage >= 90) {
        document.getElementById("RAMInfoSection").className = "hero is-small is-warning";
    } else {
        document.getElementById("RAMInfoSection").className = "hero is-small is-danger";
    }
    if (cd["cpu_usage"] >= 90 || cd["cpu_pack_temp"] >= 82) {
        document.getElementById("CPUInfoSection").className = "hero is-small is-warning";
    } else if (cd["cpu_usage"] >= 70 || cd["cpu_pack_temp"] >= 70) {
        document.getElementById("CPUInfoSection").className = "hero is-small is-danger";
    } else {
        document.getElementById("CPUInfoSection").className = "hero is-small is-success";
    }
    if (cd["cpu_pack_temp"] >= 82) {
        document.getElementById("CPUTempsSection").className = "hero is-small is-warning";
    } else if (cd["cpu_pack_temp"] >= 70) {
        document.getElementById("CPUTempsSection").className = "hero is-small is-danger";
    } else {
        document.getElementById("CPUTempsSection").className = "hero is-small is-success";
    }
    if (cd["cpu_usage"] >= 90) {
        document.getElementById("CPUUsagesSection").className = "hero is-small is-warning";
    } else if (cd["cpu_usage"] >= 70) {
        document.getElementById("CPUUsagesSection").className = "hero is-small is-danger";
    } else {
        document.getElementById("CPUUsagesSection").className = "hero is-small is-success";
    }
    document.getElementById("turboInfoSection").className = "hero is-small is-success";
    document.getElementById("pcNameSection").className = "hero is-small is-black";
}

function wipeCookies() {
    delCookie("ipAddress");
    delCookie("username");
    delCookie("token");
}

function useCookiesFunction() {
    if (useCookies) {
        useCookies = false;
        setCookie("useCookies", "false", null, true);
        wipeCookies();
        document.getElementById("useCookies").className = "button is-danger";
    } else {
        useCookies = true;
        setCookie("useCookies", "true", null, true);
        document.getElementById("useCookies").className = "button is-success";
    }
}

ipFromCookie = readCookie("ipAddress");
if (ipFromCookie) {
    document.getElementById("ip").value=ipFromCookie;
}

usernameFromCookie = readCookie("username");
if (usernameFromCookie) {
    document.getElementById("username").value=usernameFromCookie;
}

tokenFromCookie = readCookie("token");
if (tokenFromCookie) {
    token = tokenFromCookie;
}

useCookiesFromCookie = readCookie("useCookies");
console.log("Reading cookie state...")
if (useCookiesFromCookie === "false") {
    wipeCookies();
    useCookies = false;
    document.getElementById("useCookies").className = "button is-danger";
}

window.setInterval(getComputerData, 1000);