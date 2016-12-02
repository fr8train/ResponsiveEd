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
                    component: 'teacher.syllabus.component'
                });

            $urlRouterProvider.otherwise('/');
        }
    ])
    .run(['$state', '$transitions', '$rootScope', function ($state, $transitions, $rootScope) {
        $transitions.onBefore({to: 'root'}, function (transition) {
            console.log(window.location.href);
            console.log(transition.$to());
            return transition.router.stateService.target('teacher.dashboard');
        })
    }]);