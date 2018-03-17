app.controller('Messages', ['$http', '$timeout', 'globals', 'common', function ($http, $timeout, globals, common) {
    console.log('Messages controller started');

    const self = this;
    self.newChatMsg = '';
    self.messages = [];
    self.messageAppeared = '';

    $http.get('/db/persons/').then(function (response) {
        self.persons = response.data;
        self.currentPal = response.data[0];

        self.refresh();
    });

    // Web socket connection
    const connectionForMessages = new WebSocket('ws://localhost:8888');

    connectionForMessages.onopen = function () {
        console.log('Connection established!');
    };

    connectionForMessages.onmessage = function (messageResponse) {
        try {
            let responseObject = JSON.parse(messageResponse.data);

            switch (responseObject.action) {
                case 'refresh':
                    console.log('Received refresh action from server!');
                    self.refresh();
                    break;
                case 'getData': {
                    // Timeout used with 0 delay to inform angular about changes to messages
                    $timeout(function () {
                        console.log('Received getData action from server!');
                        self.messages = responseObject.resultTable;
                    });
                    break;
                }
                case 'informAboutMessage': {
                    $timeout(() => {
                        console.log('Received informAboutMessage from server!');

                        let loggedUser = globals.session.user;

                        if ((loggedUser._id === responseObject.usersIds[0]
                            || loggedUser._id === responseObject.usersIds[1])
                            && (self.currentPal._id !== responseObject.usersIds[0]
                                && self.currentPal._id !== responseObject.usersIds[1])) {
                            // Inform should be displayed
                            let secondTalkerId = loggedUser._id === responseObject.usersIds[0] ? responseObject.usersIds[1] : responseObject.usersIds[0];
                            let infoMessage = 'New message between ' + loggedUser.firstName + ' ' + loggedUser.lastName + ' and ';
                            self.persons.forEach((person) => {
                                if (person._id === secondTalkerId) {
                                    infoMessage += person.firstName + ' ' + person.lastName;
                                }
                            });
                            self.messageAppeared = infoMessage;
                            console.log(infoMessage);
                        }
                    });
                    break;
                }
                default:
                    console.log("Default");
            }
        } catch (err) {
        }
    };

    self.closeAlert = function () {
        self.messageAppeared = '';
    };

    self.refresh = function () {
        common.getUser(() => {
            if (globals.session.user && globals.session.user._id) {
                // Remove current person, so that you can't talk with yourself
                for (let i = 0; i < self.persons.length; i++) {
                    if (self.persons[i]._id === globals.session.user._id) {
                        self.persons.splice(i, 1);
                        break;
                    }
                }

                let loggedUser = globals.session.user;

                let objectToSend = {};
                objectToSend.action = 'getData';
                objectToSend.dialog = {};
                objectToSend.dialog.usersIds = [loggedUser._id, self.currentPal._id];

                objectToSend = JSON.stringify(objectToSend);
                connectionForMessages.send(objectToSend);
            }
        });
    };

    self.sendNewChatMsg = function () {
        common.getUser(() => {
            if (globals.session.user && globals.session.user._id) {
                let loggedUser = globals.session.user;

                let objectToSend = {};
                objectToSend.action = 'insertMessage';

                objectToSend.message = {};
                objectToSend.message.sender = loggedUser.firstName + ' ' + loggedUser.lastName;
                objectToSend.message.sentTime = new Date();
                objectToSend.message.data = self.newChatMsg;

                objectToSend.dialog = {};
                objectToSend.dialog.usersIds = [loggedUser._id, self.currentPal._id];

                objectToSend = JSON.stringify(objectToSend);
                connectionForMessages.send(objectToSend);
            }
            // Clean chat input
            self.newChatMsg = '';
        });
    };
}]);