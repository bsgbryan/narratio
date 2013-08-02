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
  res.render('index', { layout: false })
})

app.listen(port, function() {
  console.log('What up, world!? I be at port ' + port + '... get at me!')
})