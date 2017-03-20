/**
 * Created by tyler on 12/2/2016.
 */
angular.module('proctor')
    .factory('PersonService', ['$state', '$location', 'DlapService', function ($state, $location, DlapService) {
        var determineIsTeacherFromRights = function (rightsFlags) {
            var hex = parseInt(rightsFlags).toString(16);

            if (hex.length >= 8) {
                var canReadGradebook = parseInt(hex.substr(hex.length - 8, 1), 16) >= 8;
                var hexValue = parseInt(hex.substr(hex.length - 7, 1), 16);
                var canGradeExams = hexValue >= 12 || (7 >= hexValue && hexValue >= 4);

                return canReadGradebook || canGradeExams;
            } else
                return false;
        };

        var user = {
            id: null,
            name: {
                first: null,
                last: null
            },
            enrollment: {
                id: null,
                course: {
                    id: null
                },
                isTeacher: false
            }
        };

        var parseHref = function () {
            var url = $location.absUrl();
            var index = url.indexOf('enrollmentId');
            DlapService.init(url);
            user.enrollment.id = index >= 0 ? url.substring(index + 'enrollmentId='.length, url.indexOf('#', index)) : user.enrollment.id;

            return this;
        };

        var loadCurrentUser = function (callback) {
            if (user.enrollment.id) {
                DlapService.get('getenrollment3', {
                    enrollmentid: user.enrollment.id,
                    select: 'user'
                }, function (response) {
                    user.id = response.enrollment.userid;
                    user.enrollment.id = response.enrollment.id;
                    user.enrollment.course.id = response.enrollment.courseid;
                    user.enrollment.isTeacher = determineIsTeacherFromRights(response.enrollment.privileges);

                    if (response.enrollment.user) {
                        user.name.first = response.enrollment.user.firstname;
                        user.name.last = response.enrollment.user.lastname;
                    }

                    if (angular.isFunction(callback)) callback();
                })
            } else {
                if (angular.isFunction(callback)) callback();
            }
        };

        var determineStateResolution = function () {
            if (!user.enrollment.id)
                return '400';
            else {
                if (user.enrollment.isTeacher)
                    return 'teacher.dashboard';
                else
                    return '401'; // REPLACE WITH STUDENT DASHBOARD !!!!!!
            }
        };

        return {
            user: user,
            parseHref: parseHref,
            loadCurrentUser: loadCurrentUser,
            determineStateResolution: determineStateResolution
        }
    }]);