$(document).ready(function() {
  $.getJSON('/blog.post/read/0', function(p) {
    var post = JSON.parse(p)

    $('#post').
      html(new Showdown.converter().makeHtml(post.content)).
      prepend('<h1>' + post.title + '</h1>')
  })
})