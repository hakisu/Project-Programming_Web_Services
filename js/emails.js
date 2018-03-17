app.controller('Emails', ['$http', 'globals', 'common', function ($http, globals, common) {
    console.log('Emails controller started');

    let self = this;
    self.emailToSent = {};
    self.userLogged = false;

    self.refresh = function () {
        console.log('Checking for new e-mails.');
        common.getUser(function () {
            if (globals.session.user) {
                self.userLogged = true;
                $http.get("http://localhost:8888/emails/" + globals.session.user._id).then((response) => {
                    self.emailMessages = response.data;
                    $http.get('/db/persons/').then(function (response) {
                        self.persons = response.data;
                        self.emailToSent.receiverId = response.data[0]._id;
                        self.emailMessages.forEach((element) => {
                            for (let i = 0; i < self.persons.length; i++) {
                                if (self.persons[i]._id === element.senderId) {
                                    element.sender = self.persons[i].firstName + ' ' + self.persons[i].lastName;
                                }
                            }
                        });
                    });
                });
            } else {
                self.userLogged = false;
            }
        });
    };
    self.readEmail = function (email) {
        self.currentEmail = email;
    };
    self.writeEmail = function () {
        $("#writeEmail").modal();
    };
    self.resetEmailToSent = function () {
        self.emailToSent.data = '';
        self.emailToSent.title = '';
    };
    self.sendEmail = function () {
        self.emailToSent.sentTime = new Date();
        self.emailToSent.senderId = globals.session.user._id;
        console.log('email user id receiver');
        console.log(self.emailToSent.receiverId);

        $http.post("http://localhost:8888/emails", self.emailToSent).then((response) => {
            console.log("New email inserted!");
            self.resetEmailToSent();
            self.refresh();
        });

        $("#writeEmail").modal('hide');
    };

    self.resetEmailToSent();
    self.refresh();

}]);