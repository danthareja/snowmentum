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

      // Set chart options
      $scope.chartOptions = {
        // Boolean - Whether to animate the chart
            animation: true,

            // Number - Number of animation steps
            animationSteps: 60,

            // String - Animation easing effect
            animationEasing: "easeOutQuart",

            // Boolean - If we should show the scale at all
            showScale: true, //changed

            // Boolean - If we want to override with a hard coded scale
            scaleOverride: true, //changed

            // ** Required if scaleOverride is true **
            // Number - The number of steps in a hard coded scale
            scaleSteps: 5, //changed
            // Number - The value jump in the hard coded scale
            scaleStepWidth: 1, //changed
            // Number - The scale starting value
            scaleStartValue: 0, //changed

            // String - Colour of the scale line
            scaleLineColor: "rgba(0,0,0,0)", //changed

            // Number - Pixel width of the scale line
            scaleLineWidth: 2,

            // Boolean - Whether to show labels on the scale
            scaleShowLabels: false, //changed

            // Interpolated JS string - can access value
            scaleLabel: "<%=value%>",

            // Boolean - Whether the scale should stick to integers, not floats even if drawing space is there
            scaleIntegersOnly: true,

            // Boolean - Whether the scale should start at zero, or an order of magnitude down from the lowest value
            scaleBeginAtZero: false,

            // String - Scale label font declaration for the scale label
            scaleFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",

            // Number - Scale label font size in pixels
            scaleFontSize: 12,

            // String - Scale label font weight style
            scaleFontStyle: "normal",

            // String - Scale label font colour
            scaleFontColor: "#666",

            // Boolean - whether or not the chart should be responsive and resize when the browser does.
            responsive: true, //Changed

            // Boolean - whether to maintain the starting aspect ratio or not when responsive, if set to false, will take up entire container
            maintainAspectRatio: true,

            // Boolean - Determines whether to draw tooltips on the canvas or not
            showTooltips: false, //changed

            // Array - Array of string names to attach tooltip events
            tooltipEvents: ["mousemove", "touchstart", "touchmove"],

            // String - Tooltip background colour
            tooltipFillColor: "rgba(0,0,0,0.8)",

            // String - Tooltip label font declaration for the scale label
            tooltipFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",

            // Number - Tooltip label font size in pixels
            tooltipFontSize: 14,

            // String - Tooltip font weight style
            tooltipFontStyle: "normal",

            // String - Tooltip label font colour
            tooltipFontColor: "#fff",

            // String - Tooltip title font declaration for the scale label
            tooltipTitleFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",

            // Number - Tooltip title font size in pixels
            tooltipTitleFontSize: 14,

            // String - Tooltip title font weight style
            tooltipTitleFontStyle: "bold",

            // String - Tooltip title font colour
            tooltipTitleFontColor: "#fff",

            // Number - pixel width of padding around tooltip text
            tooltipYPadding: 6,

            // Number - pixel width of padding around tooltip text
            tooltipXPadding: 6,

            // Number - Size of the caret on the tooltip
            tooltipCaretSize: 8,

            // Number - Pixel radius of the tooltip border
            tooltipCornerRadius: 6,

            // Number - Pixel offset from point x to tooltip edge
            tooltipXOffset: 10,

            // String - Template string for single tooltips
            tooltipTemplate: "<%if (label){%><%=label%>: <%}%><%= value %>",

            // String - Template string for single tooltips
            multiTooltipTemplate: "<%= value %>",

            // Function - Will fire on animation progression.
            onAnimationProgress: function(){},

            // Function - Will fire on animation completion.
            onAnimationComplete: function(){},

            /* Line graph specific options*/

            //Boolean - Whether grid lines are shown across the chart
            scaleShowGridLines : true,

            //String - Colour of the grid lines
            scaleGridLineColor : "rgba(0,0,0,.05)",

            //Number - Width of the grid lines
            scaleGridLineWidth : 1,

            //Boolean - Whether the line is curved between points ** CHANGED
            bezierCurve : true,

            //Number - Tension of the bezier curve between points **CHANGED
            bezierCurveTension : 1,

            //Boolean - Whether to show a dot for each point
            pointDot : false,

            //Boolean - Whether to show a stroke for datasets
            datasetStroke : true,

            //Number - Pixel width of dataset stroke
            datasetStrokeWidth : 3, //changed

            //Boolean - Whether to fill the dataset with a colour
            datasetFill : false,

            //String - A legend template
            legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].lineColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"
      };

      // Create chart
      $scope.chart = {
        labels : forecastData.map(function(forecast) {
          return '';
        }),
        datasets : [
          {
            strokeColor : "rgba(255,255,255,0.8)",
            data : forecastData.map(function(forecast) {
              return forecast.solidRating;
            })
          }
        ]
      };

      console.log($scope.chart);



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