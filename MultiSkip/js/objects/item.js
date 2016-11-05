function Item(entry, course) {
    this.name = ko.observable(entry.data['title'].$value);
    this.gradable = ko.observable(false);
    this.gradableEntries = ko.observable(0);
    this.id = ko.observable(entry.id);

    if (entry.data &&
        entry.data['gradable'] !== undefined)
        this.gradable(entry.data['gradable'].$value);

    if (this.gradable())
        course.gradables.push(this);

    this.children = ko.observableArray();

    if (entry.item &&
        entry.item.length > 0) {
        for (var i = 0; i < entry.item.length; i++) {
            var _item = new Item(entry.item[i], course);

            if (_item.gradable()) {
                this.gradableEntries(this.gradableEntries() + 1);
            } 
            
            if (_item.gradableEntries() > 0) {
                this.gradableEntries(this.gradableEntries() + _item.gradableEntries());
            }

            this.children.push(_item);
        }
    }

    if (this.id() == "DEFAULT") {
        for (var i = 0; i < this.children().length; i++) {
            if (this.children()[i].gradableEntries() > 0)
                course.headers.push({
                    name: this.children()[i].name(),
                    id: this.children()[i].id(),
                    colspan: this.children()[i].gradableEntries()
                });
        }
    }
}