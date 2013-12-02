
// Expose local javascript as an API to other tabs, popup, and background pages.
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) { 
    if (request.method == 'getGSTResource') {
    	var resource = JSON.parse(localStorage['resource']);
    	sendResponse({status: 1, resource: resource});
    }
    if (request.method == 'saveGSTResource') {
    	localStorage['resource'] = request.resource;
    }
});
