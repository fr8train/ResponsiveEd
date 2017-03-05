/**
 * Created by tyler on 1/18/2017.
 */

function SyllabusController(PersonService, DlapService, $scope) {
    var self = this;
    self.name = 'SyllabusController';
    self.personService = PersonService;
    self.dlapService = DlapService;
    self.groupings = [];
    $scope.needToSave = false;

    self.getManifest = function () {
        DlapService.get('getmanifest',{entityid: PersonService.user.enrollment.course.id}, function (response) {
            if (response.manifest.item.length)
                self.analyzeManifestNode(response.manifest.item[0]);
        });
    };

    self.analyzeManifestNode = function (node) {
        if (node.item && node.item.length) {
            var hasGradable = false;
            for (var i=0, total = node.item.length; i<total; i++) {
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
    };

    self.getManifest();
}

function ItemDependencyGrouping(data, $scope) {
    this.itemId = data.id || 0;
    this.itemName = data.data && data.data.title ? data.data.title.$value : "NO NAME";
    this.target = null;
    this.dependencies = [];
    this.items = [];
    this.$scope = $scope;

    for (var i=0, total = data.item.length; i< total; i++) {
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
        parent.dependencies.push(this);
        parent.$scope.needToSave = true;
    };
    
    this.removeDependency = function () {
        for (var i=0, len=parent.dependencies.length; i<len; i++) {
            if (parent.dependencies[i] === this) {
                parent.dependencies.splice(i,1);
                parent.$scope.needToSave = true;
                break;
            }
        }
    }
}