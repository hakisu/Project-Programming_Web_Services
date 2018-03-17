app.controller('Home', ['$http', 'common', function ($http, common) {
    var self = this;
    self.confirm = common.confirm;
    console.log('Home page controller started');
}]);