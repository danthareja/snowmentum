angular.module('snowmentum')

.factory('MagicSeaweed', function($http) {
  var MSW_API_KEY = "jx5HFZ5OyPH6zqKR9Pb8k230iSGymW2Q";
  var MSW_API_SECRET = "48Kx1256b8VpNBHLKh5pA3Q77BN2asqy";
  var factory = {};

  // API call to MSW - returns array of forecast data over the next five days
  factory.getForecast = function(spotNumber, callback) {
    $http.get('http://magicseaweed.com/api/' + MSW_API_KEY + '/forecast/?spot_id=' + spotNumber)
      .success(function(forecastData) {
        // Add formattedDate to each entry
        forecastData.forEach(function(forecast) {
          var forecastDate = new Date(forecast.timestamp * 1000);
          forecast.formattedDate = forecastDate;
        });
        console.log("Got MSW surf forecastData!", forecastData);
        callback(forecastData);
      })
      .error(function(data) {
        console.log("error getting data from msw", data);
      });
  };

  // Filters surf spot to return only those with 3 or more MSW solid stars
  factory.getGoodDays = function(forecastData) {
    return forecastData.filter(function(forecast) {
      return forecast.solidRating >= 3;
    });
  };

  return factory;
})

.controller('SurfSpotController', function($scope, MagicSeaweed) {

  $scope.getForecast = function(spotNumber) {
    MagicSeaweed.getForecast(spotNumber, function(data) {
      $scope.goodDays = MagicSeaweed.getGoodDays(data);
      console.log($scope.goodDays);
    });
  };

});