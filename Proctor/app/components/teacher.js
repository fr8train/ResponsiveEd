/**
 * Created by tyler on 11/6/16.
 */

angular.module('teacher', [])
    .component('teacher', {
        templateUrl: 'app/views/teacher/index.html',
        $routeConfig: [
            {path: '/', name: 'TeacherDashboard', component: 'teacherDashboard', useAsDefault: true}
        ]
    })
    .component('teacherDashboard', {
        templateUrl: 'app/views/teacher/dashboard.html'
    })