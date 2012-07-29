$(document).ready(function() {
  $('#post').on('click', '.preview', function() {
    var title   = $('.title').val(),
        content = $('.content').val()

    $('#post').addClass('hidden')

    var preview = new Showdown.
      converter().
      makeHtml(content)

    $('#preview').
      html(preview).
      prepend('<h1>' + title + '</h1>').
      prepend('<ul class="supplemental">' +
        '<li>' +
          // '<img src="http://timeentertainment.files.wordpress.com/2012/04/brave.jpg">' +
        '</li>' +
      '</ul>').
      find('p > br').
      remove().
    end().
      removeClass('hidden')

    $('#back').removeClass('hidden')

    return false
  })

  $('#back').on('click', function() {
    $('#preview').addClass('hidden')
    $('#back').addClass('hidden')
    $('#post').removeClass('hidden')
  })

  $('.title').val($('#title').text())
  $('.content').val($('#content').text())
})