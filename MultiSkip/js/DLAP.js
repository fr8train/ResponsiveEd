/*
 DLAP ERRORS
 */

function MissingAuthTokenError() {
    this.name = 'MissingAuthTokenError';
    this.message = 'You cannot complete a services call without a valid Auth Token. Please try logging back in.';
}

MissingAuthTokenError.prototype = Error.prototype;

function TransmissionFailedError(code) {
    this.name = 'TransmissionFailedError';
    this.message = 'Transmitting to the services API resulted in an HTTP ' + code;
}

TransmissionFailedError.prototype = Error.prototype;

function DLAPFailedError(message) {
    this.name = "DLAPFailedError";
    this.message = "services Returned Error: " + message;
}

DLAPFailedError.prototype = Error.prototype;

/*
 services IMPLEMENTATION
 */

function DLAP() {
    // PRIVATE VARIABLES
    var uri = 'https://gls.agilix.com/Dlap.ashx?';
    var token;

    // PRIVATE METHODS
    function init(tokenUrl) {
        var splitUrl = tokenUrl.split('/');

        for (var i = 0; i < splitUrl.length; i++) {
            if (splitUrl[i] == 'Resz') {
                if (isNaN(splitUrl[i + 1]))
                    token = splitUrl[i + 1];
            }
        }
    }

    function __uri(command, attributes) {
        var _uri = uri + 'cmd=' + command;

        if (attributes && Object.keys(attributes).length > 0)
            for (var key in attributes)
                _uri += '&' + key + '=' + attributes[key];

        _uri += '&_token=' + token;

        return _uri;
    }

    function __response(data, callback) {
        if (data.status == 200) {
            if (typeof data.responseJSON !== 'undefined') {

                __callback(data.responseJSON, callback);
            }
            else {
                var translated = JSON.parse(data.responseText);
                if (translated) {

                    __callback(translated, callback);
                }
                else {
                    __callback(data.responseText, callback);
                }
            }
        }
        else
            throw new TransmissionFailedError(data.status);
    }

    function __callback(data, callback) {
        if (typeof data != 'string') {
            if (data.response.code == "OK") {
                if (callback)
                    callback(data.response);
            } else {
                throw new DLAPFailedError(data.response.message);
            }
        } else {
            if (callback)
                callback(data.responseText);
        }
    }

    // PUBLIC METHODS
    this.get = function (command, attributes, callback, async) {
        if (typeof token === 'undefined' || token === null)
            throw new MissingAuthTokenError();

        if (typeof async === 'undefined')
            async = true;

        $.ajax({
            contentType: 'application/json; charset=UTF-8',
            dataType: 'json',
            method: 'GET',
            async: async,
            url: __uri(command, attributes),
            complete: function (response) {
                __response(response, callback);
            }
        })
    }

    this.post = function (command, attributes, payload, callback) {
        if (typeof token === 'undefined' || token === null)
            throw new MissingAuthTokenError();

        $.ajax({
            contentType: 'application/json; charset=UTF-8',
            dataType: 'json',
            data: JSON.stringify(payload),
            method: 'POST',
            url: __uri(command, attributes),
            complete: function (response) {
                __response(response, callback);
            }
        })
    }

    // OVERRIDE METHODS
    this.toString = function () {
        return '[object services]';
    }

    // INITIALIZATION
    init(window.location.href);
}

var _DLAP = new DLAP();