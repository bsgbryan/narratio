$(document).ready(function() {
  $('#post').
    html(new Showdown.converter().makeHtml($('#content').text())).
    prepend('<h1>' + $('#title').text() + '</h1>')
})