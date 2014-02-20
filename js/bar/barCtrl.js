
cstApp.controller('bar', function($scope) {
    /**
     * Provided by directive:
     * $scope.variable: (string) comma deliniated list of variables.
     * $scope.orient: (string) orientation of bar, possible values are:
     *   'vertical', 'horizontal'.
     */
    $scope.variables = $scope.variable.split(',');
    $scope.addVariable = '';
    // Used in template for cst-variable property value.
    $scope.headers = ($scope.orient == 'horizontal') ? true : false;

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
    $scope.remove = function(index) {
        $scope.variables.splice(index, 1);
    }
});
