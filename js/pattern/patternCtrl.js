
cstApp.controller('patternConfig', ['$scope', 'resource', function($scope, resource) {
    // Provide some default patterns.
    $scope.patterns = [];
    // Update the pattern from local storage on first load.
    chrome.storage.sync.get('patterns', function(result) {
        if (typeof(result['patterns']) != 'undefined') {
            $scope.patternUpdate(result.patterns);
        }
    });
    // Update the patterns and force resync between model and html anytime
    // the stored object is updated from anywhere.
    chrome.storage.onChanged.addListener(function(object, namespace) {
        for (key in object) {
            if (key == 'patterns') {
                $scope.patternUpdate(object.patterns.newValue);
            }
        }
    });
    // Update the model and force resync between model and html.
    $scope.patternUpdate = function(patterns) {
        $scope.patterns = patterns;
        $scope.$apply();
    };
    $scope.patternAdd = function() {
        $scope.patterns.push({ pattern: '', options: 'g', result: 1 });
    };
    $scope.patternRemove = function(index) {
        $scope.patterns.splice(index, 1);
    };
    $scope.save = function() {
        // Remove angular hashes but store result as an object.
        var patterns = JSON.parse(angular.toJson($scope.patterns));
        chrome.storage.sync.set( {'patterns': patterns} , function() {
            if (chrome.runtime.lastError) {
                // Notify that we failed.
                $('#saveConfirmPatterns').html('<div class="alert alert-danger"><a class="close" data-dismiss="alert">x</a>Failed to save: '+chrome.runtime.lastError.message+'</div>');
            } else {
                // Notify that we saved.
                $('#saveConfirmPatterns').html('<div class="alert alert-success"><a class="close" data-dismiss="alert">x</a>Saved!</div>');
            }
        });
    };
}]);
