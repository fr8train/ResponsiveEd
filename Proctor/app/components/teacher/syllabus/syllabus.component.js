/**
 * Created by tyler on 11/21/16.
 */
angular.module('teacher')
    .component('teacher.syllabus.component', {
        bindings: {
            manifest: '<'
        },
        controller: SyllabusController,
        templateUrl: 'app/components/teacher/syllabus/syllabus.html'
    });