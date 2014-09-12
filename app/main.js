angular.module('snowmentum', [])

.factory('MagicSeaweed', function($http) {
  var MSW_API_KEY = "jx5HFZ5OyPH6zqKR9Pb8k230iSGymW2Q";
  var MSW_API_SECRET = "48Kx1256b8VpNBHLKh5pA3Q77BN2asqy";
  var factory = {};

  factory.getForecast = function(spotNumber, callback) {
    $http.get('http://magicseaweed.com/api/' + MSW_API_KEY + '/forecast/?spot_id=' + spotNumber)
      .success(function(forecast) {
        console.log("Got MSW surf forecast!", forecast);
        callback(forecast);
      })
      .error(function(data) {
        console.log("error getting data from msw", data);
      });
  };

  return factory;
})

.controller('CenterController', function($scope, MagicSeaweed) {
  $scope.title = "Surfmentum";

  MagicSeaweed.getForecast(478, function(data) {
    $scope.data = data;
  });
});