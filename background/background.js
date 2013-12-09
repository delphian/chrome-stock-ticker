
// Insert some default data into the resource and patterns
$('document').ready(function() {
    chrome.storage.sync.get(['resource', 'patterns', 'tickerbar'], function(result) {
        if (chrome.runtime.lastError) {
            console.log('Could not check for previously stored data: ' + chrome.runetime.lastError.message);
        }
        if (typeof(result.resource) == 'undefined' &&
            typeof(result.patterns) == 'undefined' &&
            typeof(result.tickerbar) == 'undefined') {
            $.get(chrome.extension.getURL('data/reset.json'), {}, function(data) {
                var blob = JSON.parse(data);
                chrome.storage.sync.set({ resource: blob.resource, tickerbar: blob.tickerbar, patterns: blob.patterns }, function() {
                    if (chrome.runtime.lastError) {
                        console.log('Could not import default values: ' + chrome.runetime.lastError.message);
                    }
                });
            });
        }
    });
});
 