function User() {
    var self = this;

    self.id = ko.observable();
    self.firstName = ko.observable();
    self.lastName = ko.observable();
    self.displayName = ko.computed(function () {
        return self.lastName() + ", " + self.firstName();
    })

    self.domainId = ko.observable();
    self.email = ko.observable();
    self.username = ko.observable();

    self.enrollments = ko.observableArray();
    self.enrollment = null;

    self.fill = function (data) {
        if (data.firstname) { self.firstName(data.firstname); }
        if (data.lastname) { self.lastName(data.lastname); }
        if (data.domainid) { self.domainId(data.domainid); }
        if (data.email) { self.email(data.email); }
        if (data.username) { self.username(data.username); }
        if (data.id) { self.id(data.id); }
    }
}