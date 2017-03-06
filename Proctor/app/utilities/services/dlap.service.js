/**
 * Created by tyler on 12/3/2016.
 */

angular.module('DLAP', [])
    .factory('DlapService', ['$http', function ($http) {
        // CUSTOM PRIVATE ERRORS
        var MissingAuthTokenError = function () {
            this.name = 'MissingAuthTokenError';
            this.message = 'You cannot complete a services call without a valid Auth Token. Please try logging back in.';
        };

        MissingAuthTokenError.prototype = Error.prototype;

        var TransmissionFailedError = function (code) {
            this.name = 'TransmissionFailedError';
            this.message = 'Transmitting to the services API resulted in an HTTP ' + code;
        };

        TransmissionFailedError.prototype = Error.prototype;

        var DLAPFailedError = function (message) {
            this.name = "DLAPFailedError";
            this.message = "services Returned Error: " + message;
        };

        DLAPFailedError.prototype = Error.prototype;

        // PRIVATE VARIABLES
        var uri = 'https://gls.agilix.com/Dlap.ashx?';
        var token;

        // PRIVATE METHODS
        var __uri = function (command) {
            return uri + 'cmd=' + command;
        };

        var __response = function (response, callback) {
            if (response.status == 200) {
                return __callback(response.data, callback);
            }
            else
                throw new TransmissionFailedError(response.status);
        };

        var __callback = function (data, callback) {
            if (typeof data != 'string') {
                if (data.response.code == "OK") {
                    if (callback)
                        return callback(data.response);
                    else
                        return data.response;
                } else {
                    throw new DLAPFailedError(data.response.message);
                }
            } else {
                if (callback)
                    return callback(data.responseText);
                else
                    return data.responseText;
            }
        };

        return {
            // PUBLIC METHODS
            init: function (tokenUrl) {
                var splitUrl = tokenUrl.split('/');

                for (var i = 0; i < splitUrl.length; i++) {
                    if (splitUrl[i] == 'Resz') {
                        if (isNaN(splitUrl[i + 1]))
                            token = splitUrl[i + 1];
                    }
                }
            },
            get: function (command, attributes, callback) {
                if (typeof token === 'undefined' || token === null)
                    throw new MissingAuthTokenError();

                if (typeof attributes === 'undefined' || attributes === null)
                    attributes = {};

                attributes['_token'] = token;

                return $http({
                    method: 'GET',
                    url: __uri(command),
                    params: attributes,
                    headers: {
                        'Content-Type': 'application/json; charset=UTF-8',
                        'Accept': 'application/json'
                    }
                }).then(function (response) {
                        return __response(response, callback);
                    },
                    function (response) {
                        throw new TransmissionFailedError(response.status)
                    });
            },
            post: function (command, attributes, payload, callback) {
                if (typeof token === 'undefined' || token === null)
                    throw new MissingAuthTokenError();

                if (typeof attributes === 'undefined' || attributes === null)
                    attributes = {};

                attributes['_token'] = token;

                $http({
                    method: 'POST',
                    url: __uri(command),
                    data: JSON.stringify(payload),
                    params: attributes,
                    headers: {
                        'Content-Type': 'application/json; charset=UTF-8',
                        'Accept': 'application/json'
                    }
                }).then(function (response) {
                        __response(response, callback);
                    },
                    function (response) {
                        throw new TransmissionFailedError(response.status)
                    });
            },

            // OVERRIDE METHODS
            toString: function () {
                return '[object services]';
            }
        }
    }]);