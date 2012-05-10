$(document).ready(function() {
  $.get('/blog.post/read/0', function(post) {
    $('.post').append(new Showdown.converter().makeHtml(post))
  })
})