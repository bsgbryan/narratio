(function ($) {
  function resizeTextarea() {
    var newContent = $('.new.content');
    function resize () {
      var rows = Math.ceil(newContent.val().length / 50)
      var nls  = newContent.val().split("\n")

      if (nls.length > 1 && (newContent.val()[0] === '-' || parseInt(newContent.val()[0]) !== NaN) && nls.length > rows)
        rows = nls.length

      newContent.css('height', (rows < 2 ? '1.3em' : 'auto'))
      newContent.attr('rows', rows)
    }
    /* 0-timeout to get the already changed text */
    function delayedResize () {
        window.setTimeout(resize, 0);
    }
    newContent.on('change',  resize);
    newContent.on('cut',     delayedResize);
    newContent.on('paste',   delayedResize);
    newContent.on('drop',    delayedResize);
    newContent.on('keydown', delayedResize);

    newContent.focus();
    newContent.select();
    resize();
  }

  $(document).ready(function() {
    resizeTextarea()

    $('.new.content').on('keyup', function (event) {
      console.log($(this).val().lastIndexOf("\n\n"))
      console.log($(this).val().length - 2)
      if (event.keyCode === 13 && $(this).val().lastIndexOf("\n\n") === $(this).val().length - 2) {
        var content = new Showdown.
          converter().
          makeHtml($(this).val())

        $(this).
          before(content).
          val('').
          trigger('change')
      }
    })
  })
})($)