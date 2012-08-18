(function ($) {
  var months = [ 'jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec' ]
  
  $.fn.noisy = function(opacity) {
    if (typeof(opacity) === 'undefined')
        opacity = 0.25

    var canvas = document.createElement('canvas')
    
    canvas.width  = 100
    canvas.height = 100
    
    var ctx   = canvas.getContext('2d'),
        red   = [ 207, 211, 215, 219, 223 ],
        green = [ 211, 215, 219, 223, 227 ],
        blue  = [ 216, 220, 224, 228, 232 ]

    for (x = 0; x < canvas.width; x += 1) {
      for (y = 0; y < canvas.height; y += 1) {
        var boson = Math.random(),
            r, g, b

        if (boson < 0.19) {
          r = red[0]
          g = green[0]
          b = blue[0]
        } else if (boson < 0.39) {
          r = red[1]
          g = green[1]
          b = blue[1]
        } else if (boson < 0.59) {
          r = red[2]
          g = green[2]
          b = blue[2]
        } else if (boson < 0.79) {
          r = red[3]
          g = green[3]
          b = blue[3]
        } else {
          r = red[4]
          g = green[4]
          b = blue[4]
        }

          ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + opacity + ')'
          ctx.fillRect(x, y, 1, 1)
      }
    }

    $(this).css({
      'background-image': 'url(' + canvas.toDataURL('image/png') + ')',
      width: '100%',
      height: '100%'
    });
  };

  $(document).ready(function () {
    $('html').noisy(1)
    
    var date   = new Date(),
        bucket = date.getFullYear() + '-' + months[date.getMonth()] + '-' + date.getDate()
    
    $.scribo(bucket).content('#post')
  })
})($)