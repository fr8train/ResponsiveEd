/**
 * Created by tyler on 10/27/16.
 */

var proctor = angular.module('proctorApp',
    [
        'ngRoute'
    ]);

proctor
    .service('$user', User);

proctor
    .config([
        '$locationProvider',
        '$routeProvider',
        function config($locationProvider, $routeProvider) {
            $locationProvider.hashPrefix('!');

            $routeProvider
                .when('/teacherDashboard', {
                    template: '<teacher-dashboard></teacher-dashboard>'
                })
                .when('/studentDashboard', {
                    template: '<student-dashboard></student-dashboard>',
                    resolve: {
                        check: function ($user, $location) {
                            if ($user.role === Roles.TEACHER)
                                $location.path('/teacherDashboard');
                        }
                    }
                })
                .otherwise('/studentDashboard');
        }
    ]);