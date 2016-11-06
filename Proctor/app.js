/**
 * Created by tyler on 11/5/16.
 */

var proctorApp = angular
    .module('proctor', [
        'ngComponentRouter'
    ])
    .config(function ($locationProvider) {
        $locationProvider.html5Mode(true);
    })
    .value('$routerRootComponent', 'proctor')
    .component('proctor',{
        templateUrl: 'app/views/index.html'
    })