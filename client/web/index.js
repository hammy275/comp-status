let token = null;
let oldComputers = null;
let computerData = null;

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
                if (this.status === 200) {
                    let returned = JSON.parse(xhr.response);
                    returned["error"] = 200;
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
        postWithAuth(url, data, endFunction);
    } else if (returned["message"] === "Data successfully received!") {
        endFunction(returned)
    } else if (returned["message"] === "Unauthorized!") {
        document.getElementById("statusMessage").innerHTML = "Invalid username/password!";
        document.getElementById("statusMessage").style.color = "#FF0000";
        token = null;
    } else if (returned["error"] !== 200) {
        document.getElementById("statusMessage").innerHTML = returned["message"];
        document.getElementById("statusMessage").style.color = "#FF0000";
    } else if (returned["message"] === "Token expired!") {
        token = null;
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
        httpPost(url, Object.assign({}, authData, data)).then(
            value => {confirmAuth(value, url, data, endFunction)}
        );
    }
}

function getComputerData() {
    let ip = document.getElementById("ip").value;
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    postWithAuth("https://" + ip + "/give_data", {}, endGetComputerData, username, password);
}

function endGetComputerData(returned) {
    document.getElementById("statusMessage").innerHTML = returned["message"];
    document.getElementById("statusMessage").style.color = "#000000";
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
    let mem_usage = (cd["used_memory"] / cd["current_memory"] * 100).toFixed(1);
    let cpuTemps = cd["cpu_temps"].split(",").join("°C, ") + "°C";
    let cpuUsages = cd["cpu_usages"].split(",").join("%, ") + "%";
    let dataToShow =
`
${selectedItem}:<br>
<br>
Memory: ${cd["used_memory"]} GB/${cd["current_memory"]} GB (${mem_usage}% usage)<br>
CPU Stats: ${cd["cpu_usage"]}% Usage at ${cd["cpu_pack_temp"]}°C<br>
Turbo: ${cd["current_turbo"]} GHz/${cd["max_turbo"]} GHz<br>
Individual CPU Temperatures: ${cpuTemps}<br>
Individual CPU Usages: ${cpuUsages}
`;
    document.getElementById("computerInfo").innerHTML = dataToShow;
}

window.setInterval(getComputerData, 1000);
