var app = angular.module('app', ['ngRoute', 'ngCookies', 'ngWebSocket', 'ngAnimate', 'ui.bootstrap']);

app.value('globals', { session: { id: '', user: '' }, lastMessage: { from: '', message: '' } });

app.service('common', ['$http', 'globals', function($http, globals) {

	this.getSession = function(callback) {
		$http.get('/auth').then(
			function(response) {
				if(!globals.session.id) {
					globals.session = response.data;
				}
				callback(response.data);
			},
			function(err) {
				callback({});
			}
		);
	}

	this.getUser = function (callback) {
	    $http.get('/auth').then((response) => {
	        globals.session = response.data;
	        callback();
        });
    };
	
	this.statusName = function(status) {
		const statusNames = [ 'not-started', 'started', 'in-tests', 'completed', 'cancelled'];
		return status >= 0 && status < statusNames.length ? statusNames[status] : 'unknown';
	}
	
	this.confirm = { text: '?', action: function() {
		$("#confirmDialog").modal('hide');
	}};
	
}]);

app.factory('ws', ['$websocket', 'globals', function($websocket, globals) {
    
	var dataStream = $websocket('ws://' + window.location.host);

    dataStream.onMessage(function(message) {

		try {
			var msg = JSON.parse(message.data);
			globals.lastMessage.from = msg.from;
			globals.lastMessage.message = msg.message;
			console.log('Received by ws: ' + JSON.stringify(globals.lastMessage));
		} catch(err) {
			console.log('Error during parsing the message from ws: ' + message.data);			
		}
    });

	
	return {
		
		init: function(sessId) {
				console.log('Sending initialization message by ws with session ' + sessId);
				dataStream.send(JSON.stringify({ session: sessId }));			
		}
	}

}]);