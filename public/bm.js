$(document).ready(function() {
  $.get('/post/0', function(post) {
    $('.post').append(new Showdown.converter().makeHtml(post))
  })
})