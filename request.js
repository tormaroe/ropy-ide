ajaj = (function () {
    var isSuccess = function (status) {
        return status == 200;
    };

    var makeResponse = function (httpRequest) {
        return {
            body: httpRequest.responseText
        };
    };

    return {
        get: function (url, callback, errorCallback) {
            const Http = new XMLHttpRequest();
            Http.onreadystatechange = function () {
                if (this.readyState == 4)
                    (isSuccess(this.status) ? callback : errorCallback)(makeResponse(Http));
            };
            Http.open("GET", url);
            Http.send();
        }
    };
})();