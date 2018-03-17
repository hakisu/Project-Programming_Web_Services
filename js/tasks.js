app.controller('Tasks', ['$http', 'common', function ($http, common) {

    console.log("Tasks controller starting");

    var self = this;
    self.confirm = common.confirm;
    self.statusName = common.statusName;

    self.projectId = 0;
    self.task = {};

    $http.get('/db/projects/').then(
        function (response) {
            self.projects = response.data;
            self.projectId = response.data[0]._id;
            self.refresh();
        },
        function (errResponse) {
            self.projects = [];
            self.projectId = 0;
        }
    );

    $http.get('/db/persons').then(
        function (response) {
            self.persons = response.data;
        },
        function (errResponse) {
            self.persons = [];
        }
    );

    self.insert = function () {
        console.log('ctrl.insert(), ' + self.task);
        $http.post('/db/tasks/json', self.task).then(
            function (response) {
                self.refresh();
            },
            function (errResponse) {
                console.log(JSON.stringify(errResponse));
            }
        );
    }

    self.refresh = function () {
        $http.get('/db/tasks/projectId=' + self.projectId).then(
            function (response) {
                var tasks = response.data;
                for (var k in tasks) {
                    tasks[k].deadline = new Date(tasks[k].deadline);
                }
                self.tasks = tasks;
            },
            function (errResponse) {
                self.tasks = [];
            }
        );
    };

    self.edit = function (id = '') {
        if (id) {
            $http.get('/db/tasks/' + id).then(
                function (response) {
                    self.task = response.data[0];
                    self.task.deadline = new Date(self.task.deadline);
                    $("#editTask").modal();
                },
                function (errResponse) {
                }
            );
        } else {
            self.task = {status: 0, projectId: self.projectId};
            $("#editTask").modal();
        }
    }

    self.editSubmit = function () {
        var taskGelded = self.task;
        delete taskGelded.manager;
        delete taskGelded.project;
        delete taskGelded.workers;
        delete taskGelded.dependsOn;
        console.log('ctrl.editSubmit(), ' + JSON.stringify(taskGelded));
        if (taskGelded._id) {
            $http.put('/db/tasks/' + taskGelded._id, taskGelded).then(
                function (response) {
                    self.refresh();
                },
                function (errResponse) {
                    console.log(JSON.stringify(errResponse));
                }
            );
        } else {
            $http.post('/db/tasks/json', taskGelded).then(
                function (response) {
                    self.refresh();
                },
                function (errResponse) {
                    console.log(JSON.stringify(errResponse));
                }
            );
        }
        $('#editTask').modal('hide');
    }

    self.confirmRemove = function (task) {
        $('#editTask').modal('hide');
        common.confirm.text = 'Are you sure to delete a task "' + self.task.description + '" ?';
        common.confirm.action = self.remove;
        $("#confirmDialog").modal();
    }

    self.remove = function () {
        $("#confirmDialog").modal('hide');
        if (self.task._id) {
            $http.delete('/db/tasks/' + self.task._id).then(
                function (response) {
                    self.refresh();
                },
                function (errResponse) {
                    console.log(JSON.stringify(errResponse));
                }
            );
            $('#editTask').modal('hide');
        }
    }
}
]);