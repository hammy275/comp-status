let token = null;
let sendingData = null;
let sendingURL = null;
let sendingEndFunction = null;
let errorTimes = 0;

function httpPost(url, data, endFunction) {
    // Get ready to send HTTP POST request, and define a function to run when sent.
    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function() { // Call a function when the state changes.
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            // The server's response is a message and a color for displaying to the end user
            // This will take those values and display them
            let returned = xhr.response;
            returned = JSON.parse(returned);
            endFunction(returned);
        }
    }
    // Send the POST request
    xhr.send(JSON.stringify(data));
}

function confirmToken(returned) {
    errorTimes = -2;
    if (returned["message"] === "Generated token!") {
        token = returned["token"];
        postWithAuth(sendingURL, sendingData, sendingEndFunction);

    } else if (returned["message"] === "Unauthorized!") {
        document.getElementById("statusMessage").innerHTML = "Invalid username/password!"
        document.getElementById("statusMessage").style.color = "#FF0000";
    }
}

function postWithAuth(url, data, endFunction, username, password) {
    if (token === null || token === "") {
        let authData = {"user": username, "password": password, "auth": "password"};
        sendingData = data;
        sendingURL = url;
        sendingEndFunction = endFunction;
        httpPost(url, Object.assign({}, authData, data), confirmToken);
    }
    else {
        let authData = {"token": token, "auth": "token"};
        httpPost(url, Object.assign({}, authData, data), endFunction);
    }
}

function getComputerData() {
    if (errorTimes > 2) {
        document.getElementById("statusMessage").innerHTML = "Connection could not be established! Try" +
            "visiting the IP address to see if it works!"
        document.getElementById("statusMessage").style.color = "#FF0000";
        errorTimes = 0;
    } else {
        let ip = document.getElementById("ip").value;
        let username = document.getElementById("username").value;
        let password = document.getElementById("password").value;
        errorTimes++;
        postWithAuth("https://" + ip + "/give_data", {}, endGetComputerData, username, password);
    }

}

function endGetComputerData(returned) {
    errorTimes = -2;
    if (returned["message"] === "Token expired!") {
        token = null;
        document.getElementById("statusMessage").innerHTML = "Most recent request was not completed!"
    }
    document.getElementById("statusMessage").innerHTML = returned["message"]
    document.getElementById("statusMessage").style.color = "#000000";
    console.log(returned);
}

window.setInterval(getComputerData, 1000);