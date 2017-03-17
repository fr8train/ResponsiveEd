/**
 * Created by tyler on 3/11/2017.
 */

function DashboardController(PersonService) {
    var self = this;
    self.name = 'DashboardController';
    self.groupings = this.course &&
    this.course.data.proctor ?
        (this.course.data.proctor.groupings.constructor === Array ||
        (this.course.data.proctor.groupings.prop &&
        this.course.data.proctor.groupings.prop.constructor === Array) ?
            this.course.data.proctor.groupings : [this.course.data.proctor.groupings]) :
        [];

    self.computeGroupingProgress = function () {
        for (var i = 0, total = self.groupings.length; i < total; i++) {
            var grouping = self.groupings[i];
            grouping.participants = [];
            var dependencies = [];
            if (grouping.dependencies)
                for (var k = 0, kTotal = grouping.dependencies.length; k < kTotal; k++) {
                    dependencies.push(grouping.dependencies[k].id);
                }

            if (self.gradebook) {
                for (var j = 0, jTotal = self.gradebook.length; j < jTotal; j++) {
                    grouping.participants.push(new GroupingParicipant(self.gradebook[j], dependencies));
                }
            }
        }
    }

    self.computeGroupingProgress();
}

function GroupingParicipant(enrollment, groupingDependencies) {
    var self = this;
    self.id = enrollment.id;
    self.user = {
        id: enrollment.userid,
        name: {
            first: enrollment.user ? enrollment.user.firstname : 'NO_NAME',
            last: enrollment.user ? enrollment.user.lastname : 'NO_NAME'
        }
    }

    self.user.name.display = self.user.name.last + ', ' + self.user.name.first;
    self.dependencies = [];
    self.complete = 0;
    self.submitted = false;
    self.needsReview = false;

    if (enrollment.grades &&
        enrollment.grades.items &&
        enrollment.grades.items.item) {
        for (var i = 0, total = enrollment.grades.items.item.length; i < total; i++) {
            if (groupingDependencies.indexOf(enrollment.grades.items.item[i].itemid) >= 0)
                self.dependencies.push(enrollment.grades.items.item[i]);
        }
    }

    function calculateComplete() {
        if (self.dependencies.length === 0) {
            self.complete = 100;
            return;
        }

        for (var i = 0, total = self.dependencies.length; i < total; i++) {
            if (self.dependencies[i].achieved && self.dependencies[i].achieved >= 0) {
                ++self.complete;
            } else if (self.dependencies[i].status) {
                var status = self.dependencies[i].status.toString(16);

                if (status.length >= 2 &&
                    parseInt(status.substring(status.length - 2, status.length - 1), 16) >= 8) {
                    ++self.complete;
                }
            }
        }

        self.complete = (self.complete / self.dependencies.length) * 100;
    }

    calculateComplete();
}