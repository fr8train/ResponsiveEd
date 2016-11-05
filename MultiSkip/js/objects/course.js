function Course() {
    var self = this;

    self.id = ko.observable();
    self.title = ko.observable();
    self.type = ko.observable();
    self.domainId = ko.observable();
    self.baseId = ko.observable();

    self.gradables = ko.observableArray();
    self.headers = ko.observableArray();

    self.fill = function (data) {
        if (data.id) { self.id(data.id); }
        if (data.title) { self.title(data.title); }
        if (data.type) { self.type(data.type); }
        if (data.domainid) { self.domainId(data.domainid); }
        if (data.baseid) { self.baseId(data.baseid); }
    }

    self.id.subscribe(function (newValue) {
        var waitToken4 = vm._show();
        _DLAP.get('getmanifest', { entityid: self.id() }, function (response) {
            
            if (typeof response.manifest !== "undefined") {
                for (var i = 0; i < response.manifest.item.length; i++) {
                    self.items = new Item(response.manifest.item[i], self);
                }
            }
            vm._hide(waitToken4);
        }, false);
    })
}