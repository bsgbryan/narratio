(function ($) {
  var months   = [ 'jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec' ],
      contents = { }
  
  function resizeTextarea(content) {
    var newContent = $(content)
    
    function resize () {
      var rows = Math.ceil(newContent.val().length / 50)
      var nls  = newContent.val().split("\n")

      if (nls.length > 1 && (newContent.val()[0] === '-' || !isNaN(newContent.val()[0])) && nls.length > rows)
        rows = nls.length
      else if (newContent.val()[newContent.val().length - 1] === "\n")
        ++rows

      newContent.css('height', (rows < 2 ? '1.3em' : 'auto'))
      newContent.attr('rows', rows)
    }
    /* 0-timeout to get the already changed text */
    function delayedResize () {
        window.setTimeout(resize, 0)
    }
    newContent.on('change',  resize)
    newContent.on('cut',     delayedResize)
    newContent.on('paste',   delayedResize)
    newContent.on('drop',    delayedResize)
    newContent.on('keydown', delayedResize)

    newContent.focus()
    newContent.select()
    resize()
  }

  $(document).ready(function() {
    resizeTextarea('.new.content')
        
    var date      = new Date(),
        stamp     = date.getFullYear() + '-' + months[date.getMonth()] + '-' + date.getDate(),
        host      = window.location.host.replace(/\W/g, '-'),
        url       = 'https://gamma.firebase.com/bsgbryan/aioim/' + host + '/' + stamp, 
        firebase  = new Firebase(url)

    firebase.on('child_added', function (data) {
      var content = new Showdown.
        converter().
        makeHtml(data.val().content)
        
      $('.new.content').
        before(content).
        prev().
        append('<a href="' + url + '/' + data.name() + '" data-edit="' + data.name() + '" class="edit content">&</a>').
        attr('id', data.name())
      
      contents[data.name()] = data.val()
    })

    $('.new.content').on('keyup', function (event) {
      if (event.keyCode === 13 && $(this).val().lastIndexOf("\n\n") === $(this).val().length - 2) {
        firebase.push({ content: $(this).val() })

        $(this).
          val('').
          trigger('change')
      }
    })
    
    $('#post').on('click', '.edit.content', function (event) {
      var e = $(event.currentTarget)
      e.parent().replaceWith('<textarea id="' + e.data('edit') + '-editor" class="content editor">' + contents[e.data('edit')].content + '</textarea>')
      resizeTextarea('#' + e.data('edit') + '-editor')
      
      $('#' + e.data('edit') + '-editor').on('keyup', function (event) {
        if (event.keyCode === 13 && $(this).val().lastIndexOf("\n\n") === $(this).val().length - 2) {
          var id      = e.data('edit'),
              value   = $(this).val(),
              prose   = new Showdown.
                converter().
                makeHtml(value)
          
          firebase.
            child(id).
            set({ 
              content: value
            })
          
          $(this).replaceWith($(prose).attr('id', id))
          
          $('#' + id).
            append('<a href="' + url + '/' + id + '" data-edit="' + id + '" class="edit content">&</a>').
            attr('id', id)
          
          contents[id] = { content: value }
        }
      })
      
      return false
    })
  })
})($)