$(document).ready(function() {
  $('#post').
    html(new Showdown.converter().makeHtml($('#content').text())).
    prepend('<h1>' + $('#title').text() + '</h1>').
    prepend('<ul class="supplemental">' +
      '<li>' +
        // '<img src="http://timeentertainment.files.wordpress.com/2012/04/brave.jpg">' +
      '</li>' +
    '</ul>')
})