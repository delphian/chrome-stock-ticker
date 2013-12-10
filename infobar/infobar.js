

alert('hi');
chrome.storage.local.get(['symbols', 'tickerbar'], function(result) {
	console.log(result.symbols, result.tickerbar);
    alert('again');
});

