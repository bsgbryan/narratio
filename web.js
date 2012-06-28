var express = require('express'),
    app     = express.createServer(express.logger()),
    sha1    = require('sha1')

// Production
if (process.env.REDISTOGO_URL) 
  var redis = require('redis-url').connect(process.env.REDISTOGO_URL)
// Development
else 
  var redis = require('redis').createClient()

app.configure(function () {
  app.use(express.methodOverride());
  app.use(express.bodyParser());
  app.use(app.router);
  app.use(express.static('public'));
  
  app.set('views', 'views');
  app.set('view engine', 'jade');
});

app.get('/', function(req, res) {
  redis.lrange('blog.posts', 0, 0, function(err, data) {
    res.render('read', { action : 'read' , post: data })
  })
})

app.get('/delete/:collection', function(req, res) {
  redis.del(req.param('collection'), function(err, data) {
    if (err)
      res.status(500, err)
    else 
      res.status(200, 'deleted')

    res.end()
  })
})

app.get('/read/:post', function(req, res) {
  redis.hgetall(':post:' + req.param('post'), function(err, data) {
    res.render('read', { action : 'read' , post : data })
  })
})

app.get('/write', function(req, res) {
  res.render('write', { action : 'write' })
})

app.get('/edit/:post', function(req, res) {
  redis.hgetall(':post:' + req.param('post'), function(err, data) {
    res.render('write', { action : 'write' , post : data })
  })
})

app.post('/post/publish', function(req, res) {
  var post = { 
    title     : req.body.title, 
    content   : req.body.content,
    published : new Date()
  }

  var status = redis.hmset(':post:' + post.title.toLowerCase().replace(/\s/g, '-'), post)

  res.send(status)
})

var port = process.env.PORT || 3000

app.listen(port, function() {
  console.log("Listening on " + port)
})