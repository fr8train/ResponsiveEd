/**
 * Created by tyler on 11/20/16.
 */
angular.module('proctor')
    .config(['$stateProvider', '$urlRouterProvider',
        function ($stateProvider, $urlRouterProvider) {
            $stateProvider
                .state('root', {
                    url: '/'
                })
                .state('401', {
                    url: '/unauthorized',
                    templateUrl: 'app/views/unauthorized.html'
                })
                .state('400', {
                    url: '/missingEnrollmentId',
                    templateUrl: 'app/views/missingEnrollmentId.html'
                })
                .state('teacher', {
                    component: 'teacher.component'
                })
                .state('teacher.dashboard', {
                    url: '/teacher',
                    component: 'teacher.dashboard.component'
                })
                .state('teacher.review', {
                    url: '/teacher/review',
                    component: 'teacher.review.component'
                })
                .state('teacher.syllabus', {
                    url: '/teacher/syllabus',
                    component: 'teacher.syllabus.component',
                    resolve: {
                        manifest: function (DlapService, PersonService) {
                            return DlapService.get('getmanifest', {
                                entityid: PersonService.user.enrollment.course.id
                            }, function (response) {
                                return response.manifest || {};
                            });
                        }
                    }
                });

            $urlRouterProvider.otherwise('/');
        }
    ])
    .run(['$state', '$transitions', 'PersonService', function ($state, $transitions, PersonService) {
        $state.defaultErrorHandler(function () {
        });

        function DefaultReroute(transition) {
            if (!PersonService.user.enrollment.id) {
                PersonService.parseHref().loadCurrentUser(function () {
                    $state.transitionTo(PersonService.determineStateResolution());
                });

                return false;
            } else {
                if (transition.$to.name == 'root') {
                    return $state.target(PersonService.determineStateResolution());
                } else {
                    return true;
                }
            }
        }

        $transitions.onBefore({to: 'root'}, DefaultReroute);
        $transitions.onBefore({to: 'teacher.dashboard'}, DefaultReroute);
        $transitions.onBefore({to: 'teacher.review'}, DefaultReroute);
        $transitions.onBefore({to: 'teacher.syllabus'}, DefaultReroute);
    }]);