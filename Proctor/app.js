/**
 * Created by tyler on 11/5/16.
 */

angular.module('proctor', [
        'ngComponentRouter',
        'teacher'
    ])
    .config(function ($locationProvider) {
        $locationProvider.html5Mode(false);
    })
    .value('$routerRootComponent', 'proctor')
    .component('proctor', {
        templateUrl: 'app/views/index.html',
        $routeConfig: [
            {path: '/teacher/...', name: 'Teacher', component: 'teacher', useAsDefault: true}
        ]
    })