
// Expose local javascript as an API to other tabs, popup, and background pages.
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) { 
    if (request.method == 'getGSTResource') {
        var resource = JSON.parse(localStorage['resource']);
        sendResponse({status: 1, resource: resource});
    }
    if (request.method == 'getGSTOptions') {
        var resource = undefined;
        var patterns = undefined;
        try { resource = JSON.parse(localStorage['resource']); } catch (err) {}
        try { patterns = JSON.parse(localStorage['patterns']); } catch (err) {}
        sendResponse( {status: 1, resource: resource, patterns: patterns} );
    }
});
