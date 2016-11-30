/**
 * Created by tyler on 11/20/16.
 */
angular.module('proctor')
    .config(['$stateProvider', '$urlRouterProvider',
        function ($stateProvider, $urlRouterProvider) {
            $stateProvider
                .state('teacher', {
                    component: 'teacher.component'
                })
                .state('teacher.dashboard',{
                    url: '/teacher',
                    component: 'teacher.dashboard.component'
                })
                .state('teacher.review',{
                    url:'/teacher/review',
                    component: 'teacher.review.component'
                })
                .state('teacher.syllabus',{
                    url: '/teacher/syllabus',
                    component: 'teacher.syllabus.component'
                });

            $urlRouterProvider.otherwise('/teacher');
        }
    ]);