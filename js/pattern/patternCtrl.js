
cstApp.controller('patternsConfig', ['$scope', 'resource', 'patterns', function($scope, resource, patterns) {
    // Provide some default patterns.
    $scope.patterns = patterns.getData();
    $scope.export = { pretty: false };
    $scope.addPattern = { regex: '', modifiers: '', result: '' };

    $scope.$on('patternsUpdate', function(event, data) {
        $scope.patterns = patterns.getData();
        if (data.apply) $scope.$apply();
    });
    $scope.add = function() {
        var result = patterns.addItem({
            regex: $scope.addPattern.regex,
            options: $scope.addPattern.modifiers,
            result: $scope.addPattern.result
        });
        if (!result.success) {
            $('#saveConfirmPatterns').html('<div class="alert alert-danger"><a class="close" data-dismiss="alert">x</a>Failed to add pattern: '+result.message+'</div>');
        } else {
            $scope.addPattern = { regex: '', modifiers: '', result: '' };
        }
    };
    $scope.remove = function(index) {
        patterns.removeItem(index);
    };
    $scope.export = function() {
        var patternsObject = JSON.stringify(patterns.getData(), null, ($scope.export.pretty * 4));
        $('.cst-patterns-config .cst-import-export textarea').val(patternsObject);
    }
    $scope.save = function() {
        var result = patterns.setPatterns($scope.patterns);
        if (result.success) {
            patterns.save(function(result) {
                if (result.success) {
                    $('#saveConfirmPatterns').html('<div class="alert alert-success"><a class="close" data-dismiss="alert">x</a>Saved!</div>');
                } else {
                    $('#saveConfirmPatterns').html('<div class="alert alert-danger"><a class="close" data-dismiss="alert">x</a>Failed to save: '+result.message+'</div>');
                }
            });
        } else {
            $('#saveConfirmPatterns').html('<div class="alert alert-danger"><a class="close" data-dismiss="alert">x</a>Failed to save: '+result.message+'</div>');
        }
    };

}]);
