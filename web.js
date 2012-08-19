var express = require('express'),
    app     = express.createServer(express.logger()),
    port    = process.env.PORT || 3000

app.configure(function () {
  app.use(express.methodOverride());
  app.use(express.bodyParser());
  app.use(app.router);
  app.use(express.static('public'));
  
  app.set('views', 'views');
  app.set('view engine', 'jade');
});

app.get('/', function(req, res) {
  var host   = '',
      scribo = ''
  
  console.log('req', req)
  
  if (req.headers.host.indexOf('localhost') === 0) {
    host   = 'localhost:' + port
    scribo = 'scribo.jit.su'
  } else {
    host   = req.headers.host
    scribo = 'project-livec9a3f7456521.rhcloud.com'
  }
    
  res.render('index', { layout: false, host: host, scribo: scribo })
})

app.listen(port, function() {
  console.log("Listening on " + port)
})