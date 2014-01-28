
cstApp.factory('resource', function($rootScope) {
    var container = {};
    container.resource = {};

    container.getResource = function() {
        chrome.storage.sync.get(['resource'], function(result) {
            if (chrome.runtime.lastError) {
                console.log('Could not load resource from chrome storage: ' + chrome.runetime.lastError.message);
            } else {
                container.setResource(result['resource']);
            }
        });
    };

    container.setResource = function(resource) {
        container.resource = resource;
        container.broadcastResource();
    }

    container.broadcastResource = function() {
        $rootScope.$broadcast('resourceUpdate');
    }

    container.getResource();
  
    return container;
});
