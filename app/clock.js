angular.module('snowmentum')

.controller('ClockController', function($scope) {
  var date = new Date();
  $scope.time = date.getHours() + ":" + date.getMinutes();
});