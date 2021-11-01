export function setCookie(name, value, expires, bypassNoCookie) {
    let d = new Date();
    if (expires) {
        d.setTime(d.getTime() + expires);
    } else {
        d.setTime(d.getTime() + (1000 * 60 * 60 * 24));
    }
    document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/;SameSite=Strict`;
}

export function removeFromArray(array, item) {
    for (let i = 0; i < array.length; i++) {
        if (array[i] === item) {
            array.splice(i, 1);
        }
    }
    return array;
}

export function removeFromArrayPartialMatch(array, item) {
    for (let i = 0; i < array.length; i++) {
        if (array[i].includes(item)) {
            array.splice(i, 1);
        }
    }
    return array;
}

export function delCookie(name) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

export function readCookie(name, def_value) {
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