app.constant('routes', [
			{ route: '/', templateUrl: 'html/home.html', controller: 'Home', controllerAs: 'ctrl', onlyLoggedIn: false },
			{ route: '/1', templateUrl: 'html/persons.html', controller: 'Persons', controllerAs: 'ctrl', menu: 'Persons', onlyLoggedIn: true, showFor: 'A' },
			{ route: '/2', templateUrl: 'html/projects.html', controller: 'Projects', controllerAs: 'ctrl', menu: 'Projects', onlyLoggedIn: true, showFor: 'S' },
			{ route: '/3', templateUrl: 'html/tasks.html', controller: 'Tasks', controllerAs: 'ctrl', menu: 'Tasks', onlyLoggedIn: true, showFor: 'SMW' },
			{ route: '/4', templateUrl: 'html/messaging.html', controller: 'Messages', controllerAs: 'ctrl', menu: 'Messaging', onlyLoggedIn: true, showFor: 'SMW' },
			{ route: '/5', templateUrl: 'html/emails.html', controller: 'Emails', controllerAs: 'ctrl', menu: 'Emails', onlyLoggedIn: true, showFor: 'SMW' }
]);

app.config(['$routeProvider', 'routes', function($routeProvider, routes) {
	for(var i in routes) {
		$routeProvider.when(routes[i].route, routes[i]);
	}
	$routeProvider.otherwise({ redirectTo: '/' });
}]);

app.controller('Menu', ['$http', '$location', '$cookies', 'common', 'globals', 'routes', 'ws',
	function($http, $location, $cookies, common, globals, routes, ws) {
        var self = this;
		// Functions

        self.navClass = function(page) {
			return page === $location.path() ? 'active' : '';
		};
		self.logIn = function() {
			self.loginMsg = '';
			self.login = '';
			self.password = '';
			$("#loginDialog").modal();
		};

		self.logOut = function() {
			$http.delete('/auth').then(
				function (rep) {
					self.loggedUser = null;
					self.refreshMenu();
				},
				function (err) {
					self.refreshMenu();
				}
			);
			$("#confirmDialog").modal('hide');
		};

		self.confirmLogOut = function() {
			common.confirm.text = self.loggedUser.firstName + ', are you sure to log out?';
			common.confirm.action = self.logOut;
			$("#confirmDialog").modal();
		};

        self.hasRights = function(rights) {

            if(rights && self.loggedUser) {
                var arr1 = self.loggedUser.roles.split('');
                var arr2 = rights.split('');
                for(var i in arr1) {
                    for(var j in arr2) {
                        if(arr1[i] == arr2[j]) {
                            return true;
                        }
                    }
                }
            }
            return false;
        };

		self.validateCredentials = function() {
			$http.post('/auth', { login: self.login, password: self.password }).then(
				function (rep) {
					try {
						self.loggedUser = rep.data;
						$("#loginDialog").modal('hide');
						self.refreshMenu();
					} catch(err) {
						self.loginMsg = 'failed';
						self.loggedUser = null;
						self.refreshMenu();
					}
				},
				function (err) {
					self.loginMsg = 'failed';
					self.loggedUser = null;
					self.refreshMenu();
				}
			);
		};

        self.refreshMenu = function() {

            self.menu = [];

            for(var i in routes) {
                if(routes[i].menu && (!routes[i].onlyLoggedIn || self.hasRights(routes[i].showFor))) {
                    self.menu.push({ route: routes[i].route, title: routes[i].menu });
                }
            }
        };

		self.closeAlert = function() {
			self.lastMessage.from = '';
			self.lastMessage.message = '';
		};

		// Execute
        console.log('Menu controller started');

        self.confirm = common.confirm;
        self.lastMessage = globals.lastMessage;

        if(!globals.session.id) {

            common.getSession(function(sess) {
                self.loggedUser = globals.session.user;
                ws.init(globals.session.id);
                self.refreshMenu();
            });

        } else {
            self.loggedUser = globals.session.user;
        }

        self.refreshMenu();
	}
]);