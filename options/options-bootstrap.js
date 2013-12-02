
$(document).ready(function() {
console.log('ready');
    $('#mainNav a').click(function (e) {
        e.preventDefault()
        $(this).tab('show')
    })
})
