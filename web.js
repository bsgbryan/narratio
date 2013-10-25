var express = require('express'),
    app     = express(),
    port    = process.env.PORT || 3000

var FirebaseTokenGenerator = require('firebase-token-generator'),
    tokenGenerator         = new FirebaseTokenGenerator('bqJRRz4BVrZJB8rQOq7Otq9Cb91GADldIU909aZH')

app.configure(function () {
  app.use(express.methodOverride());
  app.use(express.bodyParser());
  app.use(app.router);
  app.use(express.static('public'));
  
  app.set('views', 'views');
  app.set('view engine', 'jade');
});

app.get('/', function(req, res) {
  res.render('index')
})

app.get('/create/:resource', function (req, res) {
  res.redirect('/')
})

app.get('/read/:post', function (req, res) {
  res.redirect('/')
})

app.get('/edit/:post', function (req, res) {
  res.redirect('/')
})

app.get('/delete/:resource', function (req, res) {
  res.redirect('/')
})

app.get('/read/partials/:action', function (req, res) {
  res.redirect('/')
})

app.get('/manage/:resource', function (req, res) {
  res.redirect('/')
})

app.post('/author', function (req, res) {
  res.send(tokenGenerator.createToken({ id: req.param('id'), contexts: req.param('contexts') }))
})

// app.get('/:resource', function (req, res) {
//   res.render('/:resource', { layout: false })
// })

app.listen(port, function() {
  console.log('What up, world!? I be at port ' + port + '... get at me!')
})