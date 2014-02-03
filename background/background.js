
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension");
    if (request.method == "load_js") {
        chrome.tabs.executeScript(null, { file: request.file } );
        sendResponse( { status: 1 } );
    }
});

// Insert some default data into the resource and patterns
$('document').ready(function() {
    chrome.storage.sync.get(['patterns', 'tickerbar'], function(result) {
        if (chrome.runtime.lastError) {
            console.log('Could not check for previously stored data: ' + chrome.runetime.lastError.message);
        }
        if (typeof(result.patterns) == 'undefined' &&
            typeof(result.tickerbar) == 'undefined') {
            $.get(chrome.extension.getURL('data/reset.json'), {}, function(data) {
                var blob = JSON.parse(data);
                chrome.storage.sync.set({ tickerbar: blob.tickerbar, patterns: blob.patterns }, function() {
                    if (chrome.runtime.lastError) {
                        console.log('Could not import default values: ' + chrome.runetime.lastError.message);
                    }
                });
            });
        }
    });
});
 