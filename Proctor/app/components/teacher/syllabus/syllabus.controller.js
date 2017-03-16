/**
 * Created by tyler on 1/18/2017.
 */

function SyllabusController($scope, DlapService, PersonService, $timeout) {
    var self = this;
    self.name = 'SyllabusController';
    self.groupings = [];
    $scope.needToSave = false;
    $scope.saveSuccessful = null;

    self.analyzeGroupings = function (groupings) {
        if (groupings) {
            if (groupings.length) {
                for (var i = 0, total = groupings.length; i < total; i++)
                    self.processGrouping(groupings[i]);
            } else {
                self.processGrouping(groupings);
            }
        }
    };

    self.processGrouping = function (grouping) {
        for (var i = 0, total = self.groupings.length; i < total; i++) {
            if (grouping.id === self.groupings[i].itemId) {
                self.groupings[i].target = grouping.target;

                if (grouping.dependencies)
                    for (var j = 0, jTotal = grouping.dependencies.length; j < jTotal; j++) {
                        for (var k = 0, kTotal = self.groupings[i].items.length; k < kTotal; k++) {
                            if (self.groupings[i].items[k].id === grouping.dependencies[j].id) {
                                self.groupings[i].dependencies.push(self.groupings[i].items[k]);
                                break;
                            }
                        }
                    }

                break;
            }
        }
    };

    self.analyzeManifestNode = function (node) {
        if (node.item && node.item.length) {
            var hasGradable = false;
            for (var i = 0, total = node.item.length; i < total; i++) {
                if (node.item[i].item && node.item[i].item.length)
                    self.analyzeManifestNode(node.item[i]);

                if (node.item[i].data &&
                    node.item[i].data.gradable &&
                    node.item[i].data.gradable.$value)
                    hasGradable = true;
            }

            if (hasGradable)
                self.groupings.push(new ItemDependencyGrouping(node, $scope));
        }
    };

    self.saveChanges = function () {
        $scope.needToSave = false;
        $scope.saveSuccessful = null;

        var payload = {
            requests: {
                course: [{
                    courseid: PersonService.user.enrollment.course.id,
                    data: {
                        proctor: {
                            groupings: []
                        }
                    }
                }]
            }
        }

        DlapService.post('updatecourses', null, payload, function (response) {
            if (response.code !== "OK") {
                return $scope.saveSuccessful = false;
            }

            for (var i = 0, total = self.groupings.length; i < total; i++) {
                if (self.groupings[i].target) {
                    var proctorData = payload.requests.course[0].data.proctor;
                    var groupingData = {
                        id: self.groupings[i].itemId,
                        target: self.groupings[i].target,
                        dependencies: []
                    }

                    for (var j = 0, jTotal = self.groupings[i].dependencies.length; j < jTotal; j++) {
                        groupingData.dependencies.push({
                            id: self.groupings[i].dependencies[j].id
                        });
                    }

                    proctorData.groupings.push(groupingData);
                }
            }

            DlapService.post('updatecourses', null, payload, function (response) {
                if (response.code !== "OK") {
                    $scope.saveSuccessful = false;
                } else {
                    $scope.saveSuccessful = true;

                    $timeout(function () {
                        $scope.saveSuccessful = null;
                    }, 2000);
                }
            });
        });
    };

    if (this.manifest) {
        if (this.manifest.item.length)
            self.analyzeManifestNode(this.manifest.item[0]);

        if (this.manifest.data.proctor)
            self.analyzeGroupings(this.manifest.data.proctor.groupings);
    }
}

function ItemDependencyGrouping(data, $scope) {
    this.itemId = data.id || 0;
    this.itemName = data.data && data.data.title ? data.data.title.$value : "NO NAME";
    this.target = null;
    this.dependencies = [];
    this.items = [];
    this.$scope = $scope;

    for (var i = 0, total = data.item.length; i < total; i++) {
        if (data.item[i].data &&
            data.item[i].data.gradable &&
            data.item[i].data.gradable.$value)
            this.items.push(new Item(data.item[i], this));
    }

    $scope.$watch(function () {
        return this.target;
    }.bind(this), function (newValue, oldValue) {
        if (!newValue) $scope.$evalAsync(function () {
            this.dependencies.length = 0;
        }.bind(this));

        if (newValue !== oldValue) $scope.needToSave = true;
    }.bind(this));
}

function Item(data, parent) {
    this.id = data.id || 0;
    this.name = data.data && data.data.title ? data.data.title.$value : "NO NAME";

    this.addDependency = function () {
        if (parent.dependencies.filter(function (i) {
                return i === this;
            }.bind(this)).length === 0) {
            parent.dependencies.push(this);
            parent.$scope.needToSave = true;
        }
    };

    this.removeDependency = function () {
        for (var i = 0, len = parent.dependencies.length; i < len; i++) {
            if (parent.dependencies[i] === this) {
                parent.dependencies.splice(i, 1);
                parent.$scope.needToSave = true;
                break;
            }
        }
    }
}