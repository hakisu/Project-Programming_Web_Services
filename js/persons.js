app.controller('Persons', ['$http', 'common',
    function ($http, common) {

        console.log("Persons controller starting");

        var self = this;
        self.confirm = common.confirm;

        self.person = {};
        self.rolesList = {};

        self.refresh = function () {
            $http.get('/db/persons/').then(
                function (response) {
                    self.persons = response.data;
                },
                function (errResponse) {
                    self.persons = [];
                }
            );
        }

        self.refresh();

        self.insert = function () {
            console.log('ctrl.insert(), ' + JSON.stringify(self.person));
            $http.post('/db/persons/json', self.person).then(
                function (response) {
                    self.refresh();
                },
                function (errResponse) {
                    console.log(JSON.stringify(errResponse));
                }
            );
        };

        self.edit = function (id = '') {
            self.rolesList = {"administrator": false, "super-manager": false, "manager": false, "worker": false};
            if (id) {
                $http.get('/db/persons/' + id).then(
                    function (response) {
                        self.rolesList = {
                            "administrator": false,
                            "super-manager": false,
                            "manager": false,
                            "worker": false
                        };
                        self.person = response.data[0];
                        for (var role in self.rolesList) {
                            var firstLetter = role.charAt(0).toUpperCase();
                            if (self.person.roles.indexOf(firstLetter) >= 0) {
                                self.rolesList[role] = true;
                            }
                        }
                        $("#editPerson").modal();
                    },
                    function (errResponse) {
                    }
                );
            } else {
                self.person = {};
                $("#editPerson").modal();
            }
        }

        self.editSubmit = function () {
            self.person.roles = '';
            for (var role in self.rolesList) {
                var firstLetter = role.charAt(0).toUpperCase();
                if (self.rolesList[role]) {
                    self.person.roles += firstLetter;
                }
            }
            console.log('ctrl.editSubmit(), ' + JSON.stringify(self.person));
            if (self.person._id) {
                $http.put('/db/persons/' + self.person._id, self.person).then(
                    function (response) {
                        self.refresh();
                    },
                    function (errResponse) {
                        console.log(JSON.stringify(errResponse));
                    }
                );
            } else {
                $http.post('/db/persons/json', self.person).then(
                    function (response) {
                        self.refresh();
                    },
                    function (errResponse) {
                        console.log(JSON.stringify(errResponse));
                    }
                );
            }
            $('#editPerson').modal('hide');
        };

        self.confirmRemove = function (person) {
            $('#editPerson').modal('hide');
            common.confirm.text = 'Are you sure to delete a person "' + self.person.firstName + ' ' + self.person.lastName + '" ?';
            common.confirm.action = self.remove;
            $("#confirmDialog").modal();
        }

        self.remove = function () {
            $("#confirmDialog").modal('hide');
            if (self.person._id) {
                $http.delete('/db/persons/' + self.person._id).then(
                    function (response) {
                        self.refresh();
                    },
                    function (errResponse) {
                        console.log(JSON.stringify(errResponse));
                    }
                );
                $('#editPerson').modal('hide');
            }
        }

    }
]);