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

app.get('/create/:resource', function (req, res) {
  res.render('index', { layout: false })
})

app.get('/read/:post', function (req, res) {
  res.render('index', { layout: false })
})

app.get('/edit/:post', function (req, res) {
  res.render('index', { layout: false })
})

app.get('/delete/:resource', function (req, res) {
  res.render('index', { layout: false })
})

app.get('/read/partials/:action', function (req, res) {
  res.render('partials/:action', { layout: false })
})

app.get('/manage/:resource', function (req, res) {
  res.render('index', { layout: false })
})

// app.get('/:resource', function (req, res) {
//   res.render('/:resource', { layout: false })
// })

app.listen(port, function() {
  console.log('What up, world!? I be at port ' + port + '... get at me!')
})