
chrome.commands.onCommand.addListener(function(command){
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, {command: "cst_show_ticker_bar"}, function(response) {
            // Ignore all responses.
        });
    });
});
