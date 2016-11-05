/**
 * Created by tyler on 10/27/16.
 */

function StudentDashboardController($scope, $location, $user) {
    console.log('Hello Student World!');

    $scope.redirectToTeacherDashboard = function () {
        $user.role = Roles.TEACHER;
        $location.path('/teacherDashboard');
    }
}