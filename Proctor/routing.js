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
                    component: 'teacher.syllabus.component'
                });

            $urlRouterProvider.otherwise('/');
        }
    ])
    .run(['$state', '$transitions', 'PersonService', function ($state, $transitions, PersonService) {
        $transitions.onBefore({to: 'root'}, function (transition) {
            PersonService.parseHref().loadCurrentUser();
            return $state.target(PersonService.determineStateResolution());
        });
    }]);