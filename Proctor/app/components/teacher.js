/**
 * Created by tyler on 11/6/16.
 */

angular.module('teacher', [])
    .component('teacher', {
        templateUrl: 'app/views/teacher/index.html',
        controller: TeacherController,
        $routeConfig: [
            {path: '/', name: 'TeacherDashboard', component: 'teacherDashboard', useAsDefault: true},
            {path: '/review', name: 'TeacherReview', component: 'teacherReview'},
            {path: '/syllabus', name: 'TeacherSyllabus', component: 'teacherSyllabus'}
        ]
    })
    .component('teacherDashboard', {
        templateUrl: 'app/views/teacher/dashboard.html',
        controller: TeacherDashboardController
    })
    .component('teacherReview', {
        templateUrl: 'app/views/teacher/review.html',
        controller: TeacherReviewController
    })
    .component('teacherSyllabus',{
        templateUrl: 'app/views/teacher/syllabus.html',
        controller: TeacherSyllabusController
    });

function TeacherController() {
}

function TeacherDashboardController() {
}

function TeacherReviewController() {
}

function TeacherSyllabusController() {
}

