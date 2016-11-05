/// <reference path="../DLAP.js" />
/// <reference path="../../index.html" />

function Enrollment() {
    var self = this;

    self.id = ko.observable();
    self.course = new Course();
    self.isTeacher = ko.observable();
    self.students = ko.observableArray();
    self.sortedStudents = ko.computed(function () {
        return self.students().sort(function (left, right) {
            return left.displayName() == right.displayName() ? 0 : (left.displayName() < right.displayName() ? -1 : 1);
        });
    });
    self.gradables = ko.observableArray();

    self.fill = function (data) {
        if (data.id) { self.id(data.id); }
        if (data.courseid) { self.course.id(data.courseid); }
    }

    self.isTeacher.subscribe(function (newValue) {
        self.students.removeAll();

        if (newValue && self.course.id()) {
            var waitToken3 = vm._show();
            _DLAP.get('getentitygradebook3', {
                entityid: self.course.id(),
                allstatus: false,
                itemid: '*'
            }, function (response) {
                if (typeof response.enrollments !== "undefined" &&
                    typeof response.enrollments.enrollment !== "undefined") {
                    for (var i = 0; i < response.enrollments.enrollment.length; i++) {
                        var student = new User();

                        if (response.enrollments.enrollment[i].user !== undefined) {
                            student.fill(response.enrollments.enrollment[i].user);

                            student.enrollment = new Enrollment();
                            student.enrollment.fill(response.enrollments.enrollment[i]);

                            student.enrollment.course = self.course;

                            if (typeof response.enrollments.enrollment[i].grades !== "undefined" &&
                                typeof response.enrollments.enrollment[i].grades.items !== "undefined" &&
                                typeof response.enrollments.enrollment[i].grades.items.item !== "undefined") {

                                for (var j = 0; j < self.course.gradables().length; j++) {
                                    var entry = $.grep(response.enrollments.enrollment[i].grades.items.item, function (item) {
                                        return item.itemid == self.course.gradables()[j].id();
                                    });

                                    var tempGradable = {
                                        id: self.course.gradables()[j].id(),
                                        status: ko.observable(),
                                        isExcused: ko.observable(false),
                                        click: function (enrollmentId) {
                                            this.status(modifyStatus(this.status()));

                                            _DLAP.post('putteacherresponses',
                                                null,
                                                {
                                                    "requests": {
                                                        "teacherresponse": [{
                                                            "enrollmentid": enrollmentId,
                                                            "itemid": this.id,
                                                            "status": this.status(),
                                                            "mask": 132
                                                        }]
                                                    }
                                                },
                                            function (response) {
                                                console.log(response);
                                            });
                                        }
                                    }

                                    tempGradable.status.subscribe(function (newValue) {
                                        if (newValue) {
                                            var hex = newValue.toString(16);

                                            this.isExcused(parseInt(hex.substr(-2, 1), 16) - 8 >= 0);
                                        } else
                                            this.isExcused(false);
                                    }, tempGradable);

                                    tempGradable.status(entry.length > 0 ? entry[0].status : null);

                                    student.enrollment.gradables.push(tempGradable);
                                }
                            }

                            self.students.push(student);
                        }
                    }
                }
                vm._hide(waitToken3);
            });
        }
    })

    self.isTeacher(false);
}