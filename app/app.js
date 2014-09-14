angular.module('snowmentum', ["ui.bootstrap", "angles"])

.factory('MagicSeaweed', function($http) {
  var MSW_API_KEY = "jx5HFZ5OyPH6zqKR9Pb8k230iSGymW2Q";
  var MSW_API_SECRET = "48Kx1256b8VpNBHLKh5pA3Q77BN2asqy";
  // var MSW_QUERY = "&fields=localTimestamp,solidRating,fadedRating"

  var factory = {};

  // API call to MSW - returns array of forecast data over the next five days
  factory.getForecast = function(spotNumber, callback) {
    $http.get('http://magicseaweed.com/api/' + MSW_API_KEY + '/forecast/?spot_id=' + spotNumber /*+ MSW_QUERY*/)
      .success(function(forecastData) {
        // Add formattedDate to each entry. Figure out this date?
        forecastData.forEach(function(forecast) {
          var forecastDate = new Date(forecast.localTimestamp * 1000);
          forecast.formattedDate = forecastDate;
        });
        console.log("Got MSW surf forecastData!", forecastData);
        callback(forecastData);
      })
      .error(function(data) {
        console.log("error getting data from msw", data);
      });
  };

  // Filters surf spots to find next spot with at least three solid stars
  factory.getNextGoodDay = function(forecastData) {
    var goodDays = forecastData.filter(function(forecast) {
      return forecast.solidRating >= 3;
    });
    return goodDays[0] ? goodDays[0].formattedDate : undefined; // Return undefined if no good days in forecast
  };

  return factory;
})

.factory('DateFactory', function() {
  var factory = {};

  factory.getDate = function() {
    return new Date();
  };

  factory.getPeriod = function(date) {
    var hour = date.getHours();
    if (hour >= 3 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 || hour < 3) return 'evening';
  };

  factory.getWeekday = function(date) {
    var weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    return weekdays[date.getDay()];
  };

  return factory;
})

.controller('MainController', function($scope, $window, MagicSeaweed, DateFactory) {
  // Clock inputs
  var date = DateFactory.getDate();
  $scope.time = date.toLocaleTimeString(navigator.language, {hour12: false, hour: '2-digit', minute:'2-digit'});

  // Greeting inputs
  $scope.period = DateFactory.getPeriod(date);
  $scope.name = localStorage.getItem('name');

  $scope.saveName = function(name) {
    localStorage.setItem('name', name);
    $scope.name = name;
  };

  // Chrome apps
  $scope.navToChromeApps = function() {
    chrome.tabs.update({
        url:'chrome://apps'
    });
  };

  $scope.resetSpot = function() {
    localStorage.removeItem('surfSpot');
    $scope.spot.name = "";
    $scope.spot.number = "";
    $scope.hasSpot = false;
  };

  // Get data from MSW & find next good day
  $scope.getForecast = function() {
    // Start animation
    $scope.isProcessing = true;

    // Lookup spot number in giant ass mswspots.js object
    $scope.spot.number = spotNameToNumber[$scope.spot.name];
    $scope.spot.mswLink = "http://magicseaweed.com/" + $scope.spot.name.replace(/\s+/g, '-') + "-Surf-Report/" + $scope.spot.number + "/";

    // Store spot object into localStorage
    localStorage.setItem('surfSpot', JSON.stringify($scope.spot));

    // Get forecast from MSW
    MagicSeaweed.getForecast($scope.spot.number, function(forecastData) {
      var nextGoodDay = MagicSeaweed.getNextGoodDay(forecastData); // Comes back in date format

      // Check if there is going to be a good day, change message accordingly
      $scope.nextGoodDayMessage = nextGoodDay ? DateFactory.getWeekday(nextGoodDay) + " " + DateFactory.getPeriod(nextGoodDay) + " looks sick, " + $scope.name : "Looks flat this week. Get to work, " + $scope.name;

      // Create chart
      // $scope.chart = forecastData.map(function(forecast, index) {
      //   return {
      //     x: index,
      //     rating: forecast.solidRating,
      //     swell: forecast.swell.components.primary.compassDirection + " " + forecast.swell.components.primary.height + "ft @ " + forecast.swell.components.primary.period + "sec",
      //     wind: forecast.wind.compassDirection + " " + forecast.wind.speed + "mph"
      //   };
      // });
      $scope.chart = {
          labels : forecastData.map(function(forecast) {
                      return '';
                    }),
          datasets : [
              // {
              //     fillColor : "rgba(151,187,205,0)",
              //     strokeColor : "#e67e22",
              //     pointColor : "rgba(151,187,205,0)",
              //     pointStrokeColor : "#e67e22",
              //     data : forecastData.map(function(forecast, index) {
              //               return {
              //                 x: index,
              //                 rating: forecast.solidRating,
              //                 swell: forecast.swell.components.primary.compassDirection + " " + forecast.swell.components.primary.height + "ft @ " + forecast.swell.components.primary.period + "sec",
              //                 wind: forecast.wind.compassDirection + " " + forecast.wind.speed + "mph"
              //               };
              //             })
              // },
              {
                  fillColor : "rgba(151,187,205,0)",
                  strokeColor : "rgba(255,255,255,0.8)",
                  // pointColor : "rgba(151,187,205,0)",
                  // pointStrokeColor : "#f1c40f",
                  data : forecastData.map(function(forecast) {
                            return forecast.solidRating + forecast.fadedRating;
                          })
              }
          ]
      };

      console.log($scope.chart);

      // Set chart options
      $scope.chartOptions = {
        // axes: {
        //   x: {key: 'x', labelFunction: function(value) {return value;}, type: 'linear', min: 0, max: 10},
        //   y: {type: 'linear', min: 0, max: 1},
        //   y2: {type: 'linear', min: 0, max: 1}
        // },
        // series: [
        //   {y: 'value', color: 'steelblue', thickness: '2px', type: 'area', striped: true, label: 'Pouet'},
        //   {y: 'otherValue', axis: 'y2', color: 'lightsteelblue', visible: false, drawDots: true, dotSize: 2}
        // ],
        // lineMode: 'linear',
        // tension: 0.7,
        // tooltip: {mode: 'scrubber', formatter: function(x, y, series) {return 'pouet';}},
        // drawLegend: true,
        // drawDots: true,
        // columnsHGap: 5
      };


      $scope.hasSpot = true;
      $scope.isProcessing = false;
    });
  };

  // Surf spot inputs
  // Check if spot is stored in local storage --> TODO: Put this in run block
  if (!!localStorage.getItem('surfSpot')) {
    $scope.hasSpot = true;
    $scope.spot = JSON.parse(localStorage.getItem('surfSpot'));
    $scope.getForecast();
  } else {
    $scope.hasSpot = false;
    $scope.spot = {};
  }

  $scope.spots = spotNames; // From mswspots.js
  $scope.isProcessing = false

});