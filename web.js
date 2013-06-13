var express = require('express'),
    app     = express(),
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
  var host = 'http://'
  
  if (req.headers.host.indexOf('localhost') === 0)
    host += 'localhost:' + port
  else
    host = req.headers.host
    
  res.render('index', { layout: false, base: host })
})

app.listen(port, function() {
  console.log('What up, world!? I be at: port ' + port + '... get at me!')
})