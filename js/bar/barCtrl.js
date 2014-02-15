
cstApp.controller('bar', function($scope) {
    $scope.variables = $scope.variable.split(',');
    $scope.addVariable = '';

    $scope.prev = function() {
        $scope.variables.unshift($scope.variables.pop());
    };
    $scope.next = function() {
        $scope.variables.push($scope.variables.shift());
    };
    $scope.add = function(variable) {
    	$scope.variables.push(variable.toUpperCase());
        $scope.addVariable = '';
    };
});
