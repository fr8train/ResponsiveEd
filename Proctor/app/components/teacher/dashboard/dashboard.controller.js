/**
 * Created by tyler on 3/11/2017.
 */

function DashboardController (PersonService) {
    var self = this;
    self.name = 'DashboardController';
    self.groupings = this.course &&
            this.course.data.proctor ? this.course.data.proctor.groupings : [];

    self.computeGroupingProgress = function () {
        for (var i=0, total=self.groupings.length; i<total; i++) {
            var grouping = self.groupings[i];
            grouping.participants = [];

            if (self.gradebook) {
                for (var j = 0, jTotal = self.gradebook.length; j < jTotal; j++) {
                    grouping.participants.push(new GroupingParicipant(self.gradebook[j]));
                }
            }
        }
    }

    self.computeGroupingProgress();
}

function GroupingParicipant(enrollment) {
    var self = this;
    self.name = {
        first: enrollment.user ? enrollment.user.firstname : 'NO_NAME',
        last: enrollment.user ? enrollment.user.lastname : 'NO_NAME'
    };
}