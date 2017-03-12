/**
 * Created by tyler on 11/21/16.
 */
angular.module('teacher')
    .component('teacher.dashboard.component', {
        bindings: {
            gradebook: '<',
            course: '<'
        },
        controller: DashboardController,
        templateUrl: 'app/components/teacher/dashboard/dashboard.html'
    });