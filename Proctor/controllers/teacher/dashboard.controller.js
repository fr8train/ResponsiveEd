/**
 * Created by tyler on 10/27/16.
 */

function TeacherDashboardController($scope, $location, $user) {
    console.log('Hello Teacher World!');

    $scope.redirectToStudentDashboard = function () {
        $user.role = Roles.STUDENT;
        $location.path('/studentDashboard');
    }
}