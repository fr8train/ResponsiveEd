/**
 * Created by tyler on 3/11/2017.
 */

function DashboardController(PersonService, DlapService) {
    var self = this;
    self.name = 'DashboardController';
    self.groupings = this.course &&
    this.course.data.proctor ?
        (angular.isArray(this.course.data.proctor.groupings) ?
            this.course.data.proctor.groupings : [this.course.data.proctor.groupings]) :
        [];

    self.computeGroupingProgress = function () {
        for (var i = 0, total = self.groupings.length; i < total; i++) {
            var grouping = self.groupings[i];
            grouping.participants = [];

            grouping.grantAccessAll = function () {
                if (this.participants.length > 0)
                    for (var i = 0, total = this.participants.length; i < total; i++) {
                        if (this.participants[i].complete === 100 && !this.participants[i].submitted) {
                            this.participants[i].grantAccess();
                        }
                    }
            }.bind(grouping);

            var dependenciesMap = [];
            if (grouping.dependencies) {
                var groupingDependencies =
                    angular.isArray(grouping.dependencies) ?
                        grouping.dependencies : [grouping.dependencies];

                for (var k = 0, kTotal = groupingDependencies.length; k < kTotal; k++) {
                    dependenciesMap.push(groupingDependencies[k].id);
                }
            }

            if (self.gradebook) {
                for (var j = 0, jTotal = self.gradebook.length; j < jTotal; j++) {
                    grouping.participants.push(
                        new GroupingParicipant(self.gradebook[j], grouping.target, dependenciesMap, PersonService, DlapService)
                    );
                }
            }
        }
    }

    self.computeGroupingProgress();
}

function GroupingParicipant(enrollment, groupingTarget, groupingDependencies, PersonService, DlapService) {
    var self = this;
    self.user = {
        id: enrollment.userid,
        enrollment: {
            id: enrollment.id,
            data: filterEnrollmentData(enrollment.data)
        },
        name: {
            first: enrollment.user ? enrollment.user.firstname : 'NO_NAME',
            last: enrollment.user ? enrollment.user.lastname : 'NO_NAME'
        }
    };

    self.user.name.display = self.user.name.last + ', ' + self.user.name.first;
    self.target = groupingTarget;
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

    self.grantAccess = function () {
        var proctorAttempt = null;

        for (var i=0, len=self.user.enrollment.data.proctor.length; i<len; i++) {
            if (self.user.enrollment.data.proctor[i].target.id === self.target.id) {
                proctorAttempt = self.user.enrollment.data.proctor[i];
                break;
            }
        }

        if (!proctorAttempt)
            self.user.enrollment.data.proctor.push(new ProctorAttempt(self.target));

        updateEnrollmentData();

        notifyStudent();
    }

    function updateEnrollmentData() {
        DlapService.post('updateenrollments', null, {
            requests: {
                enrollment: [
                    {
                        enrollmentid: self.user.enrollment.id,
                        data: self.user.enrollment.data
                    }
                ]
            }
        });
    }

    function notifyStudent() {
        DlapService.post('sendmail', {
            enrollmentid: PersonService.user.enrollment.id
        }, {
            email: {
                enrollments: {
                    enrollment: [
                        {id: self.user.enrollment.id}
                    ]
                },
                subject: {
                    $value: 'You may now take your test.'
                },
                body: {
                    $value: '<h2>You may now take your test!</h2>' +
                    '<p>You have accomplished all of the necessary prerequisites to take your proctored exam. Please log in and navigate to the Proctor icon on the left hand menu to begin taking your exam. Feel free to contact me if you have any problems or questions.</p>' +
                    '<p>Sincerely, ' + PersonService.user.name.first + ' ' + PersonService.user.name.last + '</p>'
                }
            }
        });
    }

    function filterEnrollmentData(data) {
        return data && data.proctor ? data.proctor : { proctor: [] };
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

function ProctorAttempt(target) {
    var self = this;

    self.target = target;
    self.attempts = 0;
    self.isAuthorizedForRetry = false;
    self.events = [];
}