var express = require('express'),
    redis   = require('redis-url').connect(process.env.REDISTOGO_URL),
    app     = express.createServer(express.logger())

app.configure(function () {
  app.use(express.methodOverride());
  app.use(express.bodyParser());
  app.use(app.router);
  app.use(express.static('public'));
  
  app.set('views', 'views');
  app.set('view engine', 'jade');
});

app.get('/', function(req, res) {
  var last = redis.get('posts')

  res.render('index')
})

app.get('/:id', function(req, res) {
  var id   = req.params('id'),
      post = redis.get('post-' + id)
      
  res.contentType('text/plain')
  res.send(post)
})

app.get('new', function(req, res) {
  res.render('create')
})

app.post('new', function(req, res) {
  var index = redis.incr('posts')

  redis.set('post-' + index, req.body.content)

  res.send()
})

var port = process.env.PORT || 3000

app.listen(port, function() {
  console.log("Listening on " + port)
})