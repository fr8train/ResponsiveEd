/*
DLAP ERRORS
*/

/**
 * @description Error that fires following trying unsuccessfully to retrieve the auth token from the URL string.
 */
function MissingAuthTokenError() {
    this.name = 'MissingAuthTokenError';
    this.message = 'You cannot complete a DLAP call without a valid Auth Token. Please try logging back in.';
}

MissingAuthTokenError.prototype = Error.prototype;

/**
 * @description Error that fires following a failed call to the DLAP API.
 * @param {string} code HTTP code that was returned.
 */
function TransmissionFailedError(code) {
    this.name = 'TransmissionFailedError';
    this.message = 'Transmitting to the DLAP API resulted in an HTTP ' + code;
}

TransmissionFailedError.prototype = Error.prototype;

/**
 * @description Error that fires following a successfully returned DLAP Error.
 * @param {string} message
 */
function DLAPFailedError(message) {
    this.name = "DLAPFailedError";
    this.message = "DLAP Returned Error: " + message;
}

DLAPFailedError.prototype = Error.prototype;

/*
DLAP IMPLEMENTATION
*/

/**
 * @typedef {Object} DLAP
 * @description DLAP API Gateway Object.
 */
function DLAP() {
    // PRIVATE VARIABLES
    /**
     * @type {string}
     */
    var uri = 'https://gls.agilix.com/Dlap.ashx?';
    /**
     * @type {string}
     */
    var token;

    // PRIVATE METHODS
    /**
     * @description Initializer - pulls token from current window URL.
     * @param {string} tokenUrl current window's URL.
     * @private
     */
    function init(tokenUrl) {
        var splitUrl = tokenUrl.split('/');

        for (var i = 0; i < splitUrl.length; i++) {
            if (splitUrl[i] == 'Resz') {
                if (isNaN(splitUrl[i + 1]))
                    token = splitUrl[i + 1];
            }
        }
    }

    /**
     * @description URL Builder that will build the URL to call the DLAP Gateway.
     * @param {string} command DLAP API Command that we're calling.
     * @param {string[]} [attributes] Optional Key-Value Pairs of URL parameters.
     * @returns {string} uri constructed uri from Gateway base, command, and (optional) associated attributes.
     * @private
     */
    function __uri(command, attributes) {
        var _uri = uri + 'cmd=' + command;

        if (attributes && Object.keys(attributes).length > 0)
            for (var key in attributes)
                _uri += '&' + key + '=' + attributes[key];

        _uri += '&_token=' + token;

        return _uri;
    }

    /**
     * @description Response Parser - parses the response from the DLAP API and returns either the text or JSON object.
     * @param {jqXHR} data Cross Request default jQuery Object.
     * @param {func} callback Promise fulfilling callback function.
     * @private
     */
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

    /**
     * @description Callback Wrapper that checks for DLAP Success or Fail Codes.
     * @param {Object|string} data Response data in either JSON Object or regular string form.
     * @param {func} callback Promise fulfilling callback function.
     * @private
     */
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
    /**
     * @description GET request.
     * @param {string} command DLAP API Command that we're calling.
     * @param {string[]} [attributes] Optional Key-Value Pairs of URL parameters.
     * @param {func} callback Promise fulfilling callback function.
     * @param {bool} [async=true]
     */
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

    /**
     * @description POST request.
     * @param {string} command DLAP API Command that we're calling.
     * @param {string[]} [attributes] Optional Key-Value Pairs of URL parameters.
     * @param {Object} payload data to be sent to the server in Object form.
     * @param {func} callback Promise fulfilling callback function.
     */
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
        return '[object DLAP]';
    }

    // INITIALIZATION
    init(window.location.href);
}

var _DLAP = new DLAP();