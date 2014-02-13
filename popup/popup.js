
$(document).ready(function() {
    $('div#advanced a').click(function() {
        chrome.tabs.create({url: "options/options.html"});
    });
});
