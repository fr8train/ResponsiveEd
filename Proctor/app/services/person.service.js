/**
 * Created by tyler on 12/2/2016.
 */
angular.module('proctor')
    .factory('PersonService', ['$state', function ($state) {
        return {
            user: {
                id: null,
                enrollment: {
                    id: null,
                    course: {
                        id: null
                    },
                    isTeacher: false
                }
            },
            parseHref: function (href) {
                return this;
            },
            loadCurrentUser: function () {
                return this;
            },
            determineStateResolution: function () {
                return '401';
            }
        }
    }]);